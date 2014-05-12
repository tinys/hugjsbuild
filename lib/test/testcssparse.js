
var CssParse = require("../cssparse/CssParse")
	,path = require('path');

var basePath = path.join(__dirname,"css"),
	jsName = "output";
var start = Date.now();

var selfCssParse = new CssParse(path.join(basePath,"index.css"));
selfCssParse.on("parsed",function(parse){
	var end = Date.now();
	console.log(selfCssParse.content)
	console.log("parse time:"+(end-start))
})

selfCssParse.parse();
