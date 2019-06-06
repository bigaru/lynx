const express = require('express')
const fs = require('fs')

const app = express()
const port = 3000

const baseLogic = fs.readFileSync('cryptoBase.js', 'utf8')
const pubKey = fs.readFileSync('pub.asc', 'utf8')
const cryptoJsData = 'const pub_pgp = `' + pubKey + '`; \n' + baseLogic

fs.writeFileSync('public/js/crypto.js', cryptoJsData)

app.use(express.static('public'))

app.get('/', (req, res) => res.sendFile('index.html'))

app.all("/*",(req, res) => {
    res.status(400)
    res.send()
})

app.listen(port, () => console.log(`app listening on port ${port}!`))