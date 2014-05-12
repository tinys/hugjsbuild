var hugpub = require("../../server/pub/pubpro/hugpub")
	proUtil = require("../../server/util/proUtil")
	;


var testPro = proUtil.getProByName("test");

//console.log(JSON.stringify(testPro))

var pub = new hugpub(testPro.pro,testPro.hug);
pub.doit();
