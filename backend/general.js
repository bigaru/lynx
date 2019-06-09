const fs = require('fs')

function addKeyInJS(pubKey){
    const baseLogic = fs.readFileSync('cryptoBase.js', 'utf8')
    const cryptoJsData = 'const pub_pgp = `' + pubKey + '`; \n' + baseLogic
    fs.writeFileSync('public/js/crypto.js', cryptoJsData)
}

module.exports = { insertPublicKeyInJS:addKeyInJS }