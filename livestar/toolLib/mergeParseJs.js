//文件操作
var wake = require("./fileWake.js")
var mergeConfig = require("./mergeConfig.js")
var pt = require("path")

//js压缩
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;


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
function parseJsCode(origCode) {
	var ast = jsp.parse(origCode);
	if( processArg.indexOf("-debug")==-1 ){
		ast = pro.ast_mangle(ast);//混淆
		ast = pro.ast_squeeze(ast); //获取经过压缩优化的AST
		ast = pro.gen_code(ast);
	}else{
		ast = pro.gen_code(ast,{beautify:true});
	}

	return ast;
}

var processArg = process.argv.slice(2);

function parseCssCode(origCode) {
	return origCode.replace(/\s+/gm, " ").replace(/\/\*.*?\*\//gm, "").replace('@charset "UTF-8";',"").replace('@charset "UTF-8"',"");
}

/*
 *
 * 解析js代码，处理得到js代码
 * 不会去处理exports
 * require('path')//会处理
 * requireLocal//不会处理
 * innerRequire //来表示整个模块划分
 * module.exports会替换掉
 * */
function handlerRequire(code, opts) {

	if (code) {

		var importReg = opts.reg;

		importReg.lastIndex = 0;

		//匹配多个require("/dfsdfsf/sa.js")
		var requireCode = code.match(importReg) || [];

		//处理子依赖
		for (var i = requireCode.length - 1; i >= 0; i--) {

			//还原正则索引
			importReg.lastIndex = 0;

			var temp = importReg.exec(requireCode[i]);

			//解析出来root路径的js
			temp = temp && temp[1] && temp[1].replace(/"|'|\s+/g, "");

			if (temp) {

				//root路径转换为可访问的路径
				var requireUrl = mergeConfig.getAccentPath(temp);

				//console.log("解析require模块".yellow, requireUrl);

				//拿到模块code并且获取index
				getCodeByFile(requireUrl, opts, requireCode[i]);

				//将父类require("*.js")->innerRequire(index)
				//将import--》“”
				var index;
				if(opts.cash[requireUrl]){
					index = opts.cash[requireUrl].index
				}else{
					index ="-1";//文件不存在的情况
				}
				code = opts.replaceInnerRequire(code, requireCode[i],index);


			}

		}
	}

	return code;

}

/*
 *将require记录到一个对象上,可以防止循环require
 *
 */
function recordRequireIndex(requireUrl,opts) {

	//过滤重复require
	if (!opts.cash[requireUrl] || opts.cash[requireUrl].index==null ) {

		var requireCash = opts.cash;

		requireCash.count = requireCash.count||0;

		//记录模块索引
		requireCash[requireUrl] = {index: requireCash.count};

		requireCash.count++;

	}

}
	/*
	 *将require记录到一个对象上,可以防止循环require
	 *
	 */
	function recordRequireCode(requireUrl,opts,code) {

		//过滤重复require
		//opts.cash[requireUrl]必须提前初始化index
		if ( opts.cash[requireUrl].code==null ) {

			var requireCash = opts.cash;

			//将内部模块转换module.exports-->innerModule[index]
			code = opts.replaceInnerModule(code, requireCash[requireUrl].index);

			requireCash[requireUrl].code = code;

		}

	}

/*
 *通过文件解析js code
 * levelCash,requireLevel防止循环引用
 * requireCash去掉重复的引用
 *

 */
function getCodeByFile(file, opts) {


	var code = "";

	if (wake.isExist( file )) {


		//压缩code防止注释中含有require(),顺便解决压缩问题
		 code = opts.parseCode( wake.readData(file),file );

		//决定排序
		recordRequireIndex(file,opts);

		//console.log("getCodeByFile parse js".yellow, file,opts.cash[file].index);

		//处理require
		code = handlerRequire(code, opts);

		//记录代码
		recordRequireCode(file,opts,code);
	}

}
/*
 *getCodeByTag
 *通过代码解析js code
 *
 */
function getCodeByTag(code, opts, tagId) {

	if (code) {

		//压缩code防止注释中含有require(),顺便解决压缩问题
		code = opts.parseCode( code );

		//决定排序
		recordRequireIndex(tagId,opts);

		//console.log("getCodeByFile parse js".yellow, tagId,opts.cash[tagId].index);

		//处理require
		code = handlerRequire(code, opts);

		//记录代码
		recordRequireCode(tagId,opts,code);


	}

	return code;
}
/*
 *
 * 合并代码
 *
 */
function mergeRequrie( cash ) {

	var sortArr = [];

	for (var url in cash) {
		//去掉index属性和自引用
		if (typeof cash[ url ].code == "string" ) {
			cash[url].url = url;
			sortArr.push(cash[ url ])
		}
	}

	//排序
	sortArr.sort(function (a, b) {
		return a.index - b.index < 0 ? 1 : -1;
	});

	var ret = [];
	//添加标记并且组合代码
	for (var i = 0; i < sortArr.length; i++) {
		ret.push("/*{0}*/".tpl(sortArr[i].url) + sortArr[i].code)
	}



	return ret

}

/*
 *
 * js初始化
 *
 */

function initJs(getCodeFunc) {

	var opts = {
		cash:{},
		reg:/require\s*\(([^)]*)\)\s*/gmi,
		replaceInnerModule:function (codeChildren, index) {
			return codeChildren.replace(/\bmodule\.exports\b/g, "innerModule[{0}]".tpl(index));
		},
		replaceInnerRequire:function (orgCode, replaceCode, index) {
			return orgCode.replace(replaceCode, "innerRequire({0})".tpl(index));
		},
		parseCode:function(code){
			return parseJsCode("(function(){{0}})();".tpl(code));
		}
	};

	//将require解析出到requireRecodeObj
	getCodeFunc(opts);

	var rootWrap = ";(function(){ var innerModule = {};var innerRequire = function(index){ return innerModule[index]; }; {0}})();"

	return rootWrap.tpl(mergeRequrie(opts.cash).join(";"));

}
/*
 *
 * js初始化
 *
 */

function initJsNoModule(getCodeFunc) {

	var opts = {
		cash:{},
		reg:/require\s*\(([^)]*)\)\s*/gmi,
		replaceInnerModule:function (codeChildren) {
			return codeChildren;
		},
		replaceInnerRequire:function (orgCode) {
			return orgCode;
		},
		parseCode:function(code){
			return parseJsCode(code);
		}
	};

	//将require解析出到requireRecodeObj
	getCodeFunc(opts);
	return mergeRequrie(opts.cash).join(";")

}

