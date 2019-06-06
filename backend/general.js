const fs = require('fs')

function addKeyInJS(){
    const baseLogic = fs.readFileSync('cryptoBase.js', 'utf8')
    const pubKey = fs.readFileSync('publicKey.asc', 'utf8')
    const cryptoJsData = 'const pub_pgp = `' + pubKey + '`; \n' + baseLogic
    fs.writeFileSync('public/js/crypto.js', cryptoJsData)
}

module.exports = { insertPublicKeyInJS:addKeyInJS }