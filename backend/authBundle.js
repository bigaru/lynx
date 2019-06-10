const fs = require('fs')
const openpgp = require('openpgp')
const speakeasy = require('speakeasy')

openpgp.initWorker({ path:'node_modules/openpgp/dist/openpgp.worker.min.js' })

const shared_totp = process.env.TOTP_KEY || 'ig3t 76td vmok rffh iqgh 7kx5 kp2c ons6'
const pubKey = fs.readFileSync('publicKey.asc', 'utf8')

function addKeyInJS(){
    const baseLogic = fs.readFileSync('cryptoBase.js', 'utf8')
    const cryptoJsData = 'const pub_pgp = `' + pubKey + '`; \n' + baseLogic
    fs.writeFileSync('public/js/crypto.js', cryptoJsData)
}

const rectifyFormat = (rawSig) => 
`-----BEGIN PGP SIGNATURE-----

${rawSig}
-----END PGP SIGNATURE-----`

async function checkSig(plaintext, rawSig){
    const detachedSig = rectifyFormat(rawSig)
    const options = {
        message: openpgp.message.fromText(plaintext),
        signature: await openpgp.signature.readArmored(detachedSig),
        publicKeys: (await openpgp.key.readArmored(pubKey)).keys
    }

    return (await openpgp.verify(options)).signatures[0].valid
}

async function checkToken(token){
    return speakeasy.totp.verify({ secret: shared_totp, encoding: 'base32', token })
}

async function checkAuthToken(authToken){
    const [token, sig] = authToken.split('.')
    const [tokenValid, sigValid] = await Promise.all([checkToken(token), checkSig(token, sig)])
    
    return tokenValid && sigValid
}

module.exports = { insertPublicKeyInJS:addKeyInJS, checkAuthToken }