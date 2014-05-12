var JsZip = require("jszip"),
	DirReader = require("../hugutil/DirReader"),
	fs = require("fs"),
	path = require("path")
;


var zip = new JsZip();
var foloder = path.join(__dirname,"css");
var zipfile = path.join(__dirname,"zip.zip");
var reader = new DirReader(foloder,function(fp,isLast){
	var abPath = fp.replace(foloder,"");
	fs.readFile(fp,function(err,content){
		zip.file(path.join("test",abPath),content);
		if(isLast){
			var content = zip.generate({type:"nodebuffer"});
			fs.writeFile(zipfile,content,function(){
				console.log("write ok")
			});
		}
	})
});
reader.scan();