/*
 *
 * css初始化
 *
 */

function initCss(getCodeFunc, paramOpt) {

	var opts = {
		cash:{},
		reg:/@import\s+url\(([^)]*)\)\s*;/gmi,
		replaceInnerModule:function (codeChildren) {
			return codeChildren
		},
		replaceInnerRequire:function (orgCode,replaceCode) {
			return orgCode.replace(replaceCode, "");
		},
		parseCode:parseCssCode
	};

	//将require解析出到requireRecodeObj
	 getCodeFunc(opts);

	var rootWrap = '@charset "UTF-8"; {0}';

	return rootWrap.tpl(mergeRequrie(opts.cash).join(""));

}

/*
 *
 * extend扩展
 *
 */

function extend(){
	var arg = arguments;
	var newObj = {};
	for(var i=0;i<arg.length;i++){
		if(arg[i]){
			for(var key in arg[i]){
				if(arg[i][key]!=null){
					newObj[key] = arg[i][key];
				}

			}
		}
	}
	return newObj;
}

exports = module.exports = function () {
	return this;
};

/*解析文件中的代码*/
exports.parseJs = function (file) {

	return initJs(function(opts){
		getCodeByFile(file,opts);
	});

}

/*解析文件中的代码*/
exports.parseJsNoModule = function (file) {

	return initJsNoModule(function(opts){
		getCodeByFile(file,opts);
	});

}

/*解析标签中的代码*/
exports.parseScript = function (code) {

	return initJs(function(opts){

		getCodeByTag(code,opts,"parseScript enter");
	})

}

/*解析标签中的代码*/
exports.parseCss = function (file) {
	return initCss(function(opts){
		getCodeByFile(file,opts);
	});

}

/*解析标签中的代码*/
exports.parseStyle = function (code) {

	return initCss(function(opts){
		getCodeByTag(code,opts,"parseStyle enter");
	});

}
