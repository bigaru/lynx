window.$ = window.jQuery = require('jquery')
window.Bootstrap = require('bootstrap')
const speakeasy = require('speakeasy')
const openpgp = require('openpgp')
const fs = require('fs')
const { machineIdSync } =  require('node-machine-id')

const machineId = machineIdSync({original: true})
let privKeyObj, keyPath, host, totp, loadedData

host = localStorage.getItem('host')
$('#host').val(host)
initTotp(localStorage.getItem('totp'))

async function initTotp(encryptedTotp){
    const opt = { 
        message: await openpgp.message.readArmored(encryptedTotp),
        passwords: machineId,
        format: 'utf8' 
    }
    
    const plainTotp = (await openpgp.decrypt(opt)).data
    totp = plainTotp
    $('#totp').val(plainTotp)
}

function loadMemos(data){
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

async function decryptPost(idx){
    const post = loadedData[idx] 
    const decOpt = {
        message: await openpgp.message.readArmored(post.content),
        privateKeys: [privKeyObj],
        format: 'binary'
    }
    const plaintext = (await openpgp.decrypt(decOpt)).data;
    download(plaintext, post.name)
}

function download(binary, filename){
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([binary]));
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
}

async function signDetached(plaintext){
    const key = $('#privateKey').prop('files')[0]

    if(!privKeyObj || keyPath !== key.path){
        keyPath = key.path
        const privKey = fs.readFileSync(keyPath, 'utf8')
        privKeyObj = (await openpgp.key.readArmored(privKey)).keys[0];

        const passphrase = $('#password').val()
        await privKeyObj.decrypt(passphrase);
    }

    const options = {
        message: openpgp.message.fromText(plaintext),
        privateKeys: [privKeyObj],
        armor: true,
        detached: true,
    };
    
    const sig = (await openpgp.sign(options)).signature
    const sigWithoutSpace = sig.replace(/[\r\n\t\f\v]/g,'')
    const match = sigWithoutSpace.match(/org([^-]*)/)

    return match[1];
}

function getToken(){
    return speakeasy.totp({ secret: totp, encoding: 'base32'})
}

async function getAuthorization(){
    const token = getToken()
    const signature = await signDetached(token)
    
    return token + "." + signature
}

function makeRequest(authToken){
    const headers = new Headers()
    headers.append('Authorization', authToken)
    const getMemos = new Request(host + '/memos/', { method: 'GET', headers: headers })
    
    fetch(getMemos).then(res => {    
        if(res.ok) res.json().then(loadMemos)    
    })
}

function loadData(){
    const URL = $('#host').val()
    const shared_totp = $('#totp').val()
    
    if(URL !== host) {
        host = URL
        localStorage.setItem('host', URL)
    }

    if(shared_totp !== totp) {
        totp = shared_totp
        const opt = {
            message: openpgp.message.fromText(shared_totp),
            passwords: machineId,
            armor: true
        }

        openpgp.encrypt(opt).then((encryptedTotp) => {
            localStorage.setItem('totp', encryptedTotp.data)
        })
    }

    getAuthorization()
    .then(makeRequest)
    .then(() => $('#memos-tab').tab('show'))
}

$(".custom-file-input").on("change", function() {
    var fileName = $(this).val().split("\\").pop()
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName)
})
