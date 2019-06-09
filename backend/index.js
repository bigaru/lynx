const mongoService = require('./mongoService.js')
const general = require('./general.js')
const express = require('express')
const speakeasy = require("speakeasy")
const openpgp = require('openpgp')
const fs = require('fs')

openpgp.initWorker({ path:'node_modules/openpgp/dist/openpgp.worker.js' })

const app = express()
const port = process.env.PORT || 3000

const shared_totp = process.env.TOTP_KEY || 'ig3t 76td vmok rffh iqgh 7kx5 kp2c ons6'
const pubKey = fs.readFileSync('publicKey.asc', 'utf8')
general.insertPublicKeyInJS(pubKey)

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

app.use(express.json())
app.use(express.static('public'))
app.get('/', (req, res) => res.sendFile('index.html'))

app.post('/posts/', (req, res) => {
    const body = req.body
    
    if(!body || !body.name || !body.content) res.sendStatus(400)
    else{

        mongoService.addIncomings(body, result => {
            if(result.result.ok) res.status(201).send(body)
            else res.sendStatus(500)            
        })

    }
})

app.get('/posts/', (req, res) => {
    checkAuthToken(req.header('Authorization')).then(authValid => {
        if (!authValid) res.sendStatus(401)
        else {
            mongoService.getIncomings(result => {
                res.json(result)
            })
        }
    })
})

app.all("/*",(req, res) => res.sendStatus(404))

app.listen(port, () => console.log(`app listening on port ${port}!`))
