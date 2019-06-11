import fs from 'fs'
import * as pgp from 'openpgp'
import speakeasy from 'speakeasy'

pgp.initWorker({ path: '../node_modules/openpgp/dist/openpgp.worker.min.js' })

const shared_totp = process.env.TOTP_KEY || 'ig3t 76td vmok rffh iqgh 7kx5 kp2c ons6'
const pubKey = fs.readFileSync(__dirname + '/../public/js/publicKey.asc', 'utf8')

export function insertPublicKeyInJS(){
    const baseLogic = fs.readFileSync(__dirname + '/../public/js/cryptoBase.js', 'utf8')
    const cryptoJsData = 'const pub_pgp = `' + pubKey + '`; \n' + baseLogic
    fs.writeFileSync(__dirname + '/../public/js/crypto.js', cryptoJsData)
}

const rectifyFormat = (rawSig: string) => 
`-----BEGIN PGP SIGNATURE-----

${rawSig}
-----END PGP SIGNATURE-----`

async function checkSig(plaintext: string, rawSig: string){
    const detachedSig = rectifyFormat(rawSig)
    const options = {
        message: pgp.message.fromText(plaintext),
        signature: await pgp.signature.readArmored(detachedSig),
        publicKeys: (await pgp.key.readArmored(pubKey)).keys
    }

    return (await pgp.verify(options)).signatures[0].valid
}

async function checkToken(token: string){
    return speakeasy.totp.verify({ secret: shared_totp, encoding: 'base32', token })
}

export async function checkAuthToken(authToken: string){
    const authTokenSplit = authToken.split('.')
    
    if(authTokenSplit.length < 2) return false
    
    const [token, sig] = authTokenSplit
    const [tokenValid, sigValid] = await Promise.all([checkToken(token), checkSig(token, sig)])
    
    return tokenValid && sigValid
}
