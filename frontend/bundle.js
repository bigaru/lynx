window.$ = window.jQuery = require('jquery')
window.Bootstrap = require('bootstrap')
const speakeasy = require("speakeasy")
const openpgp = require('openpgp')

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

const shared_totp = 'ig3t 76td vmok rffh iqgh 7kx5 kp2c ons6'
const privkey = `-----BEGIN PGP PRIVATE KEY BLOCK-----
-----END PGP PRIVATE KEY BLOCK-----`
const passphrase = '---'

async function getSig(){
    const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0];
    await privKeyObj.decrypt(passphrase);

    const options = {
        message: openpgp.message.fromText('Hello, World!'),
        privateKeys: [privKeyObj],
        armor: true,
        detached: true,
    };
    
    let detachedSig = await openpgp.sign(options)
    console.log(detachedSig.signature)
}

function getToken(){
    getSig()
    return speakeasy.totp({ secret: shared_totp, encoding: 'base32'})
}

const headers = new Headers();
headers.append('Authorization', getToken());

const URL = 'http://localhost'
const getIncomings = new Request(URL + '/posts/', { method: 'GET', headers: headers })

fetch(getIncomings)
    .then(res => 
        res.json()
            .then(loadIncomings)
        )
