//插入数据
window.swfobject = window.swfobject;

var Base64 = require('/pc/public/js/module/base64.js');

/*动态插入js*/
function insertJs(opt) {
	function bind(node, callback) {
		var name = "load";
		if(node.attachEvent) {
			name = "onreadystatechange";
			node.attachEvent(name, callback);
		} else {
			node.addEventListener(name, callback, false);
		}
	}
	

	function unbind(node) {
		var name = "load";
		if(node.detachevent) {
			name = "onreadystatechange";
			node.detachevent(name, null);
		} else {
			node.removeEventListener(name, null, false);
		}
	}

	var s = document.createElement("script");

	bind(s, function() {
		if(typeof opt.success == "function") {
			opt.success();
		}
		unbind(s);
	});

	if(typeof opt.error == "function") {
		s.onerror = function() {
			opt.error();
		}
	}
	s.src = opt.js;
	opt.$contain.append(s);

}

/*检测flash*/
function detectPlugin(pluginName, mimeType, activeX, axDetect) {

	var version = [0, 0, 0],
		description,
		i,
		ax
	nav = window.navigator;

	// Firefox, Webkit, Opera
	if(typeof(nav) != 'undefined' && typeof nav.plugins[pluginName] == 'object') {
		description = nav.plugins[pluginName].description;
		if(description && !(typeof nav.mimeTypes != 'undefined' && nav.mimeTypes[mimeType] && !nav.mimeTypes[mimeType].enabledPlugin)) {
			version = description.replace(pluginName, '').replace(/^\s+/, '').replace(/\sr/gi, '.').split('.');
			for(i = 0; i < version.length; i++) {
				version[i] = parseInt(version[i].match(/\d+/), 10);
			}
		}
		// Internet Explorer / ActiveX
	} else if(typeof(window.ActiveXObject) != 'undefined') {
		try {
			ax = new ActiveXObject(activeX);
			if(ax) {
				version = axDetect(ax);
			}
		} catch(e) {}
	}
	return version;

};

/*检测flash*/
var flashVersion = detectPlugin('Shockwave Flash', 'application/x-shockwave-flash', 'ShockwaveFlash.ShockwaveFlash', function(ax) {
	// adapted from SWFObject
	var version = [],
		d = ax.GetVariable("$version");
	if(d) {
		d = d.split(" ")[1].split(",");
		version = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
	}
	return version;
});
/*flash 显示时才会激活插件*/
	function bindChange(opt,flashId) {
		var flashObj;
		
		window.onPlayStateChange = function(playFlag) {
				console.log("flash is change play",playFlag);
			if(!flashObj){
				console.error("flash is not ready!");
				return;
			}
			if(playFlag) {
				opt.play(flashObj);
			} else {
				opt.pause(flashObj);
			}
		};
        //获取flash的视频已经ok
		window.onPlayerReady = function() {
			flashObj = getFlash(flashId);
			
			console.log("flash is ready flashObj",flashObj)

			opt.ready(flashObj);

		};

        //flash的读不到视频的时候
        window.onSteamClosed =function(w,h){
            console.log("flash stream close by 10 time try");
			if(typeof opt.steamClosed == "function"){
				opt.steamClosed();
			}

        };

        //获取flash的视频的大小
       window.onDimensionChange =function(w,h){
            if(flashObj&&w&&h){
//                flashObj.width = w;
//                flashObj.height = h;
console.log("video",w,h)
               opt.flashResize(w,h)
            }else{
				console.log("onDimensionChange",flashObj,w,h,"error")
			}
       };
        //全屏状态切换的时候会调用：onPlayerDisplayStateChange //会传一个Bool值 TRUE为全屏 否则不是全屏
       window.onPlayerDisplayStateChange = function(bool){
            if(bool){
                console.log("now is full screen");
            }else{
                console.log("now is exit full screen");
            }
       }
	}
/*检测flashid*/
var flashCount = 0;

/*创建flash实例*/
function createFlash(opt) {

	var flashInfo = {
		installSwf: "/pc/public/js/player/expressInstall.swf",
		swf: opt.rtmp?"/pc/public/js/player/livestarRTMP.swf":"/pc/public/js/player/livestarHLS.swf",//hls
		ver: "11.0.0",
		domId: opt.id,
		width: "100%",
		height: "100%"
	}
	
	var base64 = new Base64();
    var flashvars;
    if(opt.src){
         flashvars = {
            vURL: opt.rtmp?base64.encode( opt.src).ENC(1):base64.encode( opt.src ),
            autoPlay:true
        };
    }else{
         flashvars = {
            vURL: "",
            autoPlay:false,
			 debug:true
        };
    }

console.log(opt.src)
console.log(flashvars.vURL)
	var params = {
		quality: "high",
		bgcolor: "#2b2b2b",
		allowscriptaccess: "sameDomain",
		allowfullscreen: "true",
        wmode:"transparent"
	};
	var flashId = "MiniHLSPlayer" + (flashCount++);
	bindChange(opt,flashId);
	var attributes = {
		id: flashId,
		name: flashId,
		align: "middle"
	};

	swfobject && swfobject.embedSWF && swfobject.embedSWF(
		flashInfo.swf, flashInfo.domId, flashInfo.width, flashInfo.height,flashInfo.ver, flashInfo.installSwf,
		flashvars, params, attributes, opt.callbackFn);

	if(typeof opt.init == "function"){
		opt.init(flashId)
	}

	return flashId;
}

/*创建flash实例*/
function getFlash(movieName) {
	if(window.document[movieName]) {
		return window.document[movieName];
	}
	if(navigator.appName.indexOf("Microsoft Internet") == -1) {
		if(document.embeds && document.embeds[movieName])
			return document.embeds[movieName];
	} else // if (navigator.appName.indexOf("Microsoft Internet")!=-1)
	{
		return document.getElementById(movieName);
	}
}
//全屏切换：toogleViewFull()
//设置音量：setVolume(音量值)
//播放状态：isPlaying()
//缓冲状态：isBuffering()
//暂停视频：pauseVideo()
//播放视频：playVideo()
//暂停切换：tooglePause()
//隐藏控制条：hideControl
//显示控制条：showControl
//显示控制条：playStream

function createPlugin(opt) {

	//flash 检查
	if(flashVersion[0] < 9) {
		var pageHost = ((document.location.protocol == "https:") ? "https://" : "http://");
		$("#page").html([
			"<span>To view this page ensure that Adobe Flash Player version 11.0 .0 or greater is installed.</span>",
			"<a href='http://www.adobe.com/go/getflashplayer'><img src='",
			pageHost,
			"www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player' /></a>"
		].join(""))
		return;
	}

	//swf检查
	if(!window.swfobject) {
		insertJs({
			$contain: $("body"),
			js: "/pc/public/js/player/swfobject.js",
			success: function() {
				createFlash(opt);
			},
			error: function() {
				console.error("can't load flash swf object!")
			}
		})
	} else {
		createFlash(opt);
	}
}

module.exports = createPlugin;