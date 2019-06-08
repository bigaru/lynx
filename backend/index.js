const mongoService = require('./mongoService.js')
const general = require('./general.js')
const express = require('express')
const speakeasy = require("speakeasy")

const app = express()
const port = process.env.PORT || 3000
general.insertPublicKeyInJS()

const shared_totp = process.env.TOTP_KEY || 'ig3t 76td vmok rffh iqgh 7kx5 kp2c ons6'

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

    const tokenValidates = speakeasy.totp.verify({
        secret: shared_totp,
        encoding: 'base32',
        token: req.header('Authorization'),
    });
    
    if (!tokenValidates) res.sendStatus(401)
    else {
        mongoService.getIncomings(result => {
            res.json(result)
        })
    }
})

app.all("/*",(req, res) => res.sendStatus(404))

app.listen(port, () => console.log(`app listening on port ${port}!`))
