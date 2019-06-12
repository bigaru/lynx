const gulp = require('gulp')
const terser = require('gulp-terser')
const fs = require('fs-extra')

function clean(cb){
    fs.removeSync(__dirname + '/dist')

    cb()
}

function importKey (cb) {
    const pubKey = fs.readFileSync(__dirname + '/src/public/publicKey.asc', 'utf8')
    const baseLogic = fs.readFileSync(__dirname + '/src/public/js/clientBase.js', 'utf8')
    const bundleData = 'const pub_pgp = `' + pubKey + '`; \n' + baseLogic

    fs.ensureDirSync(__dirname + '/dist/public/js/')
    fs.writeFileSync(__dirname + '/dist/public/js/bundle.js', bundleData)

    cb()
}

function uglifyClient(cb){
    gulp.src('./dist/public/js/bundle.js')
        .pipe(terser())
        .pipe(gulp.dest('./dist/public/js'))
    
    cb()
}

function copyAssets(cb) {
    gulp.src('./src/public/*').pipe(gulp.dest('./dist/public/'))

    cb()
}

exports.default = gulp.series(clean, importKey, uglifyClient, copyAssets)