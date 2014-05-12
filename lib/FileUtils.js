/**
 * 文件操作
 */
var path = require("path"),
	fs = require("fs"),
	async = require("async")
	;

var FileUtils = {
	/**
	 * 复制文件
	 * @param {Object} resource
	 * @param {Object} dest
	 */
	copy:function(resource,dest,cb){
		var dir = path.dirname(dest);
		
		//openfile writefile callback
		async.waterfall([
			function(callback){
				FileUtils.mkdirs(dir,callback);
			},
			function(callback){
				fs.readFile(resource,callback)
			},
			function(content,callback){
				fs.writeFile(dest,content,callback);
			}
		],function(err){
			if(err){
				cb(err);
				return;
			}
			cb();
		})
	},
	/**
	 * 删除所有文件
	 * @param {Object} filePath
	 */
	clearAll:function(filePath,cb){
		
	},
	writeToFile:function(destPath,content,cb){
		var dir = path.dirname(destPath);
		async.waterfall([
			function(callback){
				FileUtils.mkdirs(dir,callback);
			},
			function(callback){
				fs.writeFile(destPath,content,callback);
			}
		],function(err){
			if(err){
				cb(err);
				return;
			}
			cb();
		})
	},
	/**
	 * 创建文件夹
	 * @param {Object} directory
	 */
	mkdirs:function(directory,cb){
		fs.exists(directory,function(exists){
			if(exists){
				cb();
				return;
			}
			var parendDir = path.dirname(directory),
				dirName = path.basename(directory);
			FileUtils.mkdirs(parendDir,function(){
				fs.mkdir(directory,function(){
					cb();
				})
			})
		})
	}
}

module.exports = FileUtils;