const gulp = require('gulp');
const chmod = require('gulp-chmod');
const fs = require('fs-extra')

function clean(cb){
    fs.removeSync(__dirname + '/dist')

    cb()
}
 
function makeExec(cb){
    gulp.src('./dist/app.js')
        .pipe(chmod({
            owner: {execute: true}
        }))
        .pipe(gulp.dest('./dist'))

    cb()
};

exports.clean = clean
exports.makeExec = makeExec