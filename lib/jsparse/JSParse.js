/**
 * js 解析
 * 	解析js，返回其要添加的依赖.
 */
var util = require("util"),
	events = require("events"),
	fs = require("fs"),
	path = require("path"),
	LinkedHashMap = require("../hugutil/LinkedHashMap"),
	uglify = require("uglifyjs")
	;
	

/**
 * 
 * @param {Object} basePath     根目录
 * @param {Object} jsName 		js 相对路径
 * @param {Object} alias 		不用打包包含的require别名
 */
function JSParse(basePath,jsName,alias){
	if(!basePath || !jsName){
		util.error("JSParse arguments:"+basePath,jsName);
		return;
	}
	
	this.basePath = basePath;
	this.jsName = jsName;
	this.alias = alias || [];
	
	// 依赖列表
	this.depList = [];
	// 依赖树-- 各个文件依赖关系
	this.depTree = new LinkedHashMap();
	
	this.errorList = [];
}

// emit on
util.inherits(JSParse,events.EventEmitter);
var jsMatch = /require\s*\(\s*['|"]([\w\/\.\d]+)['|"]\s*\)/img,
	jsImportMatch = /\$Import\s*\(\s*['|"]([\w\/\.\d]+)['|"]\s*\);?/img,
	combineTag = "/**combine by hugjs**/";
JSParse.prototype.parse = function(){
	var _self = this
		,contentList = [];
	
	function getCombineContent(abPath,callback){
		
		if(_self.alias.indexOf(abPath) >=0){
			callback && callback("");
			return;
		}
		
		if(path.extname(abPath.toLowerCase()) !== ".js"){
			abPath = abPath+".js";
		}
		var jsPath = path.join(_self.basePath,abPath);
		
		fs.exists(jsPath,function(exists){
			if(exists){
				getJSFileContent(jsPath,function(data){
					if(!data){
						callback && callback("");
						return;
					}
					parseData(abPath,data,function(){
						callback && callback();
					});
				})
			}else{
				_self.errorList.push(jsPath+" not exits!");
				callback && callback();
			}
		})
	};
	function parseData(jsAbPath,data,callback){
		// 已经合并，不再重复合并
		if(data.indexOf(combineTag) ==0){
			contentList.push(data);
			callback();
			return;
		}
		
		var depsList = [],
			dirName = path.dirname(jsAbPath),
			fileName = path.basename(jsAbPath),
			abRequireName = path.join(dirName,path.basename(jsAbPath,".js")).replace(/\\/g,"/");
		
		var importList = [],importalllist=[];
		// import list
		data = data.replace(jsImportMatch,function(match,$0){
			var requirePath = $0;
			if($0[0] == "."){
				requirePath = path.join(dirName,$0);
			}
			requirePath = requirePath.replace(/\\/g,"/");
			if(importalllist.indexOf(requirePath) >=0){
				return "";
			}else{
				importalllist.push(requirePath);
			}
			
			var _jsparse = new JSParse(_self.basePath,requirePath)
			_jsparse._match = match;
			
			importList.push(_jsparse);
			return match;
        });
		function dealJsParseList(list,cb){
			if(list.length == 0){
				cb && cb();
				return;
			}
			var p = list.shift();
			p.depList = _self.depList.concat();
			p.on("parsed",function(pp){
				data = data.replace(pp._match,pp._content);
				_self.depList = _self.depList.concat(pp.depList);
				
				var keys = pp.depTree.keySet();
				keys.forEach(function(a,i){
					var val = _self.depTree.get(a) || [];
					val = val.concat(pp.depTree.get(a));	
					_self.depTree.put(a, val);
				})
				dealJsParseList(list,cb);
			})
			p.parse();
		}
		_self.depTree.put(abRequireName, importalllist);
		
		dealJsParseList(importList,callNext);
		
		function callNext(){
			// 获得依赖的js
			data = data.replace(jsMatch,function(match,$0){
				var requirePath = $0
					//,depence = requirePath
					;
				if($0[0] == "."){
					requirePath = path.join(dirName,$0);
					//depence = path.join(dirName,$0+".js");
				}
				requirePath = requirePath.replace(/\\/g,"/");
				//depence = depence.replace(/\\/g,"/");
				depsList.push(requirePath);
				return "require(\""+requirePath+"\")";
	        });
			var realDepList = [];
			
			var tr = _self.depTree.get(abRequireName);
			tr = tr || [];
			tr = tr.concat(depsList);
			_self.depTree.put(abRequireName, tr);
			
			depsList.forEach(function(a,i){
				if(_self.depList.indexOf(a) < 0){
					realDepList.push(a);
				}
			})
			
			execList(realDepList.concat(),function(){
				var mydeppath = path.join(dirName,fileName).replace(/\\/g,"/");
				if(_self.depList.indexOf(mydeppath) < 0){
					data = replaceDefine(data,abRequireName);
					contentList.push(data);
					_self.depList.push(mydeppath);
				}
				_self.depList = _self.depList.concat(realDepList);
				
				callback();
			});
		}
	};
	
	function replaceDefine(data,moduleName){
		var keyWord = "define(";
		if(!data || data.indexOf(keyWord) < 0){
			return data;
		}
		moduleName = moduleName.replace(/\\/g,"/");
		
		var first = data.indexOf("define(")
			,allLast = data.substring(first)
			,defineLineIndex = allLast.indexOf("\n")
			,defineLine = allLast.substring(0,defineLineIndex) // define(function(){\n
			,suffix = allLast.substring(defineLineIndex)
			,before = data.substring(0,first)
			,defineWord = ""
			,hasDefine = false;
		
		// 检查是否已经填写了类名
		if(defineLine.indexOf("\"") >=0 || defineLine.indexOf("'") >=0){
			var spArr = defineLine.split(",");
			var mName = spArr[0].trim();
			if(mName[mName.length-1] == "\"" || mName[mName.length-1] == "'"){
				hasDefine = true;
			}
		}
		
		if(hasDefine){
			defineWord = defineLine;
		}else{
			// 未定义
			var leftK = defineLine.indexOf("(")
				,leftStr = defineLine.substring(0,leftK+1)
				,rightStr = defineLine.substring(leftK+1)
				;
			defineWord = leftStr+"\""+moduleName+"\","+rightStr;
		}
		suffix = replaceDefine(suffix,moduleName);
		return before+defineWord+suffix;
	}
	
	function execList(list,callback){
		if(list.length ==0){
			callback();
			return;
		}
		var req = list.shift();
		getCombineContent(req,function(data){
			contentList.push(data);
			execList(list,callback);
		});
	}
	function getJSFileContent(path,callback){
		fs.readFile(path,{
			encoding :"utf-8"
		},function(err, data){
			if(err){
				_self.errorList.push(err);
				callback(err);
				return;
			}
			callback(data);
		})
	}
	
	getCombineContent(_self.jsName,function(){
		_self._content = contentList.join("\n");
		_self.content = combineTag +"\n" +_self._content;
		
		_self.emit("parsed",_self);
	});
}
/**
 * 获得js文件的所有内容,包括里面的依赖
 */
JSParse.prototype.getFullContent = function(){
	return this.content;
}
function enunicode(code){
    code = code.replace(/[\u00FF-\uFFFF]/g, function($0){
        return '\\u' + $0.charCodeAt().toString(16);
    });
    return code;
};
/**
 * 获得压缩后的代码
 */
JSParse.prototype.getBeautiful = function(){
	var ast = uglify.parse(this.content)
	ast.figure_out_scope();
	var compressor = uglify.Compressor({
		warnings:false
	});
	ast = ast.transform(compressor);
	ast.figure_out_scope();
	ast.compute_char_frequency();
	ast.mangle_names();
	
	return combineTag +"\n"+enunicode(ast.print_to_string());
}
JSParse.prototype.destroy = function(){
	this.depList.length =0;
}
/**
 * 解析依赖树
 * @param {Object} tree
 */
JSParse.prototype.depsStr = function(){
	var _self = this
		,hasOut = {}
		;
		
	var outTree = function(obj,index){
		if(hasOut[obj]){
			return "";
		}
		hasOut[obj]=true;
		
		var result = ["|"];
		for(var i = 0 ; i < index;i++){
			result.push("--");
		}
		result.push(obj);
		result.push("\n");
		
		var list = _self.depTree.get(obj);
		if(list){
			list.forEach(function(a,i){
				result.push(outTree(a,index+1));
			})
		}
		return result.join("");
	}
	var mName = path.join(path.dirname(_self.jsName),path.basename(_self.jsName,".js")).replace(/\\/g,"/");
	return outTree(mName,0);
}

module.exports = JSParse;
