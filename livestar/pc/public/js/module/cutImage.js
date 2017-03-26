
	var defaultOpts = {
		width:500,
		height:500,
		left:0,
		top:0,
		zoom:1,
		conver:false,
		type:"image/jpeg"
	}
	if($.cutImage){
//		debugger
		console.log("$.cutImage has init!");
	}
	$.cutImage = function(opts){
		var newOpts = $.extend({},defaultOpts,opts)
		var w = Math.round(newOpts.width),
			h = Math.round(newOpts.height),
			zoom = newOpts.zoom,
			x = Math.round(newOpts.left)*zoom,
			y = Math.round(newOpts.top)*zoom,
			conver= newOpts.conver,
			
			img = newOpts.img,
			type = newOpts.type,
			src;
		
		if(!img){
			console.error("img not find!");
		}
		
		var $cvs = $("#cvs");
		if(!$cvs.length){
			$("body").append("<canvas style='display:none' id='cvs' width="+w+" height="+h+"></canvas>");
			$cvs = $("#cvs");
		}
		var c=$cvs[0].getContext("2d");
		
		$cvs[0].width = w;
		$cvs[0].height = h;

		c.drawImage(img,x,y,w*zoom,h*zoom,0,0,w,h);


		
		src=$cvs[0].toDataURL(type)
		
		if(conver){
			src.replace(type,"image/octet-stream");
		}

		return src;
	}
