/**
 * Created by root on 15/6/16.
 */

var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    changed = require('gulp-changed'),
    del = require('del'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    imagemin = require('gulp-imagemin'),
    minifyCSS = require('gulp-minify-css'),
    minifyHtml = require('gulp-minify-html'),
    rev = require('gulp-rev'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    revCollector = require('gulp-rev-collector'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass');

var publicDir = "public/";
var config = {

    // Source directories

    jsVendorSrc: publicDir + "javascripts/src/vendor/",
    jsLibSrc: publicDir + "javascripts/src/libraries/",
    sassSrc: publicDir + "stylesheets/scss/",
    imgSrc: publicDir + "images/",
    htmlSrc: publicDir + "views/",

    // Build directory

    buildDir: 'build/',
    revDir: 'build/rev/',

    // Distribution directories

    jsDistDir: publicDir + "javascripts/dist/vendor/",
    jsLibDistDir: publicDir + "/javascripts/dist/libraries/",
    cssDistDir: publicDir + "stylesheets/dist/"

};

var onError = function (err) {
    gutil.beep();
    gutil.log(gutil.colors.green(err));
};

var nodemonServerInit = function () {
    livereload.listen();
    nodemon({
        script: 'bin/www',
        ext: 'js'
    }).on('restart', function () {
        gulp.src('bin/www')
            .pipe(livereload())
            .pipe(notify('Reloading page, please wait...'));
    })
};

if (process.env.NODE_ENV === 'prod') {
    gulp.task('default', ['dist']);
} else {
    gulp.task('default', ['build', 'watch']);
}

gulp.task('clean', function (cb) {
    del([config.jsDistDir, config.jsLibDistDir, config.cssDistDir], cb);
});

gulp.task('build', ['build-css', 'build-js'], function (cb) {
    nodemonServerInit();
});

gulp.task('dist', ['dist-css', 'dist-js'], function (cb) {
    nodemonServerInit();
});

/*
 CSS tasks
 */
gulp.task('build-css', ['sass']);

gulp.task('sass', function () {
    return gulp.src(config.sassSrc + '**/*.scss')
        .pipe(sass({
            includePaths: require('node-neat').includePaths,
            style: 'nested',
            onError: function () {
                console.log("Error in scss");
            }
        }))
        .pipe(plumber({errorHandler: onError}))
        .pipe(gulp.dest(config.buildDir + 'css/'))
        .pipe(livereload());
});

gulp.task('dist-css', ['build-css'], function () {
    return gulp.src([
            config.buildDir + 'css/*'
        ])
        .pipe(revCollector())
        .pipe(minifyCSS())
        .pipe(rev())
        .pipe(gulp.dest(config.cssDistDir))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.revDir + 'css'));
});

/*
 JS Tasks
 */
gulp.task('build-js', ['js-lib', 'js-plugins']);

gulp.task('js-lib', function () {
    return gulp.src(config.jsLibSrc + '*.js')
        .pipe(plumber({errorHandler: onError}))
        .pipe(changed(config.buildDir + 'js/libraries'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(config.buildDir + 'js/libraries'))
        .pipe(livereload());
});

gulp.task('js-plugins', [], function () {
    return gulp.src([
            config.jsVendorSrc + "**/*.js"
        ])
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(config.buildDir + 'js/vendor'))
        .pipe(livereload());
});

gulp.task('dist-js', ['dist-js-lib', 'dist-js-plugins']);

gulp.task('dist-js-lib', ['js-lib'], function () {
    return gulp.src(config.buildDir + 'js/libraries/*')
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(config.jsLibDistDir))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.revDir + 'js/libraries'));
});

gulp.task('dist-js-plugins', ['js-plugins'], function () {
    return gulp.src(config.buildDir + 'js/vendor/*')
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(config.jsDistDir))
        .pipe(rev.manifest())
        .pipe(gulp.dest(config.revDir + 'js/vendor'));
});

gulp.task('watch', function () {
    gulp.watch(config.sassSrc, ['sass']);
    gulp.watch(config.jsLibSrc + '**/*.js', ['js-lib']);
    gulp.watch(config.jsVendorSrc + '**/*.js', ['js-plugins']);
});