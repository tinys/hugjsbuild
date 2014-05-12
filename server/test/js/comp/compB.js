/**combine by hugjs**/

var fun = function(){
	
}
define("comp/mod/fun",function(require){
	console.log("this is a function")
})


define("comp/mod/obj",{
	desc:"this is an object"
})


define("comp/mod/str","this is a string")




define("comp/mod/regAll.Str","this is a register string")
define("comp/mod/regAll.obj",{
	desc:"reg object"
})
define("comp/mod/regAll.fun",function(require){
	
})
define("comp/mod/regAll",function(require){
	
})


define("comp/compA",function(require){
	var funs = require("comp/mod/fun")
		,obj = require("comp/mod/obj")
		,str = require("comp/mod/str")
		,regAll = require("comp/mod/regAll")
	
	
})


define("comp/compB",function(require){
	var compB = require("comp/compA");
	
})
