
var mergeConfig = require("./mergeConfig.js")
var mergeParseJs = require("./mergeParseJs.js")
var wake = require("./fileWake.js")
var pt = require("path");
var fs = require("fs");


/*
 *
 *解析行内脚本，不解析php的smart标签
 *
 * */
function replaceScript( indexData, smarty ){

	var scriptReg = /<script[^>]*>([\u0000-\uFFFF]*?)<\/script>/gmi;

	var scriptTag = indexData.match(scriptReg);

	for(var i in scriptTag){

		scriptReg.lastIndex = 0;

		var origCodeArr = scriptReg.exec(scriptTag[i]);

		var temp = origCodeArr&&origCodeArr[1]&&origCodeArr[1].trim();

		if(temp){


			var str = mergeParseJs.parseScript(temp);

			//smaty标签要用单引号包裹
			if(smarty){
				str = str.replace(/"(\s*<\s*\{\$[^}]+\}\s*>\s*)"/gmi,"$1");
			}

			indexData = indexData.replace(origCodeArr[1],str);
		}
	}

	return indexData;

}

/*
 *
 *获取文件更新时间
 *
 * */
function getFileModify(file){

	var fileStat = fs.statSync(file);

	var modify = fileStat.mtime.toDate().getTime();

	return modify;
}

/*
 *
 *去掉没有用html注释
 *
 * */;
