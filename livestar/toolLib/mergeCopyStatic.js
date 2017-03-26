
var mergeConfig = require("./mergeConfig.js")
var mergeParseJs = require("./mergeParseJs.js")
var wake = require("./fileWake.js")
var pt = require("path");
var fs = require("fs");

require("../pc/public/js/common/prototype.js")

//单个目录
function copyStaticSigle(staticPath,configJson,minCssPath,minJsPath){
	//拷贝静态文件

	var allfile = wake.findFile(staticPath,true);

	for(var i =0;i<allfile.length;i++){

		var buildPathFile = mergeConfig.getBulidPath(allfile[i]);
		var code;
		if( /\.js$/i.test(allfile[i]) ){
			code = mergeParseJs.parseJs(allfile[i])
		}else if( /\.css$/i.test(allfile[i])  ){
			code = mergeParseJs.parseCss(allfile[i])
		}else if( /\.html$/i.test(allfile[i])  ){
			code = mergeParseJs.parseIndex(allfile[i],configJson,minCssPath,minJsPath)
		}else{
			code = wake.readData(allfile[i]);
		}

		if(wake.isExist(buildPathFile) ){
			if(wake.readData(buildPathFile) == code){
				//console.log("no change will not copy".yellow,buildPathFile);
				configJson[buildPathFile] = wake.getModify(allfile[i]);
				continue
			}
		}
		if ( ( /\.js$/i.test(allfile[i]) )|| ( /\.css$/i.test(allfile[i])  )||( /\.html$/i.test(allfile[i])  )){
			wake.writeData(buildPathFile,code)
		}else{
			wake.copy(allfile[i],buildPathFile);
		}

		configJson[buildPathFile] = wake.getModify(allfile[i]);
	}



}
function copyStatic(staticPath,configJson){

	staticPath = Object.prototype.toString.call(staticPath)=="[object Array]"?staticPath:[staticPath];


	for(var i=0;i<staticPath.length;i++){
		copyStaticSigle(staticPath[i],configJson);
	}


}
exports = module.exports = function () {
	return this;
};

/*解析文件中的代码*/
exports.copy = function (staticPath,configJson,minCssPath,minJsPath) {
	copyStatic(staticPath,configJson,minCssPath,minJsPath);
}