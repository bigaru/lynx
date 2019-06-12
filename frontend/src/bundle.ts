import speakeasy from 'speakeasy'
import * as pgp from 'openpgp'
import fs from 'fs'
import { machineIdSync } from 'node-machine-id'

interface Memo{
    _id: string,
    name: string,
    content: string
}

const machineId = machineIdSync(true)
let privKeyObj: pgp.key.Key
let keyPath: string
let plainTotp: string
let loadedData: Memo[]

let host = localStorage.getItem('host')
const encryptedTotp = localStorage.getItem('totp')

if (host) $('#host').val(host)
if (encryptedTotp) initTotp(encryptedTotp)

async function initTotp(encryptedTotp: string){
    const opt: pgp.DecryptOptions = { 
        message: await pgp.message.readArmored(encryptedTotp),
        passwords: machineId,
        format: 'utf8' 
    }
    
    plainTotp = (await pgp.decrypt(opt)).data as string
    $('#totp').val(plainTotp)
}

function loadMemos(data: Memo[]){
    $('#memos-body').html("")

    loadedData = data
    let i = 0

    for(let d of data){
        $('#memos-body').append(`
        <tr>
            <td>${d._id}</td>
            <td>${d.name}</td>
            <td>
                <button type="button" class="btn btn-outline-info" onclick="decryptPost(${i})">
                    Decrypt
                </button>
            </td>
        </tr>
        `)
        
        i++;
    }
}

async function decryptPost(idx: number){
    const post = loadedData[idx] 
    const decOpt: pgp.DecryptOptions = {
        message: await pgp.message.readArmored(post.content),
        privateKeys: [privKeyObj],
        format: 'binary'
    }
    const plaintext = (await pgp.decrypt(decOpt)).data as Uint8Array;
    download(plaintext, post.name)
}

function download(binary: Uint8Array, filename: string){
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([binary]));
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
}

async function signDetached(plaintext: string){
    const key = $('#privateKey').prop('files')[0]

    if(!privKeyObj || keyPath !== key.path){
        keyPath = key.path
        const privKey = fs.readFileSync(keyPath, 'utf8')
        privKeyObj = (await pgp.key.readArmored(privKey)).keys[0];

        const passphrase = $('#password').val() as string
        await privKeyObj.decrypt(passphrase);
    }

    const options = {
        message: pgp.message.fromText(plaintext),
        privateKeys: [privKeyObj],
        armor: true,
        detached: true,
    };
    
    const sig = (await pgp.sign(options)).signature as string
    const sigWithoutSpace = sig.replace(/[\r\n\t\f\v]/g,'')
    const match = sigWithoutSpace.match(/org([^-]*)/)!

    return match[1];
}

function getToken(){
    return speakeasy.totp({ secret: plainTotp, encoding: 'base32'})
}

async function getAuthorization(){
    const token = getToken()
    const signature = await signDetached(token)
    
    return token + "." + signature
}

function makeRequest(authToken: string){
    const headers = new Headers()
    headers.append('Authorization', authToken)
    const getMemos = new Request(host + '/memos/', { method: 'GET', headers: headers })
    
    fetch(getMemos).then(res => {    
        if(res.ok) res.json().then(loadMemos)    
    })
}

function loadData(){
    const URL = $('#host').val() as string
    const shared_totp = $('#totp').val() as string
    
    if(URL !== host) {
        host = URL
        localStorage.setItem('host', URL)
    }

    if(shared_totp !== plainTotp) {
        plainTotp = shared_totp
        const opt = {
            message: pgp.message.fromText(shared_totp),
            passwords: machineId,
            armor: true
        }

        pgp.encrypt(opt).then((encryptedTotp) => {
            localStorage.setItem('totp', encryptedTotp.data as string)
        })
    }

    getAuthorization()
    .then(makeRequest)
    .then(() => $('#memos-tab').tab('show'))
}

$(".custom-file-input").on("change", function() {
    const fileName = ($(this).val()! as string).split("\\").pop()!
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName)
})
