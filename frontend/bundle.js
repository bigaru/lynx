window.$ = window.jQuery = require('jquery')
window.Bootstrap = require('bootstrap')
const speakeasy = require("speakeasy")
const openpgp = require('openpgp')
const fs = require('fs')

openpgp.initWorker({ path:'node_modules/openpgp/dist/openpgp.worker.js' })

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

const shared_totp = process.env.TOTP_KEY || 'ig3t 76td vmok rffh iqgh 7kx5 kp2c ons6'
const privKey = fs.readFileSync('privateKey.asc', 'utf8')
const passphrase = process.env.PASSPHRASE|| '---123'

async function signDetached(plaintext){
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
    
    const URL = 'http://localhost'
    const getIncomings = new Request(URL + '/posts/', { method: 'GET', headers: headers })
    
    fetch(getIncomings).then(res => {    
        if(res.ok) res.json().then(loadIncomings)    
    })
}

getAuthorization().then(makeRequest)


