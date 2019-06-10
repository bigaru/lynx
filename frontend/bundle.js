window.$ = window.jQuery = require('jquery')
window.Bootstrap = require('bootstrap')
const speakeasy = require("speakeasy")
const openpgp = require('openpgp')
const fs = require('fs')

openpgp.initWorker({ path:'node_modules/openpgp/dist/openpgp.worker.min.js' })

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
    const keyPath = $('#privateKey').prop('files')[0].path
    const privKey = fs.readFileSync(keyPath, 'utf8')

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
    const shared_totp = $('#totp').val()
    return speakeasy.totp({ secret: shared_totp, encoding: 'base32'})
}

async function getAuthorization(){
    const token = getToken()
    const signature = await signDetached(token)
    
    return token + "." + signature
}

function makeRequest(authToken){
    const headers = new Headers()
    headers.append('Authorization', authToken)
    
    const URL = $('#host').val()
    const getIncomings = new Request(URL + '/posts/', { method: 'GET', headers: headers })
    
    fetch(getIncomings).then(res => {    
        if(res.ok) res.json().then(loadIncomings)    
    })
}

function loadData(){
    getAuthorization()
    .then(makeRequest)
    .then(() => $('#incoming-tab').tab('show'))
}


