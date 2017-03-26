//文件操作
var wake = require("../../toolLib/fileWake.js")
var pt = require("path")
//扩展一下原型的方法
require("../../pc/public/js/common/prototype.js")
//js压缩
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify; 
//会将1px solid #4444；转换为 solid #444.不满足要求目前不适用后期优化
// var CleanCSS = require('clean-css');
// var cleanCSS = new CleanCSS();

var cleanCSS = {
	minify:function(str){
		str = str.replace(/\/\*.*?\*\//gm,"").replace(/\s+/gm," ");
		return{styles:str};
	}
}

var fs = require("fs")


/*js合并压缩*/
function jsMinifier(flieIn, fileOut,config,newConfig,indexModify) {
     var flieIn=Array.isArray(flieIn)? flieIn : [flieIn];

     var origCode,ast,finalCode='',fileStat,modify=0;
     for(var i=0; i<flieIn.length; i++) {

     	//更改时间作为是否压缩
		fileStat = fs.statSync(flieIn[i]);
		modify += fileStat.mtime.toDate().getTime();


        origCode = wake.readData(flieIn[i]);
        finalCode +=';'+parseJsCode(origCode);
     }


     //必须放在前面。执行第二次也要赋值
	newConfig[fileOut] = modify

     if(config[fileOut]==modify && wake.isExist(fileOut)){
     	console.log("js没变化不会覆盖文件".green,fileOut)
     	return modify;
     }

    

	console.log("js重新写入新数据".green,fileOut)

	//只要有更改就会改变首页文件
	indexModify&&(indexModify.flag = true);

   wake.writeData(fileOut, finalCode);

     return modify;
}
// jsp.parse(code, strict_semicolons) - 解析JS代码并返回AST。strict_semicolons是可选的，默认为false，当传入true，解析器会在预期为分号而实际没找到的情况下抛出错误。对于大多数JS代码我们不需要那么做，但严格约束代码很有益处。
// pro.ast_mangle(ast, options) - 返回经过变量和函数名称混淆的AST，它支持以下选项： 
// toplevel - 混淆顶级作用域的变量和函数名称（默认不开启）。
// except - 指定不被压缩的名称的数组 
// pro.ast_squeeze(ast, options) - 开启深度优化以降低代码尺寸，返回新的AST，选项可以是一个hash，支持的参数有： 
// make_seqs （默认true） 将多个语句块合并为一个。
// dead_code （默认true） 将删除不被使用的代码。 
// pro.gen_code(ast, options) - 通过AST生成JS代码。默认输出压缩代码，但可以通过调整选项参数获得格式化的输出。选项是可选的，如果传入必须为对象，支持以下选项： 
// beautify: false - 如果希望得到格式化的输出，传入true
// indent_start: 0 （仅当beautify为true时有效） - 初始缩进空格
// indent_level: 4 （仅当beautify为true时有效） - 缩进级别，空格数量
// quote_keys: false - 传入true将会用引号引起所有文本对象的key
// space_colon: false （仅当beautify为true时有效） - 是否在冒号前保留空格
// ascii_only: false - 传入true则将编码非ASCII字符到\uXXXX 
function parseJsCode(origCode){
		var ast = jsp.parse(origCode);
        ast = pro.ast_mangle(ast);//混淆
        ast= pro.ast_squeeze(ast); //获取经过压缩优化的AST
       	ast=  pro.gen_code(ast);
       	return ast;
}
 
/*js合并压缩*/
function cssMinifier(flieIn, fileOut,config,newConfig,indexModify) {


	// console.log(flieIn)
     var flieIn=Array.isArray(flieIn)? flieIn : [flieIn];
     var origCode,finalCode='',fileStat,modify=0;;
     for(var i=0; i<flieIn.length; i++) {

     	//更改时间作为是否压缩
		fileStat = fs.statSync(flieIn[i]);
		modify += fileStat.mtime.toDate().getTime();

        origCode = wake.readData(flieIn[i]);
        finalCode += cleanCSS.minify(origCode).styles;
     }

     //必须放在前面。执行第二次也要赋值
     newConfig[fileOut] = modify

     //校验文件是否改动
     if(config[fileOut]==modify && wake.isExist(fileOut)){
     	console.log("css没变化不会覆盖文件".yellow,fileOut)
     	return modify;
     }



	console.log("css重新写入新数据".green,fileOut)

	//只要有更改就会改变首页文件
	indexModify&&(indexModify.flag = true);

     wake.writeData(fileOut, finalCode);

     return modify;
}

/*将压缩块里提取css,js文件，和压缩名称*/
function getFileInfo(str,orgReg,inPath,isJs){
			var reg = /href\s*='*"*([^'"]*)'*"/img;
			if(isJs){
				reg = /src\s*='*"*([^'"]*)'*"/img;
			}
			// console.log(str)
			orgReg.lastIndex =0;
			var regRet = orgReg.exec(str);
			
			var name ="" ;
			var files = [];

			//获取压缩后的文件名
			if(regRet&&regRet[1]){
				name = regRet[1];
			}


			files= str.match(reg);
	
			//拉到数据
			if(files){
				files.forEach(function(val,idx){
					//归零
					reg.lastIndex = reg.index = 0
					 var temp =reg.exec( val);
					 if(temp&&temp[1]){
					 	 files[idx] = inPath+temp[1].trim()
					 }

				})
			}

			return {files:files,name:name}
}

//去掉没有用html的注释
function removeInject(indexData){
	var inject = indexData.match(/<!--.*?-->/gm);
	for(var item in inject){
		var isIEPrecompiled = /^<!--\s*\[/.test(inject[item]);
		var isMergeCssTag =  /^<!--\s*start\s+mergeCss:/.test(inject[item])||/^<!--\s*end\s+mergeCss/.test(inject[item]);
		var isMergeJsTag =  /^<!--\s*start\s+mergeJs:/.test(inject[item])||/^<!--\s*end\s+mergeJs/.test(inject[item]);
		//注释不是ie预编译
		//不是merge css
		//不是merge js
		if( !isIEPrecompiled && !isMergeCssTag && !isMergeJsTag ){
			indexData = indexData.replace(inject[item],"")
		}
	}
	return indexData;
}


function replaceScript(indexData,smarty){
	var scriptReg = /<script[^>]*>([\u0000-\uFFFF]*?)<\/script>/gmi;
	var scriptTag = indexData.match(scriptReg);

	for(var i in scriptTag){
		scriptReg.lastIndex = 0;
		var origCodeArr = scriptReg.exec(scriptTag[i]);
		
		if(origCodeArr&&origCodeArr[1]&&origCodeArr[1].trim()){

			var str = parseJsCode(origCodeArr[1]);

			//smaty标签要用单引号包裹
			if(smarty){
				str = str.replace(/"(\s*<\s*\{\$[^}]+\}\s*>\s*)"/gmi,"'$1'");
			}

			indexData = indexData.replace(origCodeArr[1],str);
		}
	}

	return indexData;
	
}

function parseIndexCss(indexData,inPath,outPath,accentPath,config,newConfig,indexModify){

	//.*?惰性匹配 合并css标签
	var cssReg = /<!--\s*start\s+mergeCss:([0-9a-z_.]+)\s*-->.*?<!--\s*end\s+mergeCss\s*-->/img
	var noteCss = indexData.match(cssReg);



	//合并css
	for(var css in noteCss){

		//获取合并之后的名字和要合并的文件
		var cssInfo =  getFileInfo(noteCss[css],cssReg,inPath);

		console.log("合并css信息".yellow,cssInfo)

		// 加后缀
		if(!/\.css$/.test(cssInfo.name)){
			cssInfo.name = cssInfo.name+".css"
		}
		//合并路径需要处理//
		var outItemPath = (outPath+accentPath+"public/css/min/"+cssInfo.name).replace(/\/+/g,"/");

		// 合并和压缩并且返回版本号
		var ver = cssMinifier(cssInfo.files, outItemPath, config, newConfig, indexModify);

		var activePath = (accentPath+"public/css/min/"+cssInfo.name).replace(/\/+/g,"/");

		indexData = indexData.replace( noteCss[css],'<link rel="stylesheet" type="text/css" href="{0}">'.tpl(activePath+"?v="+ver))
	}
	return indexData;
}


function parseIndexJs(indexData,inPath,outPath,accentPath,config,newConfig,indexModify){
		//.*?惰性匹配 合并js标签
	var jsReg = /<!--\s*start\s+mergeJs:([0-9a-z_.]+)\s*-->.*?<!--\s*end\s+mergeJs\s*-->/img
	var noteJs = indexData.match(jsReg);



	for(var js in noteJs){

		var jsInfo =  getFileInfo(noteJs[js],jsReg,inPath,true);

		console.log("合并js信息".green,jsInfo)

		// 加后缀
		if(!/\.js$/.test(jsInfo.name)){
			jsInfo.name = jsInfo.name+".js"
		}
		//合并路径需要处理
		var outItemPath = (outPath+accentPath+"public/js/min/"+jsInfo.name).replace(/\/+/g,"/");

		var ver = jsMinifier( jsInfo.files, outItemPath , config, newConfig, indexModify );

		var activePath = (accentPath+"public/js/min/"+jsInfo.name).replace(/\/+/g,"/");

		indexData = indexData.replace( noteJs[js],'<script src="{0}"></script>'.tpl(activePath+"?v="+ver))
	}
	return indexData;
}

//解析首页的文件
 function parseIndex(inPath, outPath,indexFile,accentPath,configFile) {

	console.log("解析入口文件：".red,indexFile);

	var indexData = wake.readData( indexFile )

	//压缩script标签里面js
	indexData = replaceScript(indexData,true);
	
	//去掉注解
	indexData = removeInject(indexData.replace(/\s+/g, " "));
	
	//获取原有的文件信息
	var config
	try{
		if(wake.isExist(configFile)){
			config = JSON.parse(wake.readData(configFile))
		}
		
	}catch(e){
		console.log(e);
	}
	

	config = config||{};
	
	//重新配置一份数据
	var newConfig = {};

	var indexModify = {flag:false}

	indexData = parseIndexCss(indexData,inPath,outPath,accentPath,config,newConfig,indexModify)

	indexData = parseIndexJs(indexData,inPath,outPath,accentPath,config,newConfig,indexModify)

	//去掉debug
	indexData = indexData.replace("window.PAGE.DEBUG=!0","window.PAGE.DEBUG=0")
	
	//获取index文件的信息
 
	var fileStat = fs.statSync(indexFile);

	var modify = fileStat.mtime.toDate().getTime();

	var outAccentPath = (outPath+"index.html").replace(/\s+/g, " ")

	//当前文件没有变化而且其他文件的版本号不用升级就不用写入数据了
	if(config[outAccentPath]!=modify || indexModify.flag|| !wake.isExist(outAccentPath)){

		wake.writeData(outAccentPath,indexData);

	}else{
		console.log("入口文件没变化不覆盖".red,outPath+"index.html")
	}

	//保存新配置数据
	newConfig[outAccentPath] = modify;

	//config内容不同时会更新
	if( JSON.stringify(newConfig)!=JSON.stringify(config) ){
		wake.writeData(configFile,JSON.stringify(newConfig));
	}


};

function parseImportcss(code,importReg,importCss,inPath,moduleFiles,modifyInfo){
			//匹配索引归零
			importReg.lastIndex = importReg.index = 0

			//拿到路径
			var temp = importReg.exec( importCss );

			if(temp&&temp[1]&&temp[1].replace(/"|'|\s+/g,"")){

				temp[1] = temp[1].replace(/"|'|\s+/g,"")

				//可以访问到的路径
				var accentPath = inPath+temp[1];

				//过滤重复import
				if( !moduleFiles[accentPath] ){

					//记录模块索引
					moduleFiles[accentPath] = {count:moduleFiles.count};

					console.log("解析import模块".yellow,accentPath,moduleFiles.count);

					//递归
					var codeChildren =  getCssCode(accentPath,moduleFiles,inPath,modifyInfo);

					moduleFiles.count++;
					
					code = code.replace(importCss,codeChildren);

				}else{
					//如果已经加载就清除
					code = code.replace(importCss,"");
				}
			}
			return code;
}

//page页面的css处理
function getCssCode(file,moduleFiles,inPath,modifyInfo){
	var code = "";
	if( wake.isExist(file) ){

		console.log("css模块存在".yellow,file)

		code = wake.readData(file);

		//记录当前文件更改时间
		var fileStat = fs.statSync(file);
		modifyInfo.modify += fileStat.mtime.toDate().getTime();

		//去掉没有用css的注释
		code = code.replace(/\/\*.*?\*\//gm,"");

		var importReg = /@import\s+url\(([^)]*)\)\s*;/gmi

		var importCssCode = code.match(importReg);

		for(var i in importCssCode){

				//解析单个import
				code = parseImportcss(code,importReg,importCssCode[i],inPath,moduleFiles,modifyInfo)

		}

		//最后压缩
		code = cleanCSS.minify(code).styles;

	}
	return code;
}

function parseRequireJs(code,importReg,importjs,inPath,moduleFiles,modifyInfo){

			//还原正则索引
			importReg.lastIndex = importReg.index = 0;

			//将require（'/adfd/dfsd.js'）->'/adfd/dfsd.js'
			var temp = importReg.exec( importjs );
				
			if(temp&&temp[1]&&temp[1].replace(/"|'|\s+/g,"") ){

				//去掉引号
				temp[1] = temp[1].replace(/"|'|\s+/g,"");

				//解析为可以访问到的路径
				var accentPath = inPath+temp[1];

				//过滤重复require
				if(!moduleFiles[accentPath]){

					console.log("解析require模块".green,accentPath,moduleFiles.count);

					//记录模块索引
					moduleFiles[accentPath] = {count:moduleFiles.count};

					//拿到模块code
					var codeChildren = getJsCode(accentPath,moduleFiles,inPath,modifyInfo)

					//将require模块里面的名module.exports改为innerModule
					codeChildren = codeChildren.replace(/\bmodule\.exports\b/g,"innerModule[{0}]".tpl(moduleFiles[accentPath].count)); 

					//合并模块
					code = codeChildren + code;

					//记录模块索引推后
					moduleFiles.count++;
				}

				//将require替换为innerRequire
				code = code.replace(importjs,"innerRequire({0})".tpl(moduleFiles[accentPath].count));

			}

			return code;
}

//page页面的js处理
function getJsCode(file,moduleFiles ,inPath,modifyInfo){
	//不会去处理exports
	//module.exports
	//require//会处理
	//requireLocal//不会处理
	//innerRequire //来表示整个模块划分

	var code = "";
	if( wake.isExist(file) ){

		console.log("js模块存在".green,file)

		code = wake.readData(file);

		//记录当前文件更改时间
		var fileStat = fs.statSync(file);
		modifyInfo.modify += fileStat.mtime.toDate().getTime();


		//不能出现require，同时压缩代码，会把分号去掉
		code = parseJsCode( "(function(){{0}})()".tpl(code) )

		//加个模块标识分号要写在这里
		code = ";/*{0}*/".tpl(file.replace(inPath,"")) + code+";";

		var importReg = /require\s*\(([^)]*)\)\s*/gmi

		//匹配多个require("/dfsdfsf/sa.js")
		var importCssCode = code.match(importReg)||[];

		//从下往上翻顺序
		for(var i=importCssCode.length-1;i>=0;i--){
 			code = parseRequireJs(code,importReg,importCssCode[i],inPath,moduleFiles,modifyInfo)
		}

	}
	//文件不存在返回""，存在返回压缩后的代码
	return code;
}


function parseHtml(htmlPath,inPath,outPath,configFile){

	console.log("解析入口文件：".red,htmlPath)

	var files = wake.findFile(htmlPath,"html",true);
	var temp;

	//获取原有的文件信息
	var config
	try{
		if(wake.isExist(configFile)){
			config = JSON.parse(wake.readData(configFile))
		}
		
	}catch(e){
		console.log(e);
	}
	

	config = config||{};
	
	//重新配置一份数据
	var newConfig = {};

	for(var i in files){

		temp = files[i];

		var modifyInfo = {modify:0}

		if(temp){

			var tempCss = temp.replace(/.html$/,".css")

			var tempJs = temp.replace(/.html$/,".js")

			console.log("找到css模块".yellow,tempCss)

			//获取css模块,并且记录所有文件的更改时间
			var cssCode = getCssCode(tempCss,{count:0},inPath,modifyInfo)||"";

			if(cssCode.trim()){
				cssCode = "<style>{0}</style>".tpl(cssCode);
			}

			//从require零J计数开始
			console.log("找到js模块".green,tempJs)

			//获取js模块,并且记录所有文件的更改时间
			var jsCode = getJsCode(tempJs,{count:0},inPath,modifyInfo)||"";

			if(jsCode.trim()){
				jsCode = "<script>;(function(){var innerModule = {};var innerRequire=function(index){return innerModule[index];};{0}})()</script>".tpl(jsCode);
			}

			var htmlCode = wake.readData(files[i])

			//压缩script标签
			htmlCode =  replaceScript(htmlCode);

			//去重
			htmlCode = removeInject(htmlCode.replace(/\s+/g, " "));

			//得到可以访问的地址//多个去重
			var outAccentPath = files[i].replace( inPath, outPath ).replace(/\/+/g,"/");

	     	//获取html的更改时间
			var fileStat = fs.statSync(files[i]);
			modifyInfo.modify += fileStat.mtime.toDate().getTime();

			if(config[outAccentPath] == modifyInfo.modify && wake.isExist(outAccentPath)){
				console.log("文件没变化，不覆盖".red,outAccentPath);
			}else{
				wake.writeData( outAccentPath, cssCode+"\n" + htmlCode+"\n" + jsCode );
			}

			//保存新配置数据
			newConfig[outAccentPath] = modifyInfo.modify;
			
		}

	}

	//config内容不同时会更新
	if( JSON.stringify(newConfig)!=JSON.stringify(config) ){
		wake.writeData(configFile,JSON.stringify(newConfig));
	}

}
/*获取json*/
function getConfigJson(configFile){
    var config;
    try{
        if(wake.isExist(configFile)){
            config = JSON.parse(wake.readData(configFile))
        }

    }catch(e){
        console.log(e);
    }
    return config||{};
}
function extend(){
    var arg = arguments;
    var newObj = {};
    for(var i=0;i<arg.length;i++){
        if(arg[i]){
            for(var key in arg[i]){
                newObj[key] = arg[i][key];
            }
        }
    }
    return newObj;
}

function delSignFile(arr,config){
    for(var i=0;i<arr.length;i++){
        //如果在配置文件中都没有就要删除文件
        if( ! config[arr[i]] ) {
            wake.remove(arr[i]);
        }
    }
}
/*删除多余的文件*/
function delFile(outPath,configIndexFile,configFile,staticConfig){

	//获取原有的文件信息

    var allconfig = extend(getConfigJson(configIndexFile),getConfigJson(configFile),getConfigJson(staticConfig));

    delSignFile(wake.findFile(outPath,"html",true),allconfig);
    delSignFile(wake.findFile(outPath,"js",true),allconfig);
    delSignFile(wake.findFile(outPath,"png",true),allconfig);
    delSignFile(wake.findFile(outPath,"jpg",true),allconfig);
    delSignFile(wake.findFile(outPath,"css",true),allconfig);
    delSignFile(wake.findFile(outPath,"gif",true),allconfig);

    delSignFile(wake.findFile(outPath,"as",true),allconfig);
    delSignFile(wake.findFile(outPath,"fla",true),allconfig);
    delSignFile(wake.findFile(outPath,"swf",true),allconfig);
    delSignFile(wake.findFile(outPath,"msi",true),allconfig);

}

//多个目录
function copyStaticArr(staticPath,configFile,inPath,outPath){
	staticPath = Object.prototype.toString.call(staticPath)=="[object Array]"?staticPath:[staticPath];
    //获取原有的文件信息
    var config
    try{
        if(wake.isExist(configFile)){
            config = JSON.parse(wake.readData(configFile))
        }

    }catch(e){
        console.log(e);
    }
    config = config||{};

    var newConfig = {};

	for(var i=0;i<staticPath.length;i++){
		copyStatic(staticPath[i],config,inPath,outPath,newConfig);
	}

    if( JSON.stringify(newConfig)!=JSON.stringify(config) ){
        wake.writeData(configFile,JSON.stringify(newConfig));
    }
}

//单个目录
function copyStatic(staticPath,config,inPath,outPath,newConfig){
	//拷贝静态文件

	var allfile = wake.findFile(staticPath,true);

	for(var i =0;i<allfile.length;i++){
		
		var fileStat = fs.statSync(allfile[i]);

		var modify = fileStat.mtime.toDate().getTime();

		var outfile = allfile[i].replace(inPath,outPath).replace(/\/+/g,"/");

		newConfig[outfile] = modify

		if(config[outfile] == modify && wake.isExist(outfile)){
			console.log("no change will not copy".green,outfile)
			continue;
		}
		wake.copy(allfile[i],outfile)
	}



}

function changeCDNPath(outPath,cdnPathMatch,cdnPath){
    console.log("-----cdn convert---".red);

    var html = wake.findFile(outPath,"html",true);
    var js = wake.findFile(outPath,"js",true);
    var css = wake.findFile(outPath,"css",true);
    var all = html.concat(js).concat(css);
    for(var i=0;i<all.length;i++){
        changeCDNPathReplace(all[i],cdnPathMatch,cdnPath)
    }
}

function changeCDNPathReplace(file,cdnPathMatch,cdnPath){
    var data = wake.readData(file);
    //已经转化过了
    if(~data.indexOf(cdnPath)||data.indexOf(cdnPathMatch)==-1){
        console.log("cdn converted".yellow,file);
        return;
    }
    var reg = new RegExp("("+cdnPathMatch+")","gim");
    console.log("cdn replace".green,file)
    data = data.replace(reg,function(m,m1){return (cdnPath+m1).toURI()});
    wake.writeData(file,data);
}
function addVersion(outPath){
    console.log("-----add versiong---".red);
//    ?v=
    var html = wake.findFile(outPath,"html",true);
    var js = wake.findFile(outPath,"js",true);
    var css = wake.findFile(outPath,"css",true);
    var all = html.concat(js).concat(css);
    for(var i=0;i<all.length;i++){
        addVersionReplace(all[i],outPath)
    }

}

function addVersionReplace(file,outPath){
    var data = wake.readData(file);

     data = data.replace(/url\s*\(\s*([^)]+)\s*\)/g,function(m,m1){
//        var str = replaceRET(m,m1)
        console.log("repla".red,m1)
//        console.log("repla".red,str)
//         return str;
     });

     data = data.replace(/src="?'?(.*?)'?"?/g,function(m,m1){
//         var str = replaceRET(m,m1)
         console.log("data".red,m1)
//         console.log("repla".red,str)
//         return str;
     });

//    wake.writeData(file,data);
}

function replaceRET(m,m1,file,outPath){
//已经转化过了


    //更改时间作为是否压缩
    var files = (outPath+m1).replace(/\/+/g,"/");

    if( !wake.isExist(files) ){
        return m;
    }

    var fileStat = fs.statSync(  );

    var ver = fileStat.mtime.toDate().getTime();

    var oldVer = /.*\?v=(\d+)/.exec(m1);

    if(oldVer&&oldVer[1]==ver){
        console.log("has version no replace".yellow,file);
        return m;
    }else if(oldVer){

    }

    return m.replace(m1,m1+"?v="+ver)

    }

;(function(){
	var inPath = "../.."
	var indexFile =  "../../index.html"
	var outPath = "./build/"
	var accentPath = "/pc/"
	var indexConfig =  "./build/indexConfig.json"


	var htmlConfig =  "./build/htmlConfig.json"
	var htmlPath = "../../pc/html"

	var staticConfig =  "./build/staticConfig.json"
	var staticPath = [
	"../../pc/public/images",
	"../../pc/public/js/lib/IEPlugin",
	"../../pc/public/js/lib/upload",
	"../../pc/public/js/module",
        "../../pc/public/css/emoj",
        "../../pc/public/css/font"]
    var cdnPathMatch = "/mb/public";

    var cdnPath = "http://lscdn.livestar.com/res/";
    
	var workDir = "E:/wamp/www/liveStar/web/pc"
	var indexWordFile = "E:/wamp/www/liveStar/app/www/template/livestar/pc/index.html";

	var srcDir =(outPath+accentPath).replace(/\/+/g,"/");
	var srcIndexDir = (outPath+"index.html").replace(/\/+/g,"/") 

	var ar = process.argv.splice(2);

	if(~ar.indexOf("-refesh") ){
		wake.remove(indexConfig);
		wake.remove(htmlConfig);
		wake.remove(staticConfig);
	}
	//拷贝到工作目录
	if( ~ar.indexOf("-work") ){

		wake.remove(workDir);
		console.log("copy dir".yellow)
		wake.copyDir( srcDir, workDir );

		console.log("copy index");
		wake.remove(indexWordFile);
		wake.copy(srcIndexDir,indexWordFile);
		return
	}

	if( ~ar.indexOf("-index") ){
		wake.remove(indexConfig);
		parseIndex(inPath,outPath,indexFile,accentPath,indexConfig);
		return;
	}
	

	if( ~ar.indexOf("-html") ){
		wake.remove(htmlConfig);
		parseHtml(htmlPath,inPath,outPath,htmlConfig)
		return;
	}

	if( ~ar.indexOf("-static") ){
		wake.remove(staticConfig);
		copyStaticArr(staticPath,staticConfig,inPath,outPath)
		return;
	}

	parseIndex(inPath,outPath,indexFile,accentPath,indexConfig);
	parseHtml(htmlPath,inPath,outPath,htmlConfig)


	copyStaticArr(staticPath,staticConfig,inPath,outPath)

    // //删除之前的文件
   delFile(outPath,indexConfig,htmlConfig,staticConfig);
	//删除空文件夹
	wake.removeEmptyDir(outPath);

    if( ~ar.indexOf("-cdn") ){
        changeCDNPath(outPath,cdnPathMatch,cdnPath)
        return;
    }
    addVersion(outPath);
})()
