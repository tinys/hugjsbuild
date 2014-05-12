/**
 * 合并 发布
 */
var util = require("util"),
	events = require("events"),
	path = require("path"),
	DirReader = require("../../../lib/hugutil/DirReader"),
	proUtil = require("../../util/proUtil"),
	JSParse = require("../../../lib/jsparse/JSParse"),
	CssParse = require("../../../lib/cssparse/CssParse"),
	async = require("async"),
	fileUtils = require("../../../lib/FileUtils");
	;

function HugPub(project,cfg){
	this.project = project;
	this.cfg = cfg;
}
util.inherits(HugPub,events.EventEmitter);

var bind = function(){
	var args = Array.prototype.slice.call(arguments,0),
		fun = args[0],
		params = args.slice(1);
	return function(){
		var argument = Array.prototype.slice.call(arguments,0);
		return fun.apply(null,params.concat(argument))
	}
}

function filter(pro,filePath){
	/*
	"outputType":[".js",".css",".png",".gif",".jpg",".swf"],
	"outputCSS":[],
	"outputJS":[]
	*/
	var extName = path.extname(filePath).toLowerCase();
	var outputType = pro.outputType
	;
	if(outputType.length && outputType.indexOf(extName) <0){
		return false;
	}
	if(extName == ".js"){
		var outputJs = pro.outputJS;
		if(outputJs && outputJs.length){
			var include = false;
			outputJs.forEach(function(p){
				var c = path.join(pro.dest,p);
				if(c == filePath){
					include = true;
				}
			})
			return include;
		}
	}else if(extName == ".css"){
		var outputCSS = pro.outputCSS;
		if(outputCSS && outputCSS.length){
			var include = false;
			outputCSS.forEach(function(p){
				var c = path.join(pro.dest,p);
				if(c == filePath){
					include = true;
				}
			})
			return include;
		}
	}
	
	return true;
}
HugPub.prototype.doit = function(){
	var _this = this,
		proPath = _this.project.dest
		;
	var dirReader = new DirReader(proPath);
	var fileCount = 0,isLast = false;
	dirReader.on("read",function(filePath,last){
		fileCount++;
		if(last)isLast = true;
		// 文件列表
		try{
			_this.hugFile(filePath,function(error,destPath){
				fileCount--;
				try{
					_this.emit("pub",filePath,destPath);
				}catch(e){
					_this.emit("error",e);
				}
				if(fileCount ==0 && isLast){
					_this.emit("end");
				}
			});
		}catch(e){
			_this.emit("error",e);
		}
	})
	dirReader.filter(bind(filter,_this.cfg)).scan();
}
// 合并后文件路径
HugPub.prototype.getCombineDestPath = function(fp){
	var _this = this;
	var abPath = fp.replace(_this.project.dest,"");
	if(_this.project.needVersion){
		var version = _this.project.version;
		// 打包类型
		switch(_this.project.versionType){
			// 版本号
			case "1":
			break;
			// 文件夹
			case "2":
			abPath = path.join(version,abPath)
			break;
			// 文件名
			case "3":
			var dir = path.dirname(abPath),
				extname = path.extname(fp),
				basename = path.basename(abPath,extname);
			basename = basename+_this.project.sourcesiffix+extname;
			abPath = path.join(dir,basename)
			break;
		}
	}
	return path.join(_this.cfg.output,_this.project.pro,abPath);
}
HugPub.prototype.getSourcePath = function(fp){
	var _this = this;
	var abPath = fp.replace(_this.project.dest,"");
	var basePath = _this.cfg.output;
	if(_this.project.sourcesiffix){
		var dir = path.dirname(abPath),
			extname = path.extname(fp),
			basename = path.basename(abPath,extname);
		basename = basename+_this.project.sourcesiffix+extname;
		abPath = path.join(dir,basename)
	}
	return path.join(_this.cfg.output,_this.project.pro,abPath);
}
HugPub.prototype.hugFile = function(filePath,cb){
	var _this = this;
	
	// copy的路径
	function getCopyPath(fp){
		return _this.getCombineDestPath(fp);
	}
	var bindThis = function(fun){
		if(!fun){
			return false;
		}
		return function(){
			var args =	Array.prototype.slice.call(arguments,0);
			return fun.apply(_this,args);
		}
	}
	var writeCombineFile = bindThis(_this.writeCombineFile) || function(fp,content){
		return function(callback){
			var destPath = _this.getCombineDestPath(fp);
			fileUtils.writeToFile(destPath,content,function(error){
				callback(error,destPath)
			});
		}
	}
	var writeSourceFile = bindThis(_this.writeSourceFile) || function(fp,content){
		return function(callback){
			var destPath = _this.getSourcePath(fp);
			fileUtils.writeToFile(destPath,content,function(error){
				callback(error,destPath)
			});
		}
	}
	var copyFile = bindThis(_this.copyFile) || function(fp,callback){
		var destPath = getCopyPath(fp);
		fileUtils.copy(fp,destPath,function(error){
			callback && callback(error,destPath);
		});
	}
	
	function combineFile(extName,fp){
		var parser = null,project = _this.project;
		if(extName == ".js"){
			var mName = proUtil.getModuleName(project.jsBasePath,fp);
			parser = new JSParse(project.jsBasePath,mName,_this.cfg.js.alias);
		}else{
			parser = new CssParse(fp);
		}
		parser.on("parsed",function(par){
			var task = [];
			// 是否需要源文件
			if(project.need_source){
				task.push(writeSourceFile(fp,par.content));
			}
			var funs = writeCombineFile(fp,project.beautify?par.getBeautiful():par.content);
			task.push(funs);
			async.parallel(task,function(err,results){
				cb && cb(err,results);
			})
		});
		parser.parse();
	}
	var extName = path.extname(filePath).toLowerCase();
	var task = [];
	if(extName == ".js" || extName == ".css"){
		// jsbase外的js和全部copy
		if(extName == ".js" && filePath.indexOf(_this.project.jsBasePath) <0){
			copyFile(filePath,cb);
			return;
		}
		combineFile(extName,filePath);
	}else{
		copyFile(filePath,cb);
	}
}

module.exports = HugPub;


