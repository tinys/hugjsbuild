/**
 * 
 */
var path = require("path")
	;

module.exports = {
	resourceServer:{
		port:"80"
	},
	pubServer:{
		port:"3000"
	},
	dftPublicDir:path.join(__dirname,"..","webapps"),
	dftPubPublicDir:path.join(__dirname,"..","webapps_"),
	cfgFileName:"package.json",
	host:{
		// m.jd.com
		"localhost":"211.151.109.110"
	}
}
