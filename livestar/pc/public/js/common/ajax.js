	window.LS = window.LS || {};
	/**
	 * @introduction：依赖jquery.dialog和jquery
	 * @param 封装jquery ajax
	 */

	;
	(function() {

        LS.action = {};

		function defaultError(text, tipsType) {

			$.tips(  $.i18n(text), tipsType ,3);

		}

		function checkAction( action ,limitTime,error, errorCallBack) {
			if(!action) {
				console.log("i18n.sys.ajax.no.action", "operateErr",error, errorCallBack);
				return false;
			}

			LS.action[action] = LS.action[action] || {time: 0};
			
			if( LS.action[action].time >= limitTime ) {
                console.log('i18n.sys.ajax.limit', "operateErr", error, errorCallBack);
				return false;
			}

		}
		
		
		function recordAction( action ){
			LS.action[action].time++;
		}

		function delRecordAction( action ){
			LS.action[action].time--;
		}

		function errorHander(ret, type, error, errorCallBack) {
			var text = ret;

			var tipsType = "warning";

			//系统错误提示
			if(type == "sysError") {
				tipsType = "error";
			}


			if(typeof ret=="object"&&ret!=null){
				text = $.i18n(ret.code || ret.message||"");
			}else{
                text = $.i18n(text);
			}

			if(type == "dataError"&&text=="200") {
				text = ret.message;
			}

			if(typeof error == 'function') {
				error(text,  tipsType, type, ret);
			}

			if(typeof errorCallBack == "function") {
				errorCallBack(text, type, tipsType, ret);
			}

		}

		LS.ajax = function(options) {

			var defaultOption = {
				type: "post", //post请求
				error: defaultError, //默认处理函数
				dataType: 'json', //json数据返回
				timeout: 120000, //2分钟超时
				$loadContain: null //是loading容器
				// limitTime : 1 //请求限制不传表示不限制
			};
			
			var ajaxOption = $.extend({}, defaultOption, options);

			var success = ajaxOption.success,
				error = ajaxOption.error||defaultError,
				complete = ajaxOption.complete,
				errorCallBack = ajaxOption.errorCallBack;



			if(checkAction( ajaxOption.url ,ajaxOption.limitTime,error, errorCallBack) == false) {
				console.error("canot find action:",ajaxOption.url," or ajax limit time >",ajaxOption.limitTime);
				return;
			}

			//限制条件计数
			recordAction( ajaxOption.url );


			ajaxOption.success = function(ret) {
				//二次解析
				var parseRet;
				try {
					if(typeof ret == "string") {
						
						parseRet = JSON.parse(ret);
						//如果parse错误是不会进行这个赋值
						ret = parseRet;
					}
				} catch(e) {
					console.error(e);
				}

				//state为true的时候表示请求成功
				if(ret && ret.state) {
					if( typeof success == "function" ) {
						success(ret.data, ret, "success");
					}
				} else {
					errorHander(ret, "dataError",error, errorCallBack)
				}

			}

			ajaxOption.complete = function() {

				delRecordAction(ajaxOption.url);
				if(typeof complete == "function"){
					complete.apply(null,arguments);
				}
			}

			ajaxOption.error = function(XMLHttpRequest, textStatus, errorThrown) {
                try{
                  var $text =  $(XMLHttpRequest.responseText);
                }catch (e){
                    $text = $("<div>parseError</div>");
                }
				var msg = {
					code :XMLHttpRequest.status,
					message : $text.text()
				}
				errorHander(msg, "sysError", error, errorCallBack)
			}

			//ajax不会转json
			if(typeof ajaxOption.data != "string" &&ajaxOption.processData==false){
				ajaxOption.data = $.param(ajaxOption.data);
			}

			//发送请求
			$.ajax(ajaxOption);
		};
		/*带btn*/
        LS.ajaxBtn = function($btn,opts){

            if($btn.prop("disabled")) {
                console.log("i18n.sys.ajax.limit");
                return;
            }

            $btn.prop("disabled", true);

            var orgHtml;

            //按钮类型是input
            if($btn.data("type")=="input"){
                 orgHtml = $btn.val();
                $btn.val( $.i18n("i18n.sys.submitting") );
            }else{
                 orgHtml = $btn.html();
                $btn.html( $.i18n("i18n.sys.submitting") );
            }

            var optsComplete = opts.complete;

            //保留传递过来的complete可以执行
            var complete = function(){
                if(typeof optsComplete == "function"){
                    optsComplete();
                }
                $btn.html(orgHtml).prop("disabled", false);

            }
            opts.complete = complete;

            LS.ajax(opts)

        }


        LS.validForm = function(opts) {

            var $form = $(opts.form);

            var validOpts = {
                success: function() {

                    console.log("valiform ok");

                    if(typeof opts.validSuccess == "function"){
                        opts.validSuccess($form);
                    }

                    $form.data("check-submit", false);

                },
                error: function($target, msg, checkTypeName) {

                    console.log("error", $target, msg, checkTypeName);

                    if(typeof opts.validError == "function"){
                        opts.validError($target, msg, checkTypeName);
                    }

                    $form.prop("disabled",false);

                    $form.data("check-submit", false);

                }
            };

            $form.off("click",".J-submitBtn").on("click",".J-submitBtn",function() {
				if($(this).hasClass("btn-disable")){
					return
				}
                $form.submit()
            });

            var validForm = $.valiForm( $.extend( opts , validOpts) )

            //提交
            $form.off("submit").on("submit", function() {
                try {
                    /*防止重复提交*/
                    var $this = $(this);
                    if($this.data("check-submit")) {
                        console.log("submit check lock!")
                        return false;
                    }

                    $this.data("check-submit", true);

                    validForm();
                } catch(e) {
                    $.tips(e, "error");
                }
                return false;
            });

			return validForm;
        }


    })()