var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var imagemin = require('gulp-imagemin');
var noop = require('gulp-noop');
var uglify = require('gulp-uglify');
var exit = require('gulp-exit');
var del = require('del');

var paths = {
  favicon: 'src/favicon.ico',
  favicon_out: './build',
  images: 'src/assets/images/**/*',
  images_out: 'build/assets/images',
  index: './src/index.html',
  index_out: './build',
  styles: './src/stylesheets/**',
  styles_out: './build/stylesheets',
  main: './src/js/app/main.js',
  main_out_name: 'main.js',
  main_out_dir: './build/js',
};

function compile(watch, debug = false) {
  var bundler;
  del(`${paths.main}.map`);
  bundler = watchify(browserify(paths.main, {debug: debug}).transform(babel));

  function rebundle() {
    bundler.bundle()
    .on('error', function (err) {
      console.error(err);
      this.emit('end');
    })
    .pipe(source(paths.main_out_name))
    .pipe(buffer())
    .pipe(debug ? sourcemaps.init({loadMaps: true}) : noop())
    .pipe(debug ? sourcemaps.write('./') : noop())
    .pipe(debug ? noop() : uglify())
    .pipe(gulp.dest(paths.main_out_dir))
    .pipe(watch ? noop() : exit());
  }
  if (watch) {
    bundler.on('update', function () {
      console.log('-> bundling...');
      rebundle();
    });
  }
  rebundle();
}

gulp.task('favicon', [], function () {
  gulp.src(paths.favicon)
  // Perform minification tasks, etc here
  .pipe(gulp.dest(paths.favicon_out));
});

// Copy all static images
gulp.task('images', [], function () {
  return gulp.src(paths.images)
  // Pass in options to the task
  .pipe(imagemin({optimizationLevel: 5}))
  .pipe(gulp.dest(paths.images_out));
});

gulp.task('index', [], function () {
  gulp.src(paths.index)
  // Perform minification tasks, etc here
  .pipe(gulp.dest(paths.index_out));
});

gulp.task('styles', [], function () {
  gulp.src(paths.styles)
  // Perform minification tasks, etc here
  .pipe(gulp.dest(paths.styles_out));
});

gulp.task('watch-images', function () {
  gulp.watch(paths.images, ['images']);
});

gulp.task('watch-index', function () {
  gulp.watch(paths.index, ['index']);
});

gulp.task('watch-styles', function () {
  gulp.watch(paths.styles, ['styles']);
});

gulp.task('watch-favicon', function () {
  gulp.watch(paths.favicon, ['favicon']);
});

gulp.task('build-debug', ['images', 'index', 'styles', 'favicon'], function () {
  return compile(false, true);
});

gulp.task('build-release', ['images', 'index', 'styles', 'favicon'],
  function () {
    return compile();
  });

gulp.task('watch-debug',
  ['watch-images', 'watch-index', 'watch-styles', 'watch-favicon'],
  function () {
    return compile(true, true);
  });

gulp.task('default', ['build-release']);

