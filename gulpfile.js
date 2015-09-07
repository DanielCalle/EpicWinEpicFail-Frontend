'use strict'

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    historyApiFallback = require('connect-history-api-fallback')(),
    browserify = require('browserify'),
    babelify = require('babelify'),
    minifyHTML = require('gulp-minify-html'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    stylus = require('gulp-stylus'),
    bower = require('gulp-bower'),
    inject = require('gulp-inject'),
    runSequence = require('gulp-run-sequence'),
    clean = require('gulp-clean')

gulp.task('server', function() {
  connect.server({
    root: './build',
    hostname: '0.0.0.0',
    port: 3000,
    livereload: true,
    middleware: function(connect, opt) {
      return [ historyApiFallback ];
    }
  });
});

gulp.task('reactjs', function() {
  return browserify({
    entries: './src/index.jsx',
    extensions: ['.jsx'],
    debug: true
  })
  .transform(babelify.configure({
        compact: false
    }))
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('./build/js'))
})

gulp.task('minifyHTML', function() {
  var opts = {
    conditionals: true,
    spare:true
  };
  return gulp.src('./build/**/*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./build/'))
    .pipe(connect.reload())
})

gulp.task('uglify', function() {
  return gulp.src('build/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task('bower', function() {
    return bower()
           .pipe(gulp.dest('./src/bower_components'))
});

gulp.task('stylus', function () {
  gulp.src('./src/stylus/**/*.styl')
    .pipe(stylus({
      compress: true
    }))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('jquery',function() {
  return gulp.src('./src/bower_components/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('./build/js/vendor'))
})

gulp.task('bootstrap',function() {
  return gulp.src('./src/bower_components/bootstrap/dist/css/bootstrap.min.css')
    .pipe(gulp.dest('./build/css/vendor'))
})

gulp.task('html',function() {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./build'))
})

gulp.task('inject', function () {
  var target = gulp.src('./build/**/*.html');
  // It's not necessary to read the files (will speed up things),
  // we're only after their paths:
  var sources = gulp.src(['./build/**/*.js', './build/**/*.css'],
   { read: false })

  return target.pipe(inject(sources,{ignorePath: 'build/'}))
    .pipe(gulp.dest('./build'))
});

gulp.task('build', function() {
  runSequence('build-clean', 'bower', ['stylus', 'reactjs', 'jquery',
   'bootstrap', 'html'],'inject',['uglify', 'minifyHTML'], 'watch');
});

gulp.task('build-clean', function() {
    return gulp.src('build').pipe(clean());
});
gulp.task('buildCSS', function(){
  runSequence('stylus','buildHTML')
})
gulp.task('buildJS', function(){
  runSequence('reactjs','uglify','buildHTML')
})
gulp.task('buildHTML', function(){
  runSequence('html','inject','minifyHTML')
})
gulp.task('watch', function() {
  gulp.watch('./src/**/*.styl', ['buildCSS'])
  gulp.watch('./src/**/*.jsx', ['buildJS'])
  gulp.watch('./src/**/*.html', ['buildHTML'])
  gulp.watch('./bower.json', ['bower'])
})

gulp.task('default', ['build', 'server'])
