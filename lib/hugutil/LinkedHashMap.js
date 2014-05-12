/*
 * LinkedHashMap
 */
function LinkedHashMap(){
	this.keyList = [];
	this.obj = {};
}
LinkedHashMap.prototype.put = function(key,value){
	if(this.keyList.indexOf(key) <0){
		this.keyList.push(key);
	}
	this.obj[key] = value;
}
LinkedHashMap.prototype.get = function(key){
	return this.obj[key];
}
LinkedHashMap.prototype.remove = function(key){
	var index = this.keyList.indexOf(key);
	if(index >=0){
		this.keyList.splice(index,1);
	}
	delete this.obj[key] ;
}
LinkedHashMap.prototype.keySet = function(){
	return this.keyList;
}
module.exports = LinkedHashMap;

