var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    changed = require('gulp-changed'),
    del = require('del'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    minifyCSS = require('gulp-minify-css'),
    rev = require('gulp-rev'),
    jshint = require('gulp-jshint'),
    revCollector = require('gulp-rev-collector'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    path = require('path'),
    mktree = require('mktree');

var baseDir = {
    sourceDirectory: "htdocs/",
    buildDirectory: "build/",
    revDirectory: "build/rev/",
    distDirectory: "public/"
};

var basePathDir = {
    jsDir: "javascripts/",
    stylesDir: "stylesheets/",
    imagesDir: "images/",
    htmlDir: "views/",
    jsVendorDir: "vendor/",
    jsLibDir: "libraries/",
    scssDir: "scss/"
}

var config = {
    // Source directories

    jsVendorSrc: path.join(__dirname, baseDir.sourceDirectory, basePathDir.jsDir, basePathDir.jsVendorDir),
    jsLibSrc: path.join(__dirname, baseDir.sourceDirectory, basePathDir.jsDir, basePathDir.jsLibDir),
    stylesSrc: path.join(__dirname, baseDir.sourceDirectory, basePathDir.stylesDir, basePathDir.scssDir),
    imagesSrc: path.join(__dirname, baseDir.sourceDirectory, basePathDir.imagesDir),
    htmlSrc: path.join(__dirname, baseDir.sourceDirectory, basePathDir.htmlDir)

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
    del([baseDir.buildDirectory], cb);
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
    return mktree([path.join(__dirname, baseDir.buildDirectory, basePathDir.stylesDir)], function (err) {
        if (err) {
            console.error(err)
        }
        else {
            return gulp.src(config.stylesSrc + '**/*.scss')
                .pipe(sass({
                    includePaths: require('node-neat').includePaths,
                    style: 'nested',
                    onError: function () {
                        console.log("Error in scss");
                    }
                }))
                .pipe(plumber({errorHandler: onError}))
                .pipe(gulp.dest(path.join(__dirname, baseDir.buildDirectory, basePathDir.stylesDir)))
                .pipe(livereload());
        }
    });

});

gulp.task('dist-css', ['build-css'], function () {
    return mktree([path.join(__dirname, baseDir.distDirectory, basePathDir.stylesDir), path.join(__dirname, baseDir.revDirectory, basePathDir.stylesDir)], function (err) {
        if (err) {
            console.error(err)
        }
        else {
            return gulp.src([
                    path.join(__dirname, baseDir.buildDirectory, basePathDir.stylesDir, "*.css")
                ])
                .pipe(revCollector())
                .pipe(minifyCSS())
                .pipe(rev())
                .pipe(gulp.dest(path.join(__dirname, baseDir.distDirectory, basePathDir.stylesDir)))
                .pipe(rev.manifest())
                .pipe(gulp.dest(path.join(__dirname, baseDir.revDirectory, basePathDir.stylesDir)));
        }
    });

});

/*
 JS Tasks
 */
gulp.task('build-js', ['js-lib', 'js-plugins']);

gulp.task('js-lib', function () {
    return mktree([path.join(__dirname, baseDir.buildDirectory, basePathDir.jsDir, basePathDir.jsLibDir)], function (err) {
        if (err) {
            console.error(err)
        }
        else {

            return gulp.src(path.join(config.jsLibSrc, '*.js'))
                .pipe(plumber({errorHandler: onError}))
                .pipe(changed(path.join(__dirname, baseDir.buildDirectory, basePathDir.jsDir, basePathDir.jsLibDir)))
                .pipe(jshint())
                .pipe(jshint.reporter('default'))
                .pipe(gulp.dest(path.join(__dirname, baseDir.buildDirectory, basePathDir.jsDir, basePathDir.jsLibDir)))
                .pipe(livereload());
        }
    });

});

gulp.task('js-plugins', [], function () {
    return mktree([path.join(__dirname, baseDir.buildDirectory, basePathDir.jsDir, basePathDir.jsVendorDir)], function (err) {
        if (err) {
            console.error(err)
        }
        else {
            return gulp.src([
                    path.join(config.jsVendorSrc, "*.js")
                ])
                .pipe(concat('vendor.js'))
                .pipe(gulp.dest(path.join(__dirname, baseDir.buildDirectory, basePathDir.jsDir, basePathDir.jsVendorDir)))
                .pipe(livereload());
        }
    });

});

gulp.task('dist-js', ['dist-js-lib', 'dist-js-plugins']);

gulp.task('dist-js-lib', ['js-lib'], function () {
    return mktree([path.join(__dirname, baseDir.distDirectory, basePathDir.jsDir, basePathDir.jsLibDir), path.join(__dirname, baseDir.revDirectory, basePathDir.jsDir, basePathDir.jsLibDir)], function (err) {
        if (err) {
            console.error(err)
        }
        else {

            return gulp.src(path.join(__dirname, baseDir.buildDirectory, basePathDir.jsDir, basePathDir.jsLibDir, "*.js"))
                .pipe(uglify())
                .pipe(rev())
                .pipe(gulp.dest(path.join(__dirname, baseDir.distDirectory, basePathDir.jsDir, basePathDir.jsLibDir)))
                .pipe(rev.manifest())
                .pipe(gulp.dest(path.join(__dirname, baseDir.revDirectory, basePathDir.jsDir, basePathDir.jsLibDir)));
        }
    });

});

gulp.task('dist-js-plugins', ['js-plugins'], function () {
    return mktree([path.join(__dirname, baseDir.distDirectory, basePathDir.jsDir, basePathDir.jsVendorDir), path.join(__dirname, baseDir.revDirectory, basePathDir.jsDir, basePathDir.jsVendorDir)], function (err) {
        if (err) {
            console.error(err)
        }
        else {

            return gulp.src(path.join(__dirname, baseDir.buildDirectory, basePathDir.jsDir, basePathDir.jsVendorDir, '*.js'))
                .pipe(uglify())
                .pipe(rev())
                .pipe(gulp.dest(path.join(__dirname, baseDir.distDirectory, basePathDir.jsDir, basePathDir.jsVendorDir)))
                .pipe(rev.manifest())
                .pipe(gulp.dest(path.join(__dirname, baseDir.revDirectory, basePathDir.jsDir, basePathDir.jsVendorDir)));
        }
    });

});

gulp.task('watch', function () {
    gulp.watch(config.stylesSrc, ['sass']);
    gulp.watch(path.join(config.jsLibSrc, '**/*.js'), ['js-lib']);
    gulp.watch(path.join(config.jsVendorSrc, '**/*.js'), ['js-plugins']);
});