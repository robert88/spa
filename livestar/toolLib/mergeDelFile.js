//文件操作
var wake = require("./fileWake.js")

function delSignFile(arr,config){
    for(var i=0;i<arr.length;i++){
        //如果在配置文件中都没有就要删除文件
        if( ! config[arr[i]] ) {
            wake.remove(arr[i]);
        }
    }
}
/*删除多余的文件*/
function delFile(outPath,configJson){

	//获取原有的文件信息
    delSignFile(wake.findFile(outPath,true),configJson);
    // delSignFile(wake.findFile(outPath,"html",true),configJson);
    // delSignFile(wake.findFile(outPath,"js",true),configJson);
    // delSignFile(wake.findFile(outPath,"png",true),configJson);
    // delSignFile(wake.findFile(outPath,"jpg",true),configJson);
    // delSignFile(wake.findFile(outPath,"css",true),configJson);
    // delSignFile(wake.findFile(outPath,"gif",true),configJson);
	//
    // delSignFile(wake.findFile(outPath,"as",true),configJson);
    // delSignFile(wake.findFile(outPath,"fla",true),configJson);
    // delSignFile(wake.findFile(outPath,"swf",true),configJson);
    // delSignFile(wake.findFile(outPath,"msi",true),configJson);

}

exports = module.exports = function () {
	return this;
};

/*解析文件中的代码*/
exports.delFile = delFile