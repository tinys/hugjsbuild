/**
 * 发布servlet
 */
var proUtil = require("../../util/proUtil"),
	HugPub = require("../pubpro/hugpub"),
	ZipPub = require("../pubpro/zippub"),
	JsZip = require("jszip"),
	DirReader = require("../../../lib/hugutil/DirReader"),
	fs = require("fs"),
	path = require("path")
	;

// 发布首页
exports.index = function(req, res){
	var data = {};
	// 所有项目
	var proList = proUtil.getProList();
	data.proList = proList;
	res.render("pubIndex", data);
}

function sendHead(res){
	var head = [];
		head.push('<html><head><meta http-equiv="content-type" content="text/html;charset=UTF-8"><title>发布工具</title></head><body>');
	
	res.write(head.join(""));
	
}
function sendFooter(res){
	res.write('</body></html>');
	res.end();
}
// 发布项目
function sendError(res,msg){
	res.write(msg+"<span style='color:red'>"+(msg || "出现错误")+"</span>");
}
function sendMessage(res,msg){
	if(msg){
		res.write("<p>"+msg+"</p>")
	}
}
exports.pub = function(req,res){
	var proName = req.param("proName"), // 项目名称
		// 是否压缩
		beautify = req.param("beautify"), 
		// 是否提供源代码
		need_source = req.param("need_source"), 
		// 是否有版本号
		needVersion = req.param("needVersion"), 
		// 版本号
		version = req.param("version"),			
		// 打版方式
		versionType = req.param("versionType"), 
		// 源代码文件后缀
		sourcesiffix = req.param("sourcesiffix")
		;
	var proCfg = proUtil.getProByName(proName);
	sendHead(res);
	if(!proCfg){
		sendError(res,proName+"不存在");
		sendFooter(res);
		return;
	}
	var project = Object.create(proCfg.pro);
	project.beautify = beautify;
	project.need_source = need_source;
	project.needVersion = needVersion;
	project.version = version;
	project.versionType = versionType;
	project.sourcesiffix = sourcesiffix;
	
	var hugpub = new HugPub(project,proCfg.hug);
	hugpub.on("pub",function(filePath,destPath){
		sendMessage(res,"process:"+filePath);
		sendMessage(res,"dest:"+destPath);
	})
	hugpub.on("end",function(filePath){
		sendMessage(res,"done..");
		sendFooter(res);
	})
	hugpub.on("error",function(error){
		sendError(res,JSON.stringify(error));
		sendFooter(res);
	})
	hugpub.doit();
}
function writeDownHead(res,mime,length,fileName){
	res.setHeader("Content-Type",mime);
	res.setHeader("Content-Disposition","attachment;filename="+fileName);
}
// zip 下载
exports.zipPro = function(req,res){
	var proName = req.param("proName");
	var proCfg = proUtil.getProByName(proName);
	if(!proCfg){
		res.writeHeader(400);
		res.end("");
		return;
	}
	var project = Object.create(proCfg.pro);
	project.beautify = "1";
	project.need_source = "1";
	project.needVersion = false;
	project.sourcesiffix = "_src";
	
	var zippub = new ZipPub(project,proCfg.hug);
	zippub.on("ready",function(content){
		writeDownHead(res,"application/zip",content.length,proName+".zip");
		res.write(content);
		res.end();
	})
	zippub.on("error",function(){
		res.writeHeader(500);
		res.end();
	})
	zippub.doit();
}
exports.zipFoloder = function(req,res){
	var proName = req.param("proName");
	var dirName = path.basename(proName);
	var zip = new JsZip();
	var foloder = proName;
	var reader = new DirReader(foloder,function(fp,isLast){
		var abPath = fp.replace(foloder,"");
		fs.readFile(fp,function(err,content){
			if(err){
				res.end();
				return;
			}
			zip.file(path.join(dirName,abPath),content);
			if(isLast){
				var content = zip.generate({type:"nodebuffer"});
				writeDownHead(res,"application/zip",content.length,dirName+".zip");
				res.write(content);
				res.end();
			}
		})
	});
	reader.scan();
}
