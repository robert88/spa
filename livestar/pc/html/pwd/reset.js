;(function(){


	
	var $model = $("#resetPwdField");
	var resetInfo = $.cookie("lv_resetinfo")
	var href = window.location.href;

	try{
		resetInfo = JSON.parse( resetInfo );
	}catch(e){
		//TODO handle the exception
		resetInfo = {}
	}

	if(!resetInfo|| !resetInfo.login_id || href.indexOf("safety")==-1 ){
		if(!window.PAGE.DEBUG){
			window.location.href = "/";
			return ;
		}
	}
	if(resetInfo&&resetInfo.login_id){
		var email = /^(\w+[-+.]?\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.exec(resetInfo.login_id);
		if( email&&email[1] ){
			email = email[0].replace(email[1],email[1].slice(0,2)+"**")
		}else{
			email = "";
		}
	}
	var resetVue = new Vue({
		el:"#resetPwdField",
		data:{
			sign:resetInfo&&resetInfo.sign,
			email:email,
			login_id : resetInfo&&resetInfo.login_id
		}
	})

    function initSubmitVaild(formID, checkSuccess) {
        return LS.validForm({
            form: formID,
            validSuccess: function($form) {
                checkSuccess($form);
            },
            validError: function($target, msg) {
                var $parent = $target.parent().parent();
                $parent.addClass("input-box-error");
                $parent.find(".J-tip-msg").html(msg);
				if($target.data("error-clear")){
					$target.val("");
				}
            },
            successList: function($target) {
                var $parent = $target.parent().parent();
                $parent.addClass("input-box-success");
            },
            focusCallback: function($target) {
                var $parent = $target.parent().parent();
                $parent.removeClass("input-box-error").removeClass("input-box-success");
            }
        });

    }


    function doAjax($form, url, checkSuccess) {

        var loginData = $form.serialize();

        var $btn = $form.find(".J-submitBtn");

        LS.ajaxBtn( $btn, {
            url : url,
            data : loginData,
            success : function( data ) {
                checkSuccess( data );
            }
        });
    }

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
        var url;
        if(window.PAGE.DEBUG){
            url = '/pc/public/data/search.json';
	    }else{
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("resetPwd");
	    }

		doAjax($form, url, step2);
	}
	$model.find(".J-go-home").click(function(){
		window.PAGE.loginSuccess();
	})
	function step2($form){
		$model.find(".J-step1").hide();
		$model.find(".J-step2").show();
		$(document).off("keyup",enterKey)
	}
	
	//提交
	initSubmitVaild("#resetPwdForm", step1);
})();