function removeInject(indexData){

	var inject = indexData.match(/<!--.*?-->/gm);

	for(var item in inject){

		//ie的预编译
		var isIEPrecompiled = /^<!--\s*\[/.test(inject[item]);

		//合并css代码的预编译
		var isMergeCssTag =  /^<!--\s*start\s+mergeCss:/.test(inject[item])||/^<!--\s*end\s+mergeCss/.test(inject[item]);

		//合并js代码的预编译
		var isMergeJsTag =  /^<!--\s*start\s+mergeJs:/.test(inject[item])||/^<!--\s*end\s+mergeJs/.test(inject[item]);

		if( !isIEPrecompiled && !isMergeCssTag && !isMergeJsTag ){

			indexData = indexData.replace( inject[item], "")

		}

	}

	return indexData;

}


/*
* 合并文件
* 返回最后生成的文件的更改时间
*
* */
function mergeFile(flieIn, fileOut, configJson, getCode) {

	var flieIn = Array.isArray(flieIn) ? flieIn : [flieIn];

	var  finalCode = '';

	for (var i = 0; i < flieIn.length; i++) {
		//console.log(flieIn[i])
		finalCode += getCode(flieIn[i]);

	}


	//必须放在前面。执行第二次也要赋值


	if (wake.isExist(fileOut)) {

		if (wake.readData(fileOut) == finalCode) {

			//console.log("文件未改变".yellow, fileOut);

			return configJson[fileOut] = getFileModify(fileOut);

		}

	}

	//console.log("重新写入新数据".green, fileOut)

	wake.writeData(fileOut, finalCode);

	return  configJson[fileOut] = getFileModify(fileOut);
}

/*
 * js合并压缩
 * 返回最后生成的文件的更改时间
 *
 * */
function jsMinifier(flieIn, fileOut, configJson){

	return mergeFile(flieIn, fileOut, configJson, function(file){

		//VUE和sdk都使用了webpack和webpack有点冲突
		if(file.indexOf("vue.js")!=-1||file.indexOf("Web_SDK")!=-1){
			return ';' + mergeParseJs.parseJsNoModule(file);
		}else{
			return ';' + mergeParseJs.parseJs(file);
		}

	})

}

/*
 * css合并压缩
 * 返回最后生成的文件的更改时间
 *
 * */
function cssMinifier(flieIn, fileOut, configJson) {

	return mergeFile(flieIn, fileOut, configJson, function(file){
		return mergeParseJs.parseCss(file);
	});
}

/*
 * 将压缩块里提取css,js文件，和压缩名称
 *
 * */

/**/
function getFileInfo(str,orgReg,linkReg){

			// console.log(str)
			orgReg.lastIndex =0;

			var regRet = orgReg.exec(str);

			var ret = {name:"",files:[]};

			//获取压缩后的文件名
			ret.name = regRet&&regRet[1];

			ret.files = str.match(linkReg);
	
			//拉到数据
			if( ret.files ){
				ret.files.forEach(function(val,idx){

					//归零
					linkReg.lastIndex = 0

					 var temp = linkReg.exec( val);

						 temp = temp&&temp[1]&&temp[1].trim();

					 if( temp ){
						 ret.files[idx] = mergeConfig.getAccentPath(temp)
					 }

				})
			}

			return ret;
}



/*
* mergeCssPath合并之后的路径
* */
function parseIndexCss(indexData,mergeBuildPath,configJson){

	//.*?惰性匹配 合并css标签
	var cssReg = /<!--\s*start\s+mergeCss:([0-9a-z_.]+)\s*-->.*?<!--\s*end\s+mergeCss\s*-->/img
	var noteCss = indexData.match(cssReg);

	//合并css
	for(var css in noteCss){

		//获取合并之后的名字和要合并的文件
		var linkReg = /href\s*='*"*([^'"]*)'*"/img;
		var cssInfo =  getFileInfo(noteCss[css],cssReg,linkReg);

		//console.log("将要合并css信息".yellow,cssInfo);

		// 加后缀
		if(!/\.css$/.test(cssInfo.name)){
			cssInfo.name = cssInfo.name+".css"
		}
		
		//合并路径需要处理//public/css/min/
		var mergeCssPath = (mergeBuildPath+"/"+cssInfo.name).toURI();

		// 合并和压缩并且返回版本号
		var ver = cssMinifier(cssInfo.files, mergeConfig.getBulidPath(mergeCssPath), configJson);

		indexData = indexData.replace( noteCss[css],'<link rel="stylesheet" type="text/css" href="{0}">'.tpl(mergeConfig.getRootPath(mergeCssPath)+"?v="+ver))
	}

	return indexData;
}


function parseIndexJs(indexData,mergeBuildPath,configJson){

		//.*?惰性匹配 合并js标签
	var jsReg = /<!--\s*start\s+mergeJs:([0-9a-z_.]+)\s*-->.*?<!--\s*end\s+mergeJs\s*-->/img
	var noteJs = indexData.match(jsReg);


	for(var js in noteJs){

		var scriptSrcReg = /src\s*='*"*([^'"]*)'*"/img;

		var jsInfo =  getFileInfo(noteJs[js],jsReg,scriptSrcReg );

		//console.log("将要合并js信息".yellow,jsInfo)

		// 加后缀
		if(!/\.js$/.test(jsInfo.name)){
			jsInfo.name = jsInfo.name+".js"
		}


		//合并路径需要处理//public/js/min/
		var mergeJsPath = (mergeBuildPath+"/"+jsInfo.name).toURI();

		var ver = jsMinifier( jsInfo.files, mergeConfig.getBulidPath(mergeJsPath), configJson );

		indexData = indexData.replace( noteJs[js],'<script src="{0}"></script>'.tpl(mergeConfig.getRootPath(mergeJsPath)+"?v="+ver))
	}
	return indexData;
}

/*
 * 解析html
 *
 * */
function getHtmlCode(indexFile,configJson,mergeCssPath,mergeJsPath){

	var indexData = wake.readData( indexFile );

	//压缩script标签里面js
	indexData = replaceScript(indexData,true);

	//去掉空格
	indexData = indexData.replace(/\s+/gmi," ");

	//去掉注解
	indexData = removeInject(indexData);

	indexData = parseIndexCss(indexData,mergeCssPath,configJson)

	indexData = parseIndexJs(indexData,mergeJsPath,configJson)

	//去掉debug
	indexData = indexData.replace("window.PAGE.DEBUG=!0","window.PAGE.DEBUG=0");
	indexData = indexData.replace(/window\.PAGE\.DEBUG\s*=\s*true\s*/,"window.PAGE.DEBUG=false");
	indexData = indexData.replace("window.PAGE.STATICDEBUG=!0","window.PAGE.STATICDEBUG=0");
	indexData = indexData.replace(/window\.PAGE\.STATICDEBUG\s*=\s*true\s*/,"window.PAGE.STATICDEBUG=false");

	return indexData;
}
/*
 * 解析首页的文件
 *
 * */
function parseIndex(indexFile,configJson,mergeCssPath,mergeJsPath){


	console.log("---------------解析入口文件---------------------".yellow,indexFile);

	var indexData = getHtmlCode(indexFile,configJson,mergeCssPath,mergeJsPath)

	//获取index文件的信息
	var outAccentPath = mergeConfig.getBulidPath(indexFile)

	//当前文件没有变化而且其他文件的版本号不用升级就不用写入数据了
	if( wake.isExist(outAccentPath) ){

		if(wake.readData(outAccentPath) == indexData){

			//console.log("入口文件没变化不覆盖".yellow,outAccentPath)

			return configJson[outAccentPath] = getFileModify(outAccentPath);

		}
	}

	//console.log("入口文件覆盖".green,outAccentPath);

	wake.writeData(outAccentPath,indexData);

	return configJson[outAccentPath] = getFileModify(outAccentPath);

}

function parseHtml(htmlPath,configJson,mergeCssPath,mergeJsPath){

	console.log("-----解析html入口文件-----------：".yellow)

	var files = wake.findFile(htmlPath,"html",true);
	var temp;


	for(var i in files){

		temp = files[i];

		if(temp){

			//console.log("解析：".yellow,temp)

			//获取css模块,并且记录所有文件的更改时间
			var tempCss = temp.replace(/.html$/,".css");
			var cssCode = mergeParseJs.parseCss(tempCss);
			if(cssCode.trim()){
				cssCode = "<style>{0}</style>".tpl(cssCode);
			}

			//获取js模块,并且记录所有文件的更改时间
			var tempJs = temp.replace(/.html$/,".js");
			var jsCode = mergeParseJs.parseJs(tempJs);
			if(jsCode.trim()){
				jsCode = "<script>{0}</script>".tpl(jsCode);
			}

			//压缩script标签//占时没有压缩路径
			var htmlCode =  getHtmlCode(temp,configJson,mergeCssPath,mergeJsPath);

			var indexData = cssCode+"\n" + htmlCode+"\n" + jsCode;

			//获取index文件的信息
			var outAccentPath = mergeConfig.getBulidPath(temp)

			//当前文件没有变化而且其他文件的版本号不用升级就不用写入数据了
			if( wake.isExist(outAccentPath) ){

				if(wake.readData(outAccentPath) == indexData){

					//console.log("入口文件没变化不覆盖".yellow,outAccentPath)

					 configJson[outAccentPath] = getFileModify(outAccentPath);

					continue;
				}
			}

			//console.log("入口文件覆盖".green,outAccentPath);

			wake.writeData(outAccentPath,indexData);

			 configJson[outAccentPath] = getFileModify(outAccentPath);


		}

	}

}

exports = module.exports = function () {
	return this;
};

/*解析文件中的代码*/
exports.parseIndex = function (indexFile,configJson,mergeCssPath,mergeJsPath) {
	parseIndex(indexFile,configJson,mergeCssPath,mergeJsPath)
}
/*解析文件中的代码*/
exports.parseHtml = function (indexFileDir,configJson,mergeCssPath,mergeJsPath) {
	return parseHtml(indexFileDir,configJson,mergeCssPath,mergeJsPath)
}
