import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
import pug from 'gulp-pug';
import svgSprite from 'gulp-svg-sprite';
import webpackStream from 'webpack-stream';
import rename from 'gulp-rename';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import browserSync from 'browser-sync';
import { deleteAsync } from 'del';
import cache from 'gulp-cache';
import plumber from 'gulp-plumber';
import newer from 'gulp-newer';
import flatten from 'gulp-flatten';
const webp = require('gulp-webp');

const sass = gulpSass(dartSass);

// Clean task
gulp.task('clean', function () {
  return deleteAsync('dist');
});

// Serve and watch task
gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: './dist',
      index: 'sitemap.html',
      open: true,
    },
    notify: false,
    files: ['dist/*', 'dist/**/*']
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
  return gulp.src('src/sass/style.scss')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/css'));
});

// Non-minified HTML
gulp.task('templates', () => {
  return gulp.src('src/pug/pages/*.pug')
    .pipe(plumber())
    .pipe(cache(pug({ pretty: true })))
    .pipe(flatten())
    .pipe(gulp.dest('dist'));
});

// Minified HTML
gulp.task('templates:min', () => {
  return gulp.src('src/pug/pages/*.pug')
    .pipe(plumber())
    .pipe(pug({ pretty: true }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(flatten())
    .pipe(gulp.dest('dist'));
});

// Non-minified JS
gulp.task('scripts', () => {
  return gulp.src('src/js/main.js', { allowEmpty: true })
    .pipe(plumber())
    .pipe(webpackStream({
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
  return gulp.src('src/js/main.js', { allowEmpty: true })
    .pipe(plumber())
    .pipe(webpackStream({
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

// Clean old .webp files
gulp.task('clean-webp', () => {
  return del(['src/img/**/*.webp']);
});

// Convert images to WebP
gulp.task('convert-webp', () => {
  return gulp.src(['src/img/**/*.{jpg,jpeg,png}', '!src/img/sprite{,/**}'])
    .pipe(plumber())
    .pipe(webp())
    .pipe(gulp.dest(file => file.base));
});

gulp.task('default', gulp.series('clean', 'svgs', gulp.parallel('styles:min', 'templates:min', 'scripts:min', 'assets', 'serve')));
gulp.task('build', gulp.series('clean', 'svgs', gulp.parallel('styles', 'styles:min', 'templates', 'templates:min', 'scripts', 'scripts:min', 'assets')));
gulp.task('webp', gulp.series('clean-webp', 'convert-webp'));
