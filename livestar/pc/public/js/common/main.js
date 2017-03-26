

;
(function() {
	//全局使用方法
	window.LS = window.LS || {};

	var $pageLoadContain = $("#page");
	var $pageCss = $("#pageCss");
	var $pageJs = $("#pageJs");
	var $pageLoad = $("#pageLoad");
	var $body = $("body");

	//destroy是一个数组
	window.PAGE.destroy.push(function(){
		window.PAGE.load = null;
		$body.scrollTop(0);
		$pageLoad.html("");
		$pageJs.html("");
	});

	/*页面部分加载*/
	window.PAGE.reload = function(){
		console.log("reload page");
		//hashChange();
		window.location.reload()
	};

	/*loading效果*/
	window.PAGE.loading = function(){
		$pageLoad.css("display", "flex");
	};

	/*关闭loading效果*/
	window.PAGE.closeLoading = function(){
		$pageLoad.hide()
	};

	/*自己调用只能调用一次，不然会出现死循环*/
	function destroyPage(){

		var newDestroy = [];

		for(var i=0;i<window.PAGE.destroy.length;i++){
			if(typeof window.PAGE.destroy[i]=="function"){
				//注意顺序，相同的destroy是不会被执行的
				if(  newDestroy.indexOf(window.PAGE.destroy[i])==-1 && window.PAGE.destroy[i]()!=true){
					newDestroy.push(window.PAGE.destroy[i])
				}
			}
		}

		window.PAGE.destroy = newDestroy;
	}

    /*自己调用只能调用一次，不然会出现死循环*/
	function hashChange(hash,self) {

		hash = hash||window.location.hash.trim();

		hash = hash ? hash : window.PAGE.HOME;

		var params = $.getParam(hash);

		//"#/app/home.min.js?js=1&css=1" ==>"app/home.min"
		var action = hash.replace(/^#/, "").replace(/\?.*/, "").replace(/\.[^.]*$/, "");
		
		//确保开发模式
		if(window.PAGE.STATICDEBUG){
			params.js = params.js||1;	
			params.css = params.css||1;	
		}else{
			window.console = window.console||{};
			window.console.log = function(){};//屏蔽console
		}
		
		//优先加载css
		if(params.css) {
			$pageCss.html('<link rel="stylesheet" type="text/css" href="{0}.css?v={1}">'.tpl(action, params.css));
		} else {
			$pageCss.html("");
		}
		$pageLoadContain.hide();
		//显示加载ui
		window.PAGE.loading();

		var ver = new Date().getTime();

		//显示加载html
		$.ajax({
			url: action + ".html?ver="+ver,
			dataType: "html",
			success: function(innerHtml) {

				destroyPage()

				//添加内容
				$pageLoadContain.show().html("<div id='pageDsync'>"+innerHtml+"</div>");

				//加载js
				if(params.js) {
					var s = document.createElement("script");
					s.src = "{0}.js?v={1}".tpl(action, params.js)
					$pageJs.html(s);
				}

			},
			error: function() {
                //不死循环
                if(self){
                    $pageLoadContain.html('<section style="text-align: center"><div> 404 sorry can find page! </section>');
                }else{
                    hashChange(window.PAGE.ERROR404,true);
                }
			},
			complete: function() {
				$pageLoad.hide()
				$.dialog.closeAll();
			}
		})
	}

	function bindHashChage(){
		$(window).on("hashchange", function() {
			//hashChange();
			//im ie8~9支持https
			if(~navigator.userAgent.indexOf("MSIE 9.0")){
				window.location.href = window.location.href.replace("http:","https:")
			}
			window.location.reload()
		}).on("load",function(){
			if(typeof window.PAGE.load =="function"){
				window.PAGE.load();
			}
		})
	}

	function bindCheckBox(){
		/*自定义checkbox*/
		$(document).on("click",".J-label-box",function(){

			var $this  = $(this);

			var $checkbox = $this.find("input");

			var $radioGroup = $this.parents(".J-label-radio-group");

			//radio
			if($radioGroup.length){
				$radioGroup.find("input").prop("checked",false).trigger("change");
				$radioGroup.find(".label-box").removeClass("checked");
				if(!$checkbox.prop("checked")){
					$checkbox.prop("checked",true).trigger("change");
					$this.addClass("checked")
				}
				//checkbox
			}else{
				if($checkbox.prop("checked")){
					$checkbox.prop("checked",false).val(0).trigger("change");
					$this.removeClass("checked")
				}else{
					$checkbox.prop("checked",true).val(1).trigger("change");
					$this.addClass("checked")
				}
			}
		})

	}

	/*自定义input*/
	function bindInput(){

		$(document).on("focus","input",function(){

			$(this).parents(".J-input-focus").addClass("input-box-focus");

		}).on("blur","input",function(){

			$(this).parents(".J-input-focus").removeClass("input-box-focus");
		})
	}

	function getCommonLang(type){
		var ver = +new Date()
		var path = window.PAGE.languagePath + type+"/common.json?ver="+ver;
		$.ajax({
			url:path.toURI(),
			dataType: 'json', //json数据返回
			async:true,
			success:function(ret){
				window.PAGE.language[type] = window.PAGE.language[type]||{};
				$.extend(window.PAGE.language[type],ret);
			}
		})
	}

	function bindHashChangeSelf(){
		$(document).on("click","a",function(){
			var $this = $(this);
			var href = ($this.attr("href")||"").split("#")[1];
			if(href&&href==window.location.hash.split("#")[1]){
				window.PAGE.reload();
			}
		})
	}

	getCommonLang(window.PAGE.curLanguage);

	bindHashChage();

	hashChange();

	bindInput();

	bindCheckBox();

	bindHashChangeSelf()


})();



