
require("../../pc/public/js/common/prototype.js")
var wake = require("../../toolLib/fileWake.js")
var mergeConfig = require("../../toolLib/mergeConfig.js");
var mergeParseIndex = require("../../toolLib/mergeParseIndex.js");
var mergeCopyStatic = require("../../toolLib/mergeCopyStatic.js");
var mergeDelFile = require("../../toolLib/mergeDelFile.js");
var mergeCdn = require("../../toolLib/mergeCdn.js");

var ar = process.argv.slice(2);

var indexConfig =  "./build/config.json";

var configJson = {};



if(~ar.indexOf("-refresh") ){
	console.log("--------remove all config file to refresh node mergeTool -refresh------------".green);
	wake.remove(indexConfig);
}



/*----------------------index-----------------*/
var minCssPath = "../../pc/public/css/min";

var minJsPath= "../../pc/public/js/min";

var indexFile =  "../../index.html";

mergeParseIndex.parseIndex(indexFile,configJson,minCssPath,minJsPath);

/*----------------------html-----------------*/

 minCssPath = "../../pc/public/css/min";

 minJsPath= "../../pc/public/js/min";

var accentHtmlPath = "../../pc/html";

mergeParseIndex.parseHtml(accentHtmlPath,configJson,minCssPath,minJsPath);

/*----------------------copy static-----------------*/

minCssPath = "../../pc/public/css/min";

minJsPath= "../../pc/public/js/min";

var staticPath = [
	"../../pc/public/images",
	"../../pc/public/js/lib/IEPlugin",
	"../../pc/public/js/player",
	"../../pc/public/js/lib/upload",
	"../../pc/public/css/emoj",
	"../../pc/public/css/font",
	"../../pc/lang_en/"
]

mergeCopyStatic.copy(staticPath,configJson,minCssPath,minJsPath);

/*----------------------create json-----------------*/
configJson[indexConfig] = "self";
if(wake.isExist(indexConfig)&&wake.readData(indexConfig) ==JSON.stringify(configJson)){
	console.log("config.json is not modify".yellow)
}else{
	console.log("overwrite config.json".green)
	wake.writeData(indexConfig,JSON.stringify(configJson));
}

// //删除之前的文件
mergeDelFile.delFile("./build/",configJson);

//删除空文件夹
wake.removeEmptyDir("./build/");



/*----------------------cdn+version----------------*/

if( ~ar.indexOf("-cdn") ){
	var AllowAccess = [
		"pc/public/css/font",
		"pc/public/js/player",
		"pc/public/css/min/main.font.min.css"
	]
	var cdnPathMatch = /[^\s'"=()]*\/pc\/public\/[^\s'"()]*/gim;
	var cdnACTmatch = /^\/pc\/public/gim;
	var cdnPath = "http://lscdn.livestar.com/res/";
	mergeCdn.changeCDNPath(mergeConfig.getBulidPath(),cdnPathMatch,cdnPath,cdnACTmatch,AllowAccess);
	mergeCdn.addVersion(mergeConfig.getBulidPath(),cdnPathMatch,cdnPath);
}

/*----------------------copy to work-----------------*/

if( ~ar.indexOf("-work") ){


	var buildDir = mergeConfig.getBulidPath("../../pc");
	var workDir = "E:/wamp/www/liveStar/web/pc";

	var buildIndexFile = mergeConfig.getBulidPath("../../index.html");
	var workIndexFile = "E:/wamp/www/liveStar/app/www/template/livestar/pc/index.html";

	console.log("---------work ------------".green,buildDir," to ",workDir,buildIndexFile," to ",workIndexFile);


	wake.copyDir( buildDir, workDir );
	wake.copy(buildIndexFile,workIndexFile);

	var workConfigJson = recoverWork(configJson,function(key){
		key = key.replace(buildDir,workDir);
		return key

	});

	//删除多余的文件
	mergeDelFile.delFile(workDir,workConfigJson);

	//删除空文件夹
	wake.removeEmptyDir(workDir);

}

/*----------------------work获得相同的配置----------------*/
function recoverWork(config,cover){
	var obj = {};
	for(var key in config){
		obj[cover(key)] = config[key];
	}
	return obj;
}