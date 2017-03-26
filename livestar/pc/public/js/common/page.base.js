/**
 * 解决全局问题
 */

;
(function() {

	window.PAGE = window.PAGE||{};

	PAGE.timer = [];
	PAGE.event = [];

	function remove(index){
		if(~index){
			PAGE.timer.splice(index,1)
		}
	}

	PAGE.setTimeout = function(callback){
		var args = Array.prototype.slice.call(arguments,0);

		args[0] = function(){
			if(typeof callback=="function"){
				callback.apply(window,args.slice(2));
			}
			remove(PAGE.timer.indexOf(timer));
		}

		var timer = setTimeout.apply(window,args);

		PAGE.timer.push(timer);
		return timer
	};

	PAGE.clearTimeout = function(timer){
		clearTimeout(timer);
	};

	PAGE.on = function(eventType,selector,callback){

		PAGE.event.push({selector:selector,type:eventType,callback:callback});

		if(selector){
			$(document).on(eventType,selector,callback);
		}else{
			$(document).on(eventType,callback);
		}

	};

	PAGE.destroy.push(function(){
		for(var i=0;i<PAGE.timer;i++){
			clearTimeout(PAGE.timer[i]);
		}
		PAGE.timer.length=0;
		for(i=0;i<PAGE.event;i++){

			var eventType =PAGE.event[i].eventType,
				selector=PAGE.event[i].selector,
				callback=PAGE.event[i].callback;

			if(selector){
				$(document).off(eventType,selector,callback);
			}else{
				$(document).off(eventType,callback);
			}
		}
		PAGE.event.length=0;
	})
})();