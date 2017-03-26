;(function(){

	var mimetype = navigator.mimeTypes["application/npclipboard"];
	console.log(navigator.mimeTypes)
	console.log(navigator)
	for(var i in navigator.mimeTypes){
		
	}
	var userAgent = navigator.userAgent
	var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
	var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera;
	var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
    var fIEVersion = parseFloat(RegExp["$1"]);
    var objEle = document.createElement("object");
    for(i in objEle){
    	if(~i.indexOf("class")){
    		alert(i)
    	}
    }
//  objEle.classid = "ECB3C477-1A0A-44BD-BB57-78F9EFE34FA7";
// alert(objEle.object) 


    if( fIEVersion <= 8 ){
    	var plugin = mimetype && mimetype.enabledPlugin;
    	if( !plugin ){
    		window.location.href="https://www.google.com/chrome/browser/desktop/index.html"
//  		document.writeln('您使用的浏览器需要安装安全控件才能访问系统! <a href="/pc/public/js/lib/IEPlugin/GoogleChromeframeStandaloneEnterprise.msi">点击下载</a>')
    	}
    	
    }
    
})();