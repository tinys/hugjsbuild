
var JSParse = require("../jsparse/jsParse")
	,path = require('path');

var basePath = path.join(__dirname,"js"),
	jsName = "output";
var start = Date.now();

var selfJsParse = new JSParse(basePath,jsName,["util","events","fs","path"]);
selfJsParse.on("parsed",function(parse){
	var end = Date.now();
	console.log(parse.content)
	console.log("parse time:"+(end-start))
})

selfJsParse.parse();
