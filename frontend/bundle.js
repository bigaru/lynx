window.$ = window.jQuery = require('jquery')
window.Bootstrap = require('bootstrap')
const speakeasy = require("speakeasy")
const openpgp = require('openpgp')
const fs = require('fs')

openpgp.initWorker({ path:'node_modules/openpgp/dist/openpgp.worker.min.js' })
let privKey, keyPath, host, totp

host = localStorage.getItem('host')
totp = localStorage.getItem('totp')

$('#host').val(host)
$('#totp').val(totp)

function loadIncomings(data){
    $('#incoming-body').html("")

    for(let d of data){
        $('#incoming-body').append(`
        <tr>
            <td>${d._id}</td>
            <td>${d.name}</td>
            <td></td>
        </tr>
        `)
    }
}

async function signDetached(plaintext){
    const key = $('#privateKey').prop('files')[0]

    if(!privKey || keyPath !== key.path){
        keyPath = key.path
        privKey = fs.readFileSync(keyPath, 'utf8')
    }

    const passphrase = $('#password').val()

    const privKeyObj = (await openpgp.key.readArmored(privKey)).keys[0];
    await privKeyObj.decrypt(passphrase);

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
    const getIncomings = new Request(host + '/posts/', { method: 'GET', headers: headers })
    
    fetch(getIncomings).then(res => {    
        if(res.ok) res.json().then(loadIncomings)    
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
        localStorage.setItem('totp', shared_totp)
    }

    getAuthorization()
    .then(makeRequest)
    .then(() => $('#incoming-tab').tab('show'))
}


