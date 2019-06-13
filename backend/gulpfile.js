const gulp = require('gulp')
const terser = require('gulp-terser')
const replace = require('gulp-replace')
const fs = require('fs-extra')

function clean(cb){
    fs.removeSync(__dirname + '/dist')

    cb()
}

function importKey (cb) {
    fs.ensureDirSync(__dirname + '/dist/public/js/')

    const pubKey = fs.readFileSync(__dirname + '/src/public/publicKey.asc', 'utf8')
    const pubKeyJs = 'const pub_pgp = `' + pubKey + '` \n'

    const anchor = "const pub_pgp = ''";
    gulp.src('./src/public/js/bundle.js')
        .pipe(replace(anchor, pubKeyJs))
        .pipe(terser())
        .pipe(gulp.dest('./dist/public/js'));

    cb()
}

function copyAssets(cb) {
    gulp.src('./src/public/*').pipe(gulp.dest('./dist/public/'))

    cb()
}

exports.clean = clean
exports.afterBurn = gulp.series(importKey, copyAssets)