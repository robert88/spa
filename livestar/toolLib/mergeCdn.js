//文件操作
var wake = require("./fileWake.js")
var mergeConfig = require("./mergeConfig.js")


function getAllFile(outPath,cdnPathMatch,cdnPath,handler,cdnACTmatch){


    var html = wake.findFile(outPath,"html",true);
    var js = wake.findFile(outPath,"js",true);
    var css = wake.findFile(outPath,"css",true);
    var all = html.concat(js).concat(css);

    for(var i=0;i<all.length;i++){
        handler(all[i],cdnPathMatch,cdnPath)
    }
}
function checkAccess(m,arr){
    if(arr){
        for(var i=0;i<arr.length;i++){
            if(~m.indexOf(arr[i])){
                return true;
            }
        }
    }

    return false;
}
function changeCDNPathReplace(file,cdnPathMatch,cdnPath,cdnACTmatch,AllowAccess){

    var data = wake.readData(file);
    //已经转化过了
    if(~data.indexOf(cdnPath)){
        //console.log("cdn converted or not match ".yellow,cdnPathMatch,file);
        return;
    }

    var reg = cdnPathMatch;
    //console.log("cdn replace file:".green,file)
    data = data.replace(reg,function(m,m1){
        cdnACTmatch.lastIndex = 0;
        if(cdnACTmatch.test(m)){
            //console.log("cdn replace code:".yellow,m)
            console.log(m,AllowAccess)
            if( checkAccess(m,AllowAccess) ){
                return m;
            }
            return (cdnPath+m).toURI()
        }else{
            return m
        }
    });
    wake.writeData(file,data);
}
function addVersion(file,cdnPathMatch,cdnPath){
    var data = wake.readData(file);
    if(data.indexOf(cdnPath)==-1){
        //console.log("add version cdn not convert".yellow,file);
        return;
    }
    if(~data.indexOf("LSCDNVER")){
        //console.log("cdn has add version".yellow,file);
        return;
    }
    var reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g
    var urls = data.match(reg);
    if(!urls){
        return 
    }
    for(var i=0;i<urls.length;i++){
        if(~urls[i].indexOf(cdnPath)){
            var str =urls[i]
            if(str.indexOf("?")==-1){
                str += "?v=1&"
            }else if(urls[i].slice(-1)!="&"){
                str += "&"
            }
            var rootPath = str.split("?")[0].replace(cdnPath,"/").toURI();

            var accendPath = mergeConfig.getAccentPath(rootPath)
            var buildPath = mergeConfig.getBulidPath(accendPath);
            if(wake.isExist(buildPath)){
                str +="LSCDNVER="+wake.getModify(buildPath);
                data = data.replace(urls[i],str )
                //console.log(file,"is find where cdn add version".green,str)
            }else{
                //console.log(buildPath,"is not find where cdn add version".red)
            }


        }
    }
    wake.writeData(file,data);
}
exports = module.exports = function () {
	return this;
};

/*解析文件中的代码*/
exports.changeCDNPath = function(outPath,cdnPathMatch,cdnPath,cdnACTmatch,AllowAccess){
    //console.log("-----cdn convert---".red);
    getAllFile(outPath,cdnPathMatch,cdnPath,function(file,cdnPathMatch,cdnPath){
        changeCDNPathReplace(file,cdnPathMatch,cdnPath,cdnACTmatch,AllowAccess)
    })
}
exports.addVersion = function(outPath,cdnPathMatch,cdnPath){
    //console.log("-----cdn add version---".red);
    getAllFile(outPath,cdnPathMatch,cdnPath,addVersion)
}