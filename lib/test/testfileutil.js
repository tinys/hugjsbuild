
var fileUtil = require("../FileUtils")
	;
	
var bef = Date.now();
//fileUtil.mkdirs("c:/a/b/c/d",function(){
//	console.log("mkright",Date.now() - bef)
//})

fileUtil.copy("D:/jdworkspace/tools/webapps/shidai.zip","c:/a/b/c/d/shidai.zip",function(){
	console.log("copyed",Date.now() - bef)
})
