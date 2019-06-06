const fs = require('fs')

exports.insertPublicKeyinJS = function(){
    const baseLogic = fs.readFileSync('cryptoBase.js', 'utf8')
    const pubKey = fs.readFileSync('pub.asc', 'utf8')
    const cryptoJsData = 'const pub_pgp = `' + pubKey + '`; \n' + baseLogic
    fs.writeFileSync('public/js/crypto.js', cryptoJsData)
}
