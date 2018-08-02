const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
 
const paths = {
    entryPoint: 'styles.scss',
    minifiedName: 'styles.min.css',
    destination: './dist'
};
 
gulp.task('sass', function() {
    return gulp.src(paths.entryPoint)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat(paths.minifiedName))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.destination));
});
 
gulp.task('sass:watch', function () {
    gulp.watch(['**/*.scss'], ['sass']);
});