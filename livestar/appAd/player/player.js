//插入数据
window.swfobject = window.swfobject;

function insertJs($content, src, func) {
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
		if(typeof func == "function") {
			func();
		}
		unbind(s);
	});
	s.src = src;
	$content.append(s);
}

function detectPlugin(pluginName, mimeType, activeX, axDetect) {

	var version = [0, 0, 0],
		description,
		i,
		ax;

	// Firefox, Webkit, Opera
	if(typeof(this.nav.plugins) != 'undefined' && typeof this.nav.plugins[pluginName] == 'object') {
		description = this.nav.plugins[pluginName].description;
		if(description && !(typeof this.nav.mimeTypes != 'undefined' && this.nav.mimeTypes[mimeType] && !this.nav.mimeTypes[mimeType].enabledPlugin)) {
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

// Add Flash detection
var flashVersion = detectPlugin('flash', 'Shockwave Flash', 'application/x-shockwave-flash', 'ShockwaveFlash.ShockwaveFlash', function(ax) {
	// adapted from SWFObject
	var version = [],
		d = ax.GetVariable("$version");
	if(d) {
		d = d.split(" ")[1].split(",");
		version = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
	}
	return version;
});

var flashCount = 0;

function createFlash() {

	var pageHost = ((document.location.protocol == "https:") ? "https://" : "http://");

	var flashInfo = {
		installSwf: "playerProductInstall.swf",
		swf: "MiniHLSPlayer.swf",
		ver: "21.0.0",
		domId: domId,
		width: "100%",
		height: "100%"
	}

	var flashvars = {
		vURL: "",
		autoPlay: false
	};

	var params = {
		quality: "high",
		bgcolor: "#ffffff",
		allowscriptaccess: "sameDomain",
		allowfullscreen: "false",

	};

	var attributes = {
		id: "MiniHLSPlayer" + (flashCount++),
		name: "MiniHLSPlayer",
		align: "middle"
	};

	swfobject && swfobject.embedSWF && swfobject.embedSWF(
		flashInfo.swf, flashInfo.domId, flashInfo.width, flashInfo.height, flashInfo.installSwf,
		flashvars, params, attributes);

	//	swfobject&&swfobject.createCSS&&swfobject.createCSS("#flashContent", "display:block;text-align:left;");

	return window['MiniHLSPlayer'];
}

function createPlugin(domId, ready) {

	//TEST
	if(flashVersion[0] < 9) {
		$("#" + domId).html([
			"<span>To view this page ensure that Adobe Flash Player version 21.0 .0 or greater is installed.</span>",
			"<a href='http://www.adobe.com/go/getflashplayer'><img src='",
			pageHost,
			"www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player' /></a>"
		].join(""))
		return;
	}
	if(!window.swfobject) {
		insertJs($("body"), "swfobject.js", function() {
			ready(createFlash());
		});
	} else {
		ready(createFlash());
	}   
}