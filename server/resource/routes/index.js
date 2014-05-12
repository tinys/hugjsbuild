/**
 * 资源文件响应
 * 
 */
var proUtil = require("../../util/proUtil")
	,path = require("path")
	,fs = require("fs")
	,http = require('http')
	,config = require("../../cfg"),
	async = require("async")
	;

var resourceNotFount = function(res){
	res.status(404);
	res.write("file not exists");
	res.end();
},
resourceToNet = function(reqPath,req,res){
	var host = req.host;
	var ip = config.host[host];
	if(ip){
		 var options = {
            hostname: ip,
            port: 80,
            path: req.path,
            method: "GET"
        };
        var request = http.request(options, function(ress) {
            if(ress.statusCode == 404){
              res.set('Content-Type', 'text/plain');
              res.status(404);
              res.end();
              return;
            }
            ress.on('data', function (chunk) {
                res.write(chunk);
            });
			ress.on('end', function () {
                res.end();
            });
			
        });
        request.on('error', function(e) {
            res.sendfile(reqPath);
        });
        request.end();
		return;
	}
	res.status(404);
	res.write("file not exists");
	res.end();
}
,
// 跳转到目录
redirectDirectory = function(proInfo,req,res){
	var data = {
        parent: path.join(req.path, "../"),
        path: req.path,
		downHost:"http://"+req.host+":"+config.pubServer.port,
        fileList: []
    };
	if(!proInfo.pro){
		// 全部项目
		var proList = proUtil.getProList();
		proList.forEach(function(a,i){
			data.fileList.push({
				reqUrl:a.pro,
				name:a.pro,
				isPro:true
			})
		});
		var resourcePath = proInfo.resourcePath;
		fs.readdir(resourcePath,function(eror,files){
			var callList = [];
			
			files.forEach(function(a,i){
				var alP = path.join(resourcePath,a);
				callList.push(function(cb){
					fs.stat(alP,function(err,stats){
						if(err){
							cb(err);
							return;
						}
						if(!stats.isDirectory()){
							data.fileList.push({
								reqUrl:path.join(req.path,a),
								name:a,
								dest:alP,
								isDirectory:stats.isDirectory()
							})
						}
						cb(null);
					})
				})
			})
			async.parallel(callList,function(){
				res.render("index", data);
			})
		});
	}else{
		var resourcePath = proInfo.resourcePath;
		fs.readdir(resourcePath,function(eror,files){
			var callList = [];
			
			files.forEach(function(a,i){
				var alP = path.join(resourcePath,a);
				callList.push(function(cb){
					fs.stat(alP,function(err,stats){
						if(err){
							cb(err);
							return;
						}
						data.fileList.push({
							reqUrl:path.join(req.path,a),
							name:a,
							dest:alP,
							isDirectory:stats.isDirectory()
						})
						cb(null);
					})
				})
			})
			async.parallel(callList,function(){
				res.render("index", data);
			})
		});
	}
}
,
// 跳转到file
redirectToFile = function(filePath,res){
	res.sendfile(filePath);
}
;


exports.index = function(req,res){
	
	var reqPath = req.path
		,proInfo = proUtil.getProPath(reqPath)
	;
	var resourcePath = proInfo.resourcePath;
	// 判断是否是文件夹
	fs.exists(resourcePath,function(exists){
		if(exists){
			fs.stat(resourcePath, function(error,stat){
				if(error){
					resourceNotFount(res);
					return;
				}
				if(stat.isDirectory()){
					redirectDirectory(proInfo,req,res);
					return
				}
				redirectToFile(resourcePath,res);
			})
		}else{
			resourceToNet(reqPath,req,res);
		}
	})
		
	
}
