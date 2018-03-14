'use strict';
/**
 * require modules
 */
var path=require('path');
var gulp=require('gulp');
var gutil=require("gulp-util");
var fse=require('fs-extra');
var del=require('del');
var runSequence = require('run-sequence');
var params=null;
/**
 * list all js-files in the `gulp` directory and require those modules
 */
fse.walkSync('./gulp').filter(function(file){
	return (/\.js$/i).test(file);
}).map(function(file,index){
	var _info=path.parse(file);
	var _module=require('./'+_info.dir+'/'+_info.name);

	if(_info.name==='params')params=_module;
});

/**
 * task clean:tmp
 */
gulp.task('clean:tmp',function(callback){
	del([
		params.tmp
	]).then(function(){
		callback&&callback();
	},function(err){
		throw new gutil.PluginError('clean:tmp', err);
	});
});
/**
 * task server
 */
gulp.task('server',function(callback){
	params.building=false;
	runSequence('clean:tmp','compass','template','webpack','watch','browser-sync',callback);
});
/**
 * task build
 */
gulp.task('build',function(callback){
	params.building=true;
	params.updateVersion();
	runSequence('clean:tmp','compass','template','webpack','images','extras','html:entries',callback);
});