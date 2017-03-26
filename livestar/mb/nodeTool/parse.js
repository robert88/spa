
//js
var fs = require('fs');
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify; 
 
function jsMinifier(flieIn, fileOut) {
     var flieIn=Array.isArray(flieIn)? flieIn : [flieIn];
     var origCode,ast,finalCode='';
     for(var i=0; i<flieIn.length; i++) {
        origCode = fs.readFileSync(flieIn[i], 'utf8');
        ast = jsp.parse(origCode);
        ast = pro.ast_mangle(ast);
        ast= pro.ast_squeeze(ast); 
        finalCode +=';'+ pro.gen_code(ast);
     }
    fs.writeFileSync(fileOut, finalCode, 'utf8');
}
 
//jsMinifier('./file-src/test2.js', './file-smin/test-min.js');  //单个文件压缩
jsMinifier(['./test1.js','./test2.js'], './test-min.js'); //合并压缩

// uglifyjs [ 选项... ] [ 文件 ]

// 文件参数应该放在选项后面，uglifyjs 会读取文件中的javascript代码进行处理。如果你不指定输出的文件名，那么他会把处理后的内容输出到命令行中。

// 支持的选项 ：

// ●   -b 或 –beautify - 输出格式化代码，当传入该参数，下面的附加选项用于更美观的控制格式化：

// ●   -i N 或 –indent N - 缩进级别（空格数量）

// ●   -q 或 –quote-keys - 是否用引号引起字符串对象的键（默认只会引起不能被正确标志的键名）

// ●   –ascii -默认 UglifyJS 不处理字符编码而直接输出 Unicode 字符，通过传入该参数将非ASCII编码的字符转化为\cXXXX的序列（输出总按照UTF8编码，但传入该选项能得到ASCII编码的输出）。

// ●   -nm 或 –no-mangle - 不改变变量名称

// ●   -ns 或 –no-squeeze - 不调用 ast_squeeze() 函数（该函数会做多种优化使得结果更小，可读性略有降低）

// ●   -mt 或 –mangle-toplevel - 在顶级作用域打乱变量名称（默认不开启）

// ●   –no-seqs - 当调用 ast_squeeze() 将会合并多个语句块为一个语句块，如 ”a=10; b=20; foo()” 将被转换为 ”a=10,b=20,foo()”

// ●   –no-dead-code - 默认 UglifyJS 将会删除不被用到的代码，传入该参数禁用此功能。

// ●   -nc 或 –no-copyright - 默认 uglifyjs 会在输出后的代码中添加版权信息等注释代码，传入该参数禁用此功能。

// ●   -o 文件名 或 –output 文件名 - 指定输出文件名，如果不指定，则打印到标准输出（STDOUT）

// ●   –overwrite - 如果传入的JS代码来自文件而不是标准输入，传入该参数，输出会覆盖该文件。

// ●   –ast - 传入该参数会得到抽象的语法树而不是Javascript，对调试或了解内部代码很有用。

// ●   -v 或 –verbose - 在标准错误输出一些信息（目前的版本仅输出操作用时）

// ●   –extra - 开启附加优化，这些优化并未得到全面的测试。

// ●   –unsafe - 开启其他附加优化，这些优化已知在特定情况下并不安全，目前仅支持：

// ●   foo.toString() ==> foo+””

// ●   –max-line-len （默认32K字节） - 在32K字节出增加换行符，传入0禁用此功能。

// ●   –reserved-names - 一些类库会依赖一些变量，该参数指定的名称不会被混淆掉，多个用逗号隔开


// //css
// var cleanCSS = require('clean-css');
 
// function cssMinifier(flieIn, fileOut) {
//      var flieIn=Array.isArray(flieIn)? flieIn : [flieIn];
//      var origCode,finalCode='';
//      for(var i=0; i<flieIn.length; i++) {
//         origCode = fs.readFileSync(flieIn[i], 'utf8');
//         finalCode += cleanCSS.process(origCode); 
//      }
//     fs.writeFileSync(fileOut, finalCode, 'utf8');
// }
  
// //cssMinifier('./file-src/indexw_20120913.css', './file-smin/index.css');  //单个文件压缩
// cssMinifier(['./file-src/index_20120913.css','./file-src/indexw_20120913.css'], './file-smin/index.css');
 
// //图片
// var imgMinifier = require('node-smushit');
// //imgMinifier.smushit('./file-src/images', {recursive: true}); //递归
// imgMinifier.smushit('./file-src/images');