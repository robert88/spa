;(function(){
	
	/*转化为数组*/
	if(!$.toArray){
		$.toArray=function(){
			return Object.prototype.toString.call(arr)=="[object Array]"?arr:[arr];
		}
	}

	/*获取url参数*/
	if(!$.getParam){
		$.getParam=function(hash){
			var obj = {};
			hash = hash||"";
			//？param還有param
			var params = hash.split("?")[1]||hash.split("?")[0];
			params = params?params.split("&"):"";
			for(var i=0;i<params.length;i++){
				var map = params[i].split("=");
				var key = map[0];
				var value = map[1];
				if(key){
					if(obj[key]){
						obj[key] = toArray(obj[key]).push(value)
					}else{
						obj[key] = value
					}
				}
			}
			return obj;
		}
	}
	
/*更新了ui 触发update事件*/
	if(!$.fn.updateUI){
		$.fn.updateUI=function(){
			this.triggerHandler("updateUI");
		}
	}
	
	/*开启选择*/
	if(!$.enableSelection){
		var selection = document.onselectstart;
		$.enableSelection=function(){
			document.onselectstart = selection;
		}
	}
	
	/*取消选择*/
	if(!$.disableSelection){
		$.disableSelection=function(){
			document.onselectstart = function(){return false;}
		}
	}

	/*国际化可以待参数*/
    if(!$.i18n){
        $.i18n=function(code){
            var param;
            if(arguments.length>0){
                param = Array.prototype.slice.call(arguments,1);
            }
        	var lan = window.PAGE.language[window.PAGE.curLanguage];
        	var convertLan ="".tpl.apply( (lan&&lan[code]||code),param);
            return convertLan
        }
    }

    /*延时*/
    if(!$.delay){
    	$.delay = (function(){
    			var timer;
    			return function(time,callBack){
    				clearTimeout(timer);
                    timer = setTimeout(function(){
    					if(typeof callBack == "function"){
    						callBack()
    					}
    				},time)
    			}
    		})();
    }
    if(!$.fn.innerHeight){
		$.fn.innerHeight = function(){
			return this.height()+(this.css("padding-top")||"").toFloat()+(this.css("padding-bottom")||"").toFloat()
		}
	}
	if(!$.fn.innerWidth){
		$.fn.innerWidth = function(){
			return this.width()+(this.css("padding-left")||"").toFloat()+(this.css("padding-right")||"").toFloat()
		}
	}
})();