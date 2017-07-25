var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var imagemin = require('gulp-imagemin');
var noop = require("gulp-noop");
var uglify = require('gulp-uglify');

var paths = {
  images: 'src/assets/images/**/*'
};

function compile(watch, debug=false) {
  var bundler = watchify(browserify('./src/js/main.js', { debug: debug }).transform(babel));

  function rebundle() {
    bundler.bundle()
    .on('error', function(err) { console.error(err); this.emit('end'); })
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(debug ? sourcemaps.init({ loadMaps: true }) : noop())
    .pipe(debug ? sourcemaps.write('./') : noop())
    .pipe(debug ? noop() : uglify())
    .pipe(gulp.dest('./build/js'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

// Copy all static images
gulp.task('images', [], function() {
  return gulp.src(paths.images)
  // Pass in options to the task
  .pipe(imagemin({optimizationLevel: 5}))
  .pipe(gulp.dest('build/assets/images'));
});

gulp.task('index', [], function() {
  gulp.src('./src/index.html')
  // Perform minification tasks, etc here
  .pipe(gulp.dest('./build'));
});

gulp.task('libs', [], function() {
  gulp.src('./src/js/lib/**')
  // Perform minification tasks, etc here
  .pipe(gulp.dest('./build/js/lib'));
});

gulp.task('styles', [], function() {
  gulp.src('./src/stylesheets/**')
  // Perform minification tasks, etc here
  .pipe(gulp.dest('./build/stylesheets'));
});

gulp.task('build-debug', ['images', 'index', 'libs', 'styles'],function() { return compile(false, true); });
gulp.task('build-release', ['images', 'index', 'libs', 'styles'], function() { return compile(); });
gulp.task('watch', function() { return watch(); });
gulp.task('default', ['build-release']);

