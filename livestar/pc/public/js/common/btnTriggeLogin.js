//search
(function() {

	var md5 = require("/pc/public/js/module/md5.js");

	window.PAGE.UserInfo = {};

	function getThumb(uid){

		var key = md5(uid+"image");

		if(window.PAGE.DEBUG){
			return md5(uid+"image")
		}else{
			var domain = window.location.href.split("#")[0].split("?")[0];
			var dev = "user"
			if(~domain.indexOf("test")){
				dev = "user.test"
			}else if(~domain.indexOf("preview")){
				dev = "user.preview"
			}
			return "http://{0}.livestar.com/?ct=image&uid={1}&key={2}&isthumb".tpl(dev,uid,key)
		}

	}

	var loginVue = new Vue({
		el: '#loginVue',
		data: {
			userInfo:{},
			loginStatus:"unlogin"
		},
		methods:{
			getThumb:function(uid){
				return getThumb(uid);
			}
		}
	})

	if($.cookie("lv_uid")){
		getUserInfo( $.cookie("lv_uid") );
		loginVue.loginStatus = "logined"
	}



	var loginDialog
	$(".btn-logIn").click(function(){
		var $this = $(this);
		if($("#loginDialog").length||loginDialog){
			return;
		}
		loginDialog = true;
	 	//$.dialog();
	 	$.dialog("url:/pc/html/login.html",{id:"loginDialog",dialogStyle:"background-color:transparent;",bodyStyle:"padding:0;",close:".close",maskClose:false,ready:function($dialog){
			loginDialog = false;
	 	}});
	 });
		 

	$("#loginOut").click(function(){
		if( $.cookie("lv_uid") ){

            var url;
            if(window.PAGE.DEBUG){
                url = '/pc/public/data/login.json'
            }else{
                url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("loginOut");
            }

			LS.ajax({
				$loadContain:$("body"),
				url: url,
				success: function(data) {
					$.cookie("lv_uid",null);
					window.PAGE.reload();
					loginVue.userInfo = {}
					loginVue.loginStatus = "unlogin"
					window.PAGE.UserInfo = {}
				}
			})


		}
	})
	


	function getUserInfo(uid) {

		var url;
		if (window.PAGE.DEBUG) {
			url = "/pc/public/data/getUserInfo.json";
		} else {
			url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("getUserInfo");
		}
	/*必须同步请求*/
		LS.ajax({
			async:false,
			url: url,
			data: {
				id: uid//主播id
			},
			success: function (data) {
				loginVue.userInfo = $.extend({},data);
				window.PAGE.UserInfo = $.extend({},data);
			}
		})
	}

	window.PAGE.checkLogin = function(noTrigger){
		if(loginVue.loginStatus == "unlogin" && $("#loginDialog").length==0 && !noTrigger){
				$(".btn-logIn").eq(0).trigger("click");
		}
		return loginVue.loginStatus == "unlogin";
	}

	window.PAGE.loginSuccess = function(data){

		//获取登陆用户的信息
		getUserInfo(data&&data.uid||$.cookie("lv_uid"));
		loginVue.loginStatus = "logined";
		window.PAGE.reload();
		$.dialog.close($("#loginDialog"));
		//调试用
		if(window.PAGE.DEBUG){
			$.cookie("lv_uid",data&&data.uid);
		}
	}
	
})()