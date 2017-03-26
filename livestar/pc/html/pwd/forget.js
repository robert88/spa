

	var $model = $("#forgetField");
	
	function initSubmitVaild(formID, checkSuccess) {
	
		var $form = $(formID);
	
		var checkCash = {};
	
		var valiForm = $.valiForm({
			form: formID,
			success: function() {
				checkSuccess($form);
				$form.data("check-submit", false);
				console.log("valiform ok")
			},
			error: function($target, msg, checkTypeName) {
				var $parent = $target.parent().parent();
				$parent.addClass("input-box-error");
				$parent.find(".J-tip-msg").html(msg);
				$form.data("check-submit", false);
				console.log("error", msg, checkTypeName, $target)
				if($target.data("error-clear")){
					$target.val("");
				}
			},
			successList: function($target) {
				var $parent = $target.parent().parent();
				$parent.addClass("input-box-success");
			},
			blurCallback: function($target) {
				var $parent = $target.parent().parent();
				var action = $target.data("blur-action")
	
				if(action) {
					action = action.tpl($target.val());
	
					if(checkCash[action]) {
						$parent.addClass("input-box-success");
						return;
					}
	
					LS.ajax({
						url: action,
						success: function(data, ret) {
							//没有注册
							$parent.addClass("input-box-error");
							$parent.find(".J-tip-msg").html($.i18n("i18n.loginweb.cantFindaccount"));
							
						},
						error: function(ret) {
							//注册了才可以
							if(ret.code == 302) {
								$parent.addClass("input-box-success");
								checkCash[action] = 1;
							}
						}
					})
				}
			},
			focusCallback: function($target) {
				var $parent = $target.parent().parent();
				$parent.removeClass("input-box-error").removeClass("input-box-success");
			}
		})
	
		$form.off("submit").on("submit", function() {
			try {
				/*防止重复提交*/
				var $this = $(this);
				if($this.data("check-submit")) {
					console.log("submit check lock!")
					return;
				}
				$this.data("check-submit", true);
	
				valiForm();
			} catch(e) {
				$.tips(e, "error");
			}
			return false;
		});
	
	}
	/*登陆，注册请求服务公共模块*/
	function doAjax($form, url, checkSuccess) {
		var loginData = $form.serialize()
		var $btn = $form.find(".J-submitBtn")
		if($btn.data("disabled")) {
			$.tips("Operation Frequent");
			return;
		}
		$btn.data("disabled", true);
		var orgHtml = $btn.html();
		$btn.html("Submitting ....");

		LS.ajax({
			url: url,
			data: loginData,
			success: function(data) {
				//公共处理
				checkSuccess(data)

			},
			complete: function() {
				$btn.html(orgHtml).data("disabled", false);
			},
			errorCallBack: function() {
				$form.find(".J-captcha-reflash").trigger("click");
				$form.find(".J-code").val("");
			}
		})
	}
	
	$model.find(".J-submitBtn").click(function() {
		if($(this).data("disabled")) {
			console.log("btn lock");
			return;
		}
		$(this).parents("form").submit()
	});

	var enterKey = function(e){
		if(e.key=="Enter"){
			$model.find(".J-submitBtn").trigger("click")
		}
	}

	/*回车提交*/
	function enterByDoc(){

		$(document).off("keyup",enterKey).on("keyup",enterKey);
		window.PAGE.destroy.push(function(){
			$(document).off("keyup",enterKey);
			return true;
		})
	}
	enterByDoc();

	function step1($form){

		var url ;
		if(window.PAGE.DEBUG){
			url = '/pc/public/data/search.json'
		}else{
			url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("sendPwdEmail");
		}

		doAjax($form, url, step2);
	}
	
	function step2($form){
		$model.find(".forgot-pwd").hide();
		$model.find(".has-sentEmail").show();
		$(document).off("keyup",enterKey)
	}
	//提交
	initSubmitVaild("#forgotPWDForm", step1);
	
	/*点击刷新图片*/
	$model.find(".J-captcha-reflash").click(function() {
		var $this = $(this);
		var $src = $this.parent().find("img");
        var src = $src.data("src");
		$src.attr("src", src + "&random=" + (+new Date()));
	})