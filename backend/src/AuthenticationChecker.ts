import fs from 'fs'
import * as pgp from 'openpgp'
import speakeasy from 'speakeasy'

export default class AuthenticationChecker{
    private pubKey: string
    private shared_totp = process.env.TOTP_KEY || 'ig3t 76td vmok rffh iqgh 7kx5 kp2c ons6'

    constructor(){
        pgp.initWorker({ path: '../node_modules/openpgp/dist/openpgp.worker.min.js' })
        this.pubKey = fs.readFileSync(__dirname + '/public/publicKey.asc', 'utf8')
    }

    private rectifyFormat = (rawSig: string) => 
`-----BEGIN PGP SIGNATURE-----

${rawSig}
-----END PGP SIGNATURE-----`

    private async checkSig(plaintext: string, rawSig: string){
        const detachedSig = this.rectifyFormat(rawSig)
        const options = {
            message: pgp.message.fromText(plaintext),
            signature: await pgp.signature.readArmored(detachedSig),
            publicKeys: (await pgp.key.readArmored(this.pubKey)).keys
        }

        return (await pgp.verify(options)).signatures[0].valid
    }

    private async checkToken(token: string){
        return speakeasy.totp.verify({ secret: this.shared_totp, encoding: 'base32', token })
    }

    async check(authToken: string){
        const authTokenSplit = authToken.split('.')

        if(authTokenSplit.length < 2) return false
        
        const [token, sig] = authTokenSplit
        const [tokenValid, sigValid] = await Promise.all([this.checkToken(token), this.checkSig(token, sig)])
        
        return tokenValid && sigValid
    }

}
