/**
 * 监控js ，css 请求
 * 
 * 
 */
var path = require("path")
	,fs = require("fs")
	,proUtil = require("../util/proUtil")
	,JSParse = require("../../lib/jsparse/JSParse")
	,CssParse = require("../../lib/cssparse/CssParse")
	;

module.exports =  function(){
  
  return function(req,res,next){
	var reqPath = req.path
		,extName = path.extname(reqPath).toLowerCase();
	
	if(extName == ".js" || extName ==".css"){
		var proInfo = proUtil.getProPath(reqPath);
		if(proInfo){
			var destFile = proInfo.resourcePath;
			fs.exists(destFile,function(exist){
				if(exist){
					var parser = null;
					if(extName == ".js"){
						res.header('Content-Type', 'application/x-javascript;Charset=utf-8');
						var mName = proUtil.getModuleName(proInfo.jsBasePath,proInfo.resourcePath);
						parser = new JSParse(proInfo.jsBasePath,mName,proInfo.hugCfg && proInfo.hugCfg.js && proInfo.hugCfg.js.alias);
					}else{
						res.header('Content-Type', 'text/css;Charset=utf-8');
						parser = new CssParse(proInfo.resourcePath);
					}
					parser.on("parsed",function(par){
						var output = par.content;
						if(extName == ".js"){
							var str = "/**\n"+par.depsStr()+"**/";
							output = str+output;
						}
						res.send(output);
						
						res.end();
					});
					parser.parse();
				}else{
					next();
				}
			})
		}
	}else{
		next();
	}
  }
}
