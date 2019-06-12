const gulp = require('gulp');
const fs = require('fs')

function importKey (cb) {
    const pubKey = fs.readFileSync(__dirname + '/src/public/publicKey.asc', 'utf8')
    const baseLogic = fs.readFileSync(__dirname + '/src/public/js/clientBase.js', 'utf8')
    const bundleData = 'const pub_pgp = `' + pubKey + '`; \n' + baseLogic

    createDirIfMissing(__dirname + '/dist/')
    createDirIfMissing(__dirname + '/dist/public/')
    createDirIfMissing(__dirname + '/dist/public/js/')

    fs.writeFileSync(__dirname + '/dist/public/js/bundle.js', bundleData)

    cb()
}

function createDirIfMissing(path){
    if (!fs.existsSync(path)) fs.mkdirSync(path)
}

function copyAssets(cb) {
    gulp.src('./src/public/*').pipe(gulp.dest('./dist/public/'))
    
    cb()
}

exports.default = gulp.series(importKey, copyAssets)