/**
 * 不在本webapps 下部署的项目列表
 * key: 项目访问路径
 * value:{path} 文件路径
 */
var path = require("path")
	;
var list = {
	"test":path.join(__dirname,"../lib/test")
}

module.exports = list;

