var DirReader = require("../hugutil/DirReader")

var reader = new DirReader(__dirname,function(path,isLast){
	console.log(path,isLast);
});
reader.on("error",function(e){
	console.log(e);
})
reader.on("scaned",function(){
	console.log("done")
})
reader.filter(function(path){
	
	return true;
}).scan();


