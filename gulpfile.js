var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

var paths = {
  scripts: ['temp/babel/js/**/*.js', 'js/lib/**/*.js'],
  images: 'assets/images/**/*'
};

gulp.task('clean', function() {
  return del(['build']);
});

gulp.task('scripts', ['clean'], function() {
  // Minify and copy all JavaScript (except library scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
  .pipe(sourcemaps.init())
  .pipe(uglify())
  .pipe(concat('all.min.js'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('dist/js'));
});

// Copy all static images
gulp.task('images', ['clean'], function() {
  return gulp.src(paths.images)
  // Pass in options to the task
  .pipe(imagemin({optimizationLevel: 5}))
  .pipe(gulp.dest('dist/assets/images'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'scripts', 'images']);