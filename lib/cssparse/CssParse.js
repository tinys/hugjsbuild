/**
 * 合并css文件
 * 
 * @author yajiedong
 */
var util = require("util")
		   ,events = require("events")
		   ,fs = require("fs")
		   ,path = require("path"),
		   $cleanCss = require('clean-css')
		   ;
function CssParse(path){
	this.path  = path;
	this.content = "";
	
	
	this.depsList = [];
	this.errorList = [];
}
util.inherits(CssParse,events.EventEmitter);

var cssMatch = /@import\s*url\s*\(\s*['|"]?([\w\/\-\.\d]+)['|"]?\s*\);?/img;
CssParse.prototype.parse = function(){
	var _self = this,
		content = [];
	
	function getContent(filePath,callback){
		fs.exists(filePath,function(exists){
			if(exists){
				fs.readFile(filePath,{
					encoding :"utf-8"
				},function(err, data){
					if(err){
						_self.errorList.push(err);
						callback(err);
						return;
					}
					callback(null,data);
				})
			}else{
				callback("");
				_self.errorList.push(path+" not exists");
			}
		})
	}
	var fileMap = {};
	function parseData(filePath,callback){
		getContent(filePath,function(error,data){
			if(error){
				callback();
				return;
			}
			var dirName = path.dirname(filePath);
			var fileData = data.replace(cssMatch,function(match,$0){
				var inPath = path.join(dirName,$0);
				if(_self.depsList.indexOf(inPath) <0){
					_self.depsList.push(inPath);
				}
		        return "";
	        });
			fileMap[filePath] = fileData;
			if(_self.depsList.indexOf(filePath) <0){
				_self.depsList.push(filePath);
			}
			callback();
		})
	}
	function parseListToContent(list,callback){
		if(list.length ==0){
			callback();
			return;
		}
		
		var cssFile = list.shift();
		if(fileMap[cssFile] || fileMap[cssFile] ===""){
			content.push(fileMap[cssFile]);
			parseListToContent(list,callback);
		}else{
			parseData(cssFile,function(){
				content.push(fileMap[cssFile]);
				parseListToContent(list,callback);
			})
		}
		
	}
	parseData(_self.path,function(){
		var list = [].concat(_self.depsList);
		parseListToContent(list,function(){
			_self.content = content.join("\n");
			_self.emit("parsed",_self);
		})
	})
}
CssParse.prototype.depsStr = function(){
	var result = [];
	this.depsList.forEach(function(a,i){
		result.push(a);
	})
	return result.join("\n")
}
CssParse.prototype.getBeautiful=function(){
	return (new $cleanCss()).minify(this.content);
}
module.exports = CssParse;

