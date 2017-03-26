$(function () {

	require("/pc/html/upload.js");

	var $module = $("#loginField");

	/*登陆，注册校验器*/
	function initSubmitVaild(formID, checkSuccess, setParent) {
		var checkCash = {};
		LS.validForm({
			form: formID,
			validSuccess: function ($form) {
				checkSuccess($form);
			},
			validError: function ($target, msg, checkTypeName) {

				var $parent = $target.parents(".J-tip-contain")

				if($target.data("error-clear")){
					$target.val("");
				}
				$parent.addClass("input-box-error");
				$parent.find(".J-tip-msg").html(msg);
				console.log("error", msg, checkTypeName, $target)
				checkValue($curForm);
			},
			successList: function ($target) {
				var $parent = $target.parents(".J-tip-contain")
				$parent.addClass("input-box-success");
			},
			blurCallback: function ($target) {
				var $parent = $target.parents(".J-tip-contain")
				var action = $target.data("blur-action");

				if (action) {

					if (window.PAGE.DEBUG) {
						action = '/pc/public/data/login.json'
					} else {
						action = action.tpl($target.val());
					}

					if (checkCash[action]) {
						console.log("check blur cash success!");
						$parent.addClass("input-box-error");
						$parent.find(".J-tip-msg").html($.i18n("i18n.signupweb.emailRegistered"));
						return;
					}

					LS.ajax({
						url: action,
						success: function (data, ret) {
							//公共处理
							$parent.addClass("input-box-success");

						},
						error: function (ret) {
							$parent.addClass("input-box-error");
							$parent.find(".J-tip-msg").html($.i18n("i18n.signupweb.emailRegistered"));
							checkCash[action] = 1;
						}
					})
				}
			},
			focusCallback: function ($target) {
				var $parent = $target.parents(".J-tip-contain")
				$parent.removeClass("input-box-error").removeClass("input-box-success");
				checkValue($curForm);
			}
		});

	}


	/*登陆，注册请求服务公共模块*/
	function doAjax($form, url, checkSuccess,error) {
		var loginData = $form.serialize();

		var $btn = $form.find(".J-submitBtn");
		var option = {
			url: url,
			data: loginData,
			success: function (data) {
				//公共处理
				if (checkSuccess(data)) {
					window.PAGE.loginSuccess(data);
				}
			},
			errorCallBack: function () {
				$form.find(".J-captcha-reflash").trigger("click");
			}
		}
		if(error){
			option.error = error;
		}
		LS.ajaxBtn($btn, option);
	}


	/*登陆-》直接注册用户信息）*/
	function goLogin($form, url) {

		var loginUrl;
		if (window.PAGE.DEBUG) {
			loginUrl = '/pc/public/data/login.json'
		} else {
			loginUrl = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("login");
		}

		doAjax($form, loginUrl, function (data) {

			//是否需要输入验证码
			$.tips("Login Success!", {type: "ok",btnText:"OK"});
			return true;

		},function(msg,tipType,msgType,data){
			//是否需要输入验证码
			if (data.showCode == 1||(data.data.showCode == 1)) {
				$module.find(".loginCode").show().find("input").prop("disabled", false).addClass("J-require-input");
				checkValue($curForm);
			}
			var map = {
				"Password is incorrect.":$.i18n("i18n.loginweb.notMatch"),
				"User doesn’t exist": $.i18n("i18n.loginweb.cantFindaccount")
			}
			$form.find(".J-tip-contain").addClass("input-box-error");
			$form.find(".J-tip-msg").html(map[msg]||msg);
		});
	}

	function checkValue($form){
		var $validInput = $form.find(".J-require-input")
		var $validSelect = $form.find(".J-require-select")
		var isAllInput = true;
		$validInput.each(function(){
			if(!$(this).val()){
				isAllInput = false;
			}
			if(!$(this).data("init-bind")){
				$(this).data("init-bind",true);
				$(this).keyup(function(){
					checkValue($form);
					$(this).parents(".J-tip-contain").removeClass("input-box-error");
				})
			}
		})
		$validSelect.each(function(){
			if(!$(this).val()){
				isAllInput = false;
			}
			if(!$(this).data("init-bind")){
				$(this).data("init-bind",true);
				$(this).on("change.checkvalue",function(){
					console.log(this)
					$(this).parents(".J-tip-contain").removeClass("input-box-error");
					checkValue($form);
				})
			}
		})

		var $btn;
		if($form.find(".J-upload-submit").length){
			$btn = $form.find(".J-upload-submit")
		}else{
			$btn = $form.find(".J-submitBtn")
		}
		if(isAllInput&&$form.find(".input-box-error").length==0){
			$btn.addClass("btn-primary").removeClass("btn-disable")
		}else{
			$btn.addClass("btn-disable").removeClass("btn-primary")
		}

	}

	function showPassWord() {
		$module.find(".J-eye").on("mousedown", function () {
//            alert("test")
			var $this = $(this);
			$this.find(".i-openEye").show();
			$this.find(".i-closeEye").hide();
			var $show = $this.parent().find(".J-input-password-show");
			var $password = $this.parent().find(".J-input-password");
			$show.val($password.val()).show();
			$password.hide();
		}).on("mouseleave", function () {
			var $this = $(this);
			$this.find(".i-openEye").hide();
			$this.find(".i-closeEye").show();
			$this.parent().find(".J-input-password-show").hide();
			$this.parent().find(".J-input-password").show();
		}).on("mouseup", function () {
			var $this = $(this);
			$this.find(".i-openEye").hide();
			$this.find(".i-closeEye").show();
			$this.parent().find(".J-input-password-show").hide();
			$this.parent().find(".J-input-password").show();
		})
	}

	/*注册第一步-》直接注册用户信息）*/
	function goSign1($form) {

		var signUrl;
		if (window.PAGE.DEBUG) {
			signUrl = '/pc/public/data/register.json'
		} else {
			signUrl = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("register");
		}

		doAjax($form, signUrl, function (data) {
			//不需要提示注册成功
			signStep2($form)
			return false;

		},function(msg,tipType,msgType,data){
			var map = {
				"Your email has been duplicated, please switch another email.": {
					klass:".J-sign-email",
					text:$.i18n("i18n.signupweb.emailRegistered")
				},
				"Verification code error.":{
					klass:".J-sign-code",
					text:$.i18n("i18n.loginweb.verifyCode")
				}
			}
			if(map[msg]){
				$form.find(map[msg].klass)
					.parents(".J-tip-contain")
					.removeClass("input-box-success")
					.addClass("input-box-error")
					.find(".J-tip-msg").html(map[msg].text)
			}else{
				$.tips(msg);
			}

		});
	}

	/*注册上传图片》请求服务器preview接口*/
	function goSign2($form) {

		var $filePathIpt = $module.find(".J-upload-file-path");

		$filePathIpt.change(function(){
			//表示已经有了数据，触发提交事件
			$filePathIpt.parents("form").submit();
		});

		//更新数据接口
		initSubmitVaild("#signFormStep02", goSign2Continue);

		//再次绑定提交事件
		$module.find(".J-upload-submit").click(function(){
			$filePathIpt.parents(".J-tip-contain").removeClass("input-box-error");
			//提交已经有的数据
			if($filePathIpt.data("upload")=="uploaded"){
				$filePathIpt.parents("form").submit();
			}else{
				$filePathIpt.parents(".J-tip-contain").addClass("input-box-error");
			}

		})
	}



	/*注册存储用户信息》请求服务器editUser接口*/
	function goSign2Continue($form) {
		var signUrl;
		if (window.PAGE.DEBUG) {
			signUrl = '/pc/public/data/register.json'
		} else {
			signUrl = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("editUser");
		}

		doAjax($form, signUrl, function (data) {
			$.tips($.i18n("i18n.sign.succeed"), {type: "ok",btnText:"OK"});
			return true;
		});

	}

	/*注册跳到第二步-》补全用户信息*/
	function initTab($wrap) {
		/*tab*/
		var $tapWrap = $wrap.find(".J-tab");
		var $tabli = $tapWrap.find(".J-tab-title").find("li");
		var $tabCon = $tapWrap.find(".J-tab-body-item");
		$tabli.click(function () {
			var $this = $(this);
			$tabli.removeClass("current");
			$this.addClass("current")
			$tabCon.hide();
			$curForm = $tapWrap.find($this.data("tab"));
			$tapWrap.find(".J-scroller-con").css("margin-top", 0)
			$curForm.show().updateUI();
			checkValue($curForm);
		})
	}

	/*注册跳到第二步-》补全用户信息*/
	function signStep2($form) {
		var $parent = $form.parents(".bd-con");
		$parent.find(".step01").hide();
		$parent.find(".step02").show();
		$curForm = $parent.find(".step02");
		checkValue($curForm);
		goSign2();
	}

	function initBrithday() {

		/*日期选择*/
		var curYear = new Date().getFullYear();
		var curMonth = new Date().getMonth()+1;
		var curDay = new Date().getDate();

		var $dateSelector = $module.find(".dateSelector");
		var $yearSelect = $dateSelector.find(".select-year");
		var $monthSelect = $dateSelector.find(".select-month");
		var $dateSelect = $dateSelector.find(".select-date");
		var $birthdayIpt = $dateSelector.find(".birthdayIpt");

		function initYear(year) {

			var str = [];

			for (var i = year; i > year - 150; i--) {
				str.push('<option value="{0}">{0}</option>'.tpl(i));
			}

			$yearSelect.html("<option value=''>&nbsp;</option>" + str.join(""));

		}
		function showDateErr(msg){
			$yearSelect.parents(".J-tip-contain").addClass("input-box-error").find(".J-tip-msg").html($.i18n(msg))
		}
		function hideDateErr(){
			$yearSelect.parents(".J-tip-contain").removeClass("input-box-error")
		}
		function initMonth() {

			var str = [];

			for (var i = 1; i < 13; i++) {
				str.push('<option value="{0}">{0}</option>'.tpl(i.toString().fill("00")));
			}

			$monthSelect.html("<option value=''>&nbsp;</option>" + str.join(""));

		}

		function initDate(year, month, d) {
			var str = [];
			month = parseInt(month, 10);
			var max = new Date(year, month, 0).getDate() + 1;

			for (var i = 1; i < max; i++) {
				str.push('<option value="{0}">{0}</option>'.tpl(i.toString().fill("00")));
			}
			$dateSelect.html("<option value=''>&nbsp;</option>" + str.join(""));

			if (d) {
				var checkDate = parseInt(d, 10) || 1;
				return checkDate < max ? d : "";
			}

		}

		//必须在13岁以上
		$yearSelect.data("maxvalue",curYear-13);
		initYear(curYear);
		initMonth();
		initDate(curYear, 1);

		$module.find(".dateSelector").on("change", "select", function () {
			var $this = $(this);
			var year = $yearSelect.val().trim();
			var month = $monthSelect.val().trim();
			var d = $dateSelect.val().trim();

			var dYear = curYear-year;

			$monthSelect.data("maxvalue",12);
			$dateSelect.data("maxvalue",31);

			if(dYear<13){
				showDateErr("i18n.profile.birthdayError");
			}else if(dYear==13&&month>curMonth){
				showDateErr("i18n.profile.birthdayError");
				$monthSelect.data("maxvalue",curMonth);
			}else if(dYear==13&&month==curMonth&&d>curDay){
				showDateErr("i18n.profile.birthdayError");
				$dateSelect.data("maxvalue",curDay);
			}else{
				hideDateErr()
			}


			if (!$this.hasClass("select-date")) {
				d = initDate(year, month, d);
				if (d) {
					$dateSelect.val(d);
				}
			}

			if (year && month && d) {
				$birthdayIpt.val([year.fill("0000"), month.fill("00"), d.fill("00")].join("/"));
			} else {
				$birthdayIpt.val("");
			}

		});

	}

	/*回车提交*/
	function enterByDoc(){

		var enterKey = function(e){
			if(e.key=="Enter"){
				if($curForm.hasClass("step02")){
					$curForm.find(".J-upload-submit").focus().trigger("click");
				}else{
					$curForm.find(".J-submitBtn").focus().trigger("click");
				}
			}
		}

		$module.off("keyup",enterKey).on("keyup",enterKey);
		var $dialog = $("#loginDialog");
		if($dialog[0]){
			$dialog[0].detory = function(){
				$(document).off("keyup",enterKey);
				return true;
			}
		}
	}
	enterByDoc();



	/*点击刷新图片*/

	$module.find(".J-captcha-reflash").click(function () {
		var $this = $(this);
		var $src = $this.parent().find("img");
		var src = $src.data("src");
		$src.attr("src", src + "&random=" + (+new Date()));
	})

	//显示密码
	showPassWord();

	var $curForm = $("#signFormStep01");

	checkValue($curForm);


	//注册
	initSubmitVaild("#signFormStep01", goSign1);

	//调试直接进入
//	signStep2($("#signFormStep01"))

	//登陆
	initSubmitVaild("#loginForm", goLogin, function ($target, msg, checkTypeName) {
		return $target.parent().parent().parent();
	});


	initTab($("#loginField"))

	initBrithday()

})