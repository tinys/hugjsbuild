/**
 * 项目相关配置
 * 
 */
var proList = require("../prolist")
	,fs = require("fs")
	,path = require("path")
	,config = require("../cfg")
	;

var systemPro = [];
function checkSystemPro(){
	var directory = config.dftPublicDir;
	var fileList = fs.readdirSync(directory);
	systemPro.length = 0;
	systemPro.push({
		pro:"/",
	 	dest:directory
	})
	fileList.forEach(function(a,i){
		var totalPath = path.join(directory,a);
		if(fs.statSync(totalPath).isDirectory()){
			systemPro.push({
				pro:a,
			 	dest:totalPath
			})
		}
	});
}

/**
 * 获得项目列表，以及项目所在的路径
 */
function getProList(){
	// 优先配置
	var cfgList = proList,
		result = [];
	/*
	 [
		 {
		 	pro:"",
		 	dest:""
		 }
	 ]
	 */
	for(var i in cfgList){
		result.push({
			pro:i,
			dest:cfgList[i]
		})
	}
	
	result = systemPro.concat(result);
	return result;
}

var hugCfg = {}
	,defaultCfg = {
		"js":{
			"basePath":"./",
			"alias":[]
		},
		"css":{
		},
		"output":config.dftPubPublicDir,
		"outputSrc":config.dftPubPublicDir,
		"outputType":[".js",".css",".png",".gif",".jpg",".swf",".html"],
		"outputCSS":[],
		"outputJS":[]
	};
/**
 * 
 * 通过path 
 * 	1.获得请求文件或文件夹路径
 *  2.获得项目根路径
 *  3.获得项目配置
 */ 
function getProPath(filePath){
	filePath = filePath || "/";
	var result = {
		basePath:"",	// 项目根目录
		resourcePath:"", // 文件路径
		pro:""
	}
	filePath = decodeURIComponent(filePath);
	
	var dirname = path.dirname(filePath)
		,baseName = path.basename(filePath)
		,extName = path.extname(filePath);
	
	var proList = getProList()
		,proName = "",dest="";
		
	var dirPath = extName?dirname:filePath;
	
	proList.forEach(function(a,i){

		if(dirPath.indexOf(a.pro) >=0 && a.pro.length >proName.length){
			proName = a.pro
			dest = a.dest;
		}
	});
	
	if(!proName || proName == "/"){
		result.basePath = config.dftPublicDir;
		result.resourcePath = path.join( config.dftPublicDir,baseName);
		result.pro = "";
	}else{
		result.basePath = dest;
		result.resourcePath = path.join(dest,filePath.replace(proName,""));
		result.pro = proName;
	}
	
	var hugc = loadHugCfg(result.basePath);
	
	if(!hugc.js.basePath || hugc.js.basePath.indexOf(".") ==0){
		result.jsBasePath = path.join(result.basePath,hugc.js.basePath);
	}else if(hugc.js.basePath){
		result.jsBasePath = hugc.js.basePath;
	}
	result.hugCfg = hugc;
	
	return result;
}
function loadHugCfg(basePath){
	var hugc = hugCfg[basePath];
	if(!hugc){
		var cfgPath = path.join(basePath,"hug.json");
		var hug = defaultCfg;
		if(fs.existsSync(cfgPath)){
			try{
				hug = require(cfgPath);
			}catch(e){
			}
		}
		hugc = hugCfg[basePath] = hug;
	}
	// 如果未指定打包位置，则在项目统计目录增加proName_dest 目录
	if(!hugc.output){
		hugc.output = path.join(config.dftPubPublicDir);
	}
	if(!hugc.outputSrc){
		hugc.outputSrc = path.join(config.dftPubPublicDir);
	}
	return hugc;
}
function getModuleName(basePath,destPath){
	var repla = destPath.replace(basePath,"").replace(/\\/g,"/");
	if(repla[0] == "/"){
		repla = repla.substring(1);
	}
	return repla;
}
function getProByName(name){
	if(!name && name !==""){
		return null;
	}
	
	var list = getProList(),
		pro,
		hugcfg;
	for(var i = 0 ; i < list.length;i++){
		if(list[i].pro == name){
			pro = list[i];
			break;
		}
	}
	if(pro){
		hugcfg = loadHugCfg(pro.dest);
	}
	if(hugcfg && hugcfg.js && (!hugcfg.js.basePath || hugcfg.js.basePath.indexOf(".") ==0)){
		pro.jsBasePath = path.join(pro.dest,hugcfg.js.basePath);
	}else if(hugcfg && hugcfg.js && hugcfg.js.basePath){
		pro.jsBasePath = hugcfg.js.basePath;
	}
	return {
		pro:pro,
		hug:hugcfg
	};
}
var watchTimeout = null;
function initWabappListener(){
	var defaltAppPath = config.dftPublicDir;
	fs.watch(defaltAppPath,function(event, filename){
		if(watchTimeout){
			clearTimeout(watchTimeout);
		}
		watchTimeout = setTimeout(function(){
			checkSystemPro();
		},5*1000)
	})
}
checkSystemPro();
initWabappListener();


exports.getProPath = getProPath;
exports.getProList = getProList;
exports.reload = checkSystemPro;
exports.getModuleName = getModuleName;
exports.getProByName = getProByName;