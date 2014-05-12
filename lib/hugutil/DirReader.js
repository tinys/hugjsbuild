/**
 * 项目解析
 * 
 * @param {Object} path
 */
var events = require("events"),
	util = require("util"),
	fs = require("fs"),
	path = require("path")
	;
function defaultFilter(file){
	return true;
}
function DirReader(path,cb){
	this.path = path;
	this.cb = cb || defaultFilter;
	this.filterFuns = defaultFilter;
}
util.inherits(DirReader,events.EventEmitter);

// 过滤
DirReader.prototype.filter = function(cb){
	this.filterFuns = cb;
	return this;
}
// 开始扫描
DirReader.prototype.scan = function(){
	var _this = this,
		fileCount = 0
		;
	function scanDir(directory){
		fileCount++;
		fs.readdir(directory,function(err,files){
			fileCount--;
			if(err){
				_this.emit("error",err);
				return;
			}
			var length = files.length;
			fileCount += length;
			files.forEach(function(a,i){
				var filePath = path.join(directory,a);
				tellFill(filePath,function(){
					if(fileCount == 0){
						_this.emit("scaned");
					}
				});
			})
		})
	};
	function tellFill(filePath,cb){
		fs.stat(filePath,function(err,stat){
			fileCount--;
			if(err){
				_this.emit("error",err);
				cb();
				return;
			}
			if(stat.isDirectory()){
				scanDir(filePath);
				cb();
				return;
			}
			var isRight = _this.filterFuns(filePath);		
			if(isRight){
				try{
					_this.cb(filePath,fileCount==0);
				}catch(e){
				}
				try{
					_this.emit("read",filePath,fileCount==0)
				}catch(e){
				}
				cb();
			}
		})
	};
	
	fs.exists(_this.path,function(exist){
		if(!exist){
			_this.emit("error",_this.path+" not exists");
			return;
		}
		scanDir(_this.path);
	})	
	
	return _this;
}

module.exports = DirReader;
