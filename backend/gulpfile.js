const gulp = require('gulp')
const terser = require('gulp-terser')
const replace = require('gulp-replace')
const fs = require('fs-extra')

function clean(cb){
    fs.removeSync(__dirname + '/dist')

    cb()
}

function importKey (cb) {
    const pubKey = fs.readFileSync(__dirname + '/src/public/publicKey.asc', 'utf8')
    const pubKeyJs = 'var pub_pgp = `' + pubKey + '`; \n'

    const anchor = "var pub_pgp = '';";
    gulp.src('./dist/public/js/bundle.js')
        .pipe(replace(anchor, pubKeyJs))
        .pipe(terser())
        .pipe(gulp.dest('./dist/public/js'));

    cb()
}

function copyAssets(cb) {
    gulp.src('./src/public/*').pipe(gulp.dest('./dist/public/'))
    gulp.src('./src/assets/*').pipe(gulp.dest('./dist/assets/'))

    cb()
}

exports.clean = clean
exports.afterBurn = gulp.series(importKey, copyAssets)