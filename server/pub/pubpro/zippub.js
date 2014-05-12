/**
 * zip 下载项目
 * 
 */

var hugpub = require("./hugpub")
	util = require("util"),
	JsZip = require("jszip"),
	fs = require("fs"),
	path = require("path");

function ZipPub(){
	hugpub.apply(this,arguments);
	this.zip = new JsZip();
	var _this = this;
	this.on("end",function(){
		var content = _this.zip.generate({type:"nodebuffer"});
		_this.emit("ready",content)
	})
	this.on("pub",function(filePath,destPath){
		
	})
}
util.inherits(ZipPub,hugpub);
ZipPub.prototype.writeZip = function(fp,content){
	if(fp[0] == "\\" || fp[0] == "/"){
		fp = fp.substring(1);
	}
	this.zip.file(fp,content);
	return fp;
}
ZipPub.prototype.writeCombineFile = function(fp,content){
	var _this = this;
	return function(callback){
		var combinePath = _this.getCombineDestPath(fp);
		combinePath = combinePath.replace(_this.cfg.output,"");
		var writePath = _this.writeZip(combinePath,content);
		callback(null,writePath);
	}
}
ZipPub.prototype.writeSourceFile = function(fp,content){
	var _this = this;
	return function(callback){
		var sourPath = _this.getSourcePath(fp);
		sourPath = sourPath.replace(_this.cfg.output,"");
		var writePath = _this.writeZip(sourPath,content);
		callback(null,writePath);
	}
}

ZipPub.prototype.copyFile = function(fp,callback){
	var _this = this;
	//getcontent;
	fs.readFile(fp,function(error,content){
		var combinePath = _this.getCombineDestPath(fp);
		combinePath = combinePath.replace(_this.cfg.output,"");
		var writePath = _this.writeZip(combinePath,content);
		callback(null,writePath);
	})
}

module.exports = ZipPub;

