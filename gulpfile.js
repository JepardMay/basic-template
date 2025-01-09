const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const pug = require('gulp-pug');
const svgSprite = require('gulp-svg-sprite');
const webpack = require('webpack-stream');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');
const cache = require('gulp-cache');
const plumber = require('gulp-plumber');
const newer = require('gulp-newer');

// Clean task
gulp.task('clean', function () {
  return deleteAsync(['dist/**', '!dist']);
});

gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });

  gulp.watch('src/sass/**/*.scss', gulp.series('styles', 'styles:min')).on('change', browserSync.reload);
  gulp.watch('src/pug/**/*.pug', gulp.series('templates', 'templates:min')).on('change', browserSync.reload);
  gulp.watch('src/js/**/*.js', gulp.series('scripts', 'scripts:min')).on('change', browserSync.reload);
  gulp.watch('src/svg/**/*.svg', gulp.series('svgs')).on('change', browserSync.reload);
  gulp.watch('src/favicon/**/*', gulp.series('assets')).on('change', browserSync.reload);
  gulp.watch(['src/img/**/*', '!src/img/sprite{,/**}'], gulp.series('assets')).on('change', browserSync.reload);
  gulp.watch('src/fonts/**/*', gulp.series('assets')).on('change', browserSync.reload);
});

// Non-minified CSS
gulp.task('styles', () => {
  return gulp.src('src/sass/**/*.scss')
    .pipe(plumber())
    .pipe(cache(sass().on('error', sass.logError)))
    .pipe(gulp.dest('dist/css'));
});

// Minified CSS
gulp.task('styles:min', () => {
  return gulp.src('src/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/css'));
});

// Non-minified HTML
gulp.task('templates', () => {
  return gulp.src('src/pug/**/*.pug')
    .pipe(plumber())
    .pipe(cache(pug({ pretty: true })))
    .pipe(gulp.dest('dist'));
});

// Minified HTML
gulp.task('templates:min', () => {
  return gulp.src('src/pug/**/*.pug')
    .pipe(plumber())
    .pipe(pug({ pretty: true }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist'));
});

// Non-minified JS
gulp.task('scripts', () => {
  return gulp.src('src/js/modules/index.js', { allowEmpty: true })
    .pipe(plumber())
    .pipe(webpack({
      mode: 'development',
      module: {
        rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }]
      },
      output: {
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest('dist/js'));
});

// Minified JS
gulp.task('scripts:min', () => {
  return gulp.src('src/js/modules/index.js', { allowEmpty: true })
    .pipe(plumber())
    .pipe(webpack({
      mode: 'production',
      module: {
        rules: [{
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }]
      },
      output: {
        filename: 'bundle.min.js'
      }
    }))
    .pipe(gulp.dest('dist/js'));
});

// SVG sprite
gulp.task('svgs', () => {
  return gulp.src('src/img/sprite/*.svg')
    .pipe(plumber())
    .pipe(svgSprite({
      mode: {
        symbol: {
          dest: '',
          sprite: "sprite.svg"
        }
      }
    }))
    .pipe(gulp.dest('dist/img'));
});

// Copying additional files
gulp.task('assets', () => {
  // Favicon
  gulp.src('src/favicon/**/*', { allowEmpty: true })
    .pipe(plumber())
    .pipe(newer('dist/favicon'))
    .pipe(gulp.dest('dist/favicon'));

  // Images excluding sprite folder
  gulp.src(['src/img/**/*', '!src/img/sprite{,/**}'], { allowEmpty: true })
    .pipe(plumber())
    .pipe(newer('dist/img'))
    .pipe(gulp.dest('dist/img'));

  // Fonts
  gulp.src('src/fonts/**/*', { allowEmpty: true })
    .pipe(plumber())
    .pipe(newer('dist/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

// Watch task
gulp.task('watch', gulp.parallel('serve', () => {
  gulp.watch('src/sass/**/*.scss', gulp.series('styles', 'styles:min'));
  gulp.watch('src/pug/**/*.pug', gulp.series('templates', 'templates:min'));
  gulp.watch('src/js/**/*.js', gulp.series('scripts', 'scripts:min'));
  gulp.watch('src/svg/**/*.svg', gulp.series('svgs'));
  gulp.watch('src/favicon/**/*', gulp.series('assets'));
  gulp.watch(['src/img/**/*', '!src/img/sprite{,/**}'], gulp.series('assets'));
  gulp.watch('src/fonts/**/*', gulp.series('assets'));
}));

gulp.task('default', gulp.series('clean', gulp.parallel('styles', 'templates', 'scripts', 'svgs', 'assets', 'watch')));
gulp.task('build', gulp.series('clean', gulp.parallel('styles:min', 'templates:min', 'scripts:min', 'svgs', 'assets')));
