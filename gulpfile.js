var gulp = require('gulp');
var babel = require('gulp-babel');
var inject = require('gulp-inject');
var plumber = require( 'gulp-plumber' ),
	watch = require( 'gulp-watch' ),
	livereload = require( 'gulp-livereload' ),
	minifycss = require( 'gulp-minify-css' ),
	jshint = require( 'gulp-jshint' ),
	stylish = require( 'jshint-stylish' ),
	uglify = require( 'gulp-uglify' ),
	rename = require( 'gulp-rename' ),
	sass = require( 'gulp-sass' ),
	clean = require( 'gulp-clean' ),
	del = require('del');

var onError = function( err ) {
	console.log( 'An error occurred:', err.message );
	this.emit( 'end' );
}

gulp.task( 'scss', function() {
	return gulp.src( './src/scss/application.scss' )
		.pipe( plumber( { errorHandler: onError } ) )
		.pipe( sass() )
		.pipe( gulp.dest( './dist/css' ) );
} );

gulp.task('babel', ['scss'], function() {
	return gulp.src('src/**/*.js')
		.pipe( plumber( { errorHandler: onError } ))
		.pipe(babel())
		.pipe(gulp.dest('./dist/'));
})

gulp.task( 'watch', function() {
	gulp.watch( './src/scss/**/*.scss', [ 'default' ] );
	gulp.watch( './src/**/*.js', [ 'default' ] );
	gulp.watch( './src/**/*.html', [ 'default' ]);
} );

gulp.task( 'jshint', ['babel', 'scss'], function() {
	return gulp.src('src/js/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
} );
  
gulp.task('default', ['cleanDist','jshint', 'babel'], function () {
	gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));
	gulp.src('src/images/**/*')
		.pipe(gulp.dest('dist/images'));
		
	gulp.src('src/**/*.html')
		.pipe(gulp.dest('dist/'))
		.pipe(inject(gulp.src(['bower_components/material-design-lite/material.min.js', 'bower_components/material-design-lite/material.min.css', 'dist/**/*.js', 'dist/**/*.css'], {read: false}), {relative: true}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('cleanDist', function() {
  return del('dist/**/*');
});

gulp.task('copySrcJsForTheBuild', ['cleanDist'], function() {
	return gulp.src('src/**/*.js')
	  .pipe(rename( { suffix: '.min' }))
	  .pipe(gulp.dest( 'dist/' ))
	  .pipe( plumber( { errorHandler: onError } ))
	  .pipe(babel())
	  .pipe(gulp.dest('dist/'))
	  .pipe(uglify())
	  .pipe(gulp.dest('dist/'));
});

gulp.task('copySrcScssForTheBuild', ['copySrcJsForTheBuild'], function() {
	return gulp.src('src/scss/application.scss')
	  .pipe( plumber( { errorHandler: onError } ))
	  .pipe(sass())
	  .pipe(minifycss())
	  .pipe(rename( { suffix: '.min' }))
	  .pipe(gulp.dest('dist/css'));
});

gulp.task('copySrcForTheBuild', ['copySrcJsForTheBuild', 'copySrcScssForTheBuild'], function() {
	gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));
	gulp.src('src/images/**/*')
		.pipe(gulp.dest('dist/images'));
	
})

gulp.task('copyMDLCss', ['copySrcForTheBuild'], function() {
	return gulp.src('bower_components/material-design-lite/material.min.css')
		.pipe(gulp.dest('dist/css'));
})

gulp.task('copyMDLJs', ['copyMDLCss'], function() {
	return gulp.src('bower_components/material-design-lite/material.min.js')
		.pipe(gulp.dest('dist/js'));
})

gulp.task('copyBowerComponents', ['copyMDLCss', 'copyMDLJs'], function() {
})

gulp.task('build', ['cleanDist', 'copySrcForTheBuild', 'copyMDLCss', 'copyMDLJs'], function() {
	gulp.src('src/**/*.html')
		.pipe(gulp.dest('dist/'))
		.pipe(inject(gulp.src(['dist/**/*.min.js', 'dist/**/*.min.css'], {read: false}), {relative: true}))
		.pipe(gulp.dest('dist/'));
});