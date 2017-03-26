try{
    ;(function($, undefined){

        /*校验发生错误默认处理函数*/

        function defaultErr( $obj, msg, type ){

            $.tips(  msg,"warn" );

        }

        /*转换为浮点数*/

        function parseNum( value ){

            return parseFloat( $.trim( value+"" ), 10 ) || 0;

        }

        /*将字节数还原真正的字符个数*/

       function getByteLen( val ) {

            var temp = 0;

            for (var i = 0; i < val.length; i++ ) {

                //UTF-8 中文占2字节(统一做成单个字符)
                if ( val[ i ].match( /[^x00-xff]/ig ) != null ) {

                    temp += 1;

                }else{

                    temp += 1;

                }

            }

            return temp;
        }

        /*验证数据类型对应表*/

        var validRules =
            {

				neckname : {
					check:function( val ) {

						if(/^\d+$/.test( val )){
							this.defaultMsg = 'i18n.valiForm.error.all.numbers';
							return true;
						}
						if( !/^[0-9a-zA-Z_]+$/.test( val ) ){
							this.defaultMsg = 'i18n.valiForm.error.special.characters';
							return true;
						}
					},
					defaultMsg: 'i18n.valiForm.error.all.numbers'
				},
                required:
                        {
                            check:function(value) {return ($.trim(value) == '');},
                            defaultMsg:'i18n.valiForm.error.required'
                        },
                mobile:
                        {
                            check:function(value) {return (!/^\d{5,}$/.test($.trim(value)));},
                            defaultMsg:'i18n.valiForm.error.mobile'
                        },
                email:
                        {
                            check:function(value) {
                                return !(/^.*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.test($.trim(value)));
                            },
                            defaultMsg:'i18n.valiForm.error.email'
                        },
                letter:
                        {
                            check:function(value) {
								value = $.trim(value);
								return (!getByteLen(value)==value.length)
							},
                            defaultMsg:'请输入英文字符。'
                        },
                chinese:
                        {
                            check:function(value) {return (!/^[\u4e00-\u9fff]+$/.test($.trim(value)));},
                            defaultMsg:'请输入汉字。'
                        },
                date:
                        {
                            check:function(value){return(/Invalid|NaN/.test(new Date($.trim(value)).toString()));},
                            defaultMsg:"请输入有效的日期"
                        },
                idcard:
                        {
                            check:function(value){return(!(/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/.test(value)||/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/.test(value)));},
                            defaultMsg:'请输入有效身份证！'
                        },
                maxvalue:
                        {
                            check:function(value, $obj) {

                                //传递了比较值
                                var value2 = $obj.data("maxvalue");

                                if(value2){
                                    this.value = parseNum(value2);

                                }

                                this.defaultMsg = 'i18n.maxvalue.limit';
                                value = parseNum(value);

                                return (!(value<=this.value));
                            },
                            value:"10000",
                            defaultMsg:'i18n.maxvalue.limit'

                        },
                minvalue:
                        {
                            check:function(value, $obj) {

                                //传递了比较值
                                var value2 = $obj.data("minvalue");

                                if(value2){
                                    this.value = parseNum(value2);
                                }
                                this.defaultMsg = '请输入不小于' + this.value +'。';
                                value = parseNum(value);

                                return (!(value>=this.value));
                            },
                            value:"10000",
                            defaultMsg:'请输入不小于'

                        },
                multiple:
                        {
                            check:function(value, $obj) {
                                //传递了比较值
                                var value2 = $obj.data("multiple");

                                if(value2){
                                    this.value = parseNum(value2);
                                }
                                this.defaultMsg = '请输入 ' + this.value +' 的整数倍。';
                                value = parseNum(value);

                                return ((value%this.value));
                            },
                            value:"100",
                            defaultMsg:'请输入100的整数倍'
                        },
				bigger :
						{
							check:function(value, $obj) {

								//传递了比较值
								var $bigger = $( $obj.data( "bigger" ) );
								var value2 = $bigger.val();

								//比较的值必须有输入
								if( (typeof value2 == "undefined") || (value2 == "") ){
									return ;
								}

								if(value2){
									this.value = parseFloat(value2, 10);
								}

								this.defaultMsg = '请输入小于' + this.value +'的数字。';
								value = parseFloat(value, 10);

								return (!(value<this.value));
							},
							value:"1",
							defaultMsg:'请输入小于'

						},
				smaller :
						{
							check:function(value, $obj) {

								//传递了比较值
								var $bigger = $( $obj.data( "smaller" ) );
								var value2 = $bigger.val();

								//比较的值必须有输入
								if( (typeof value2 == "undefined") || (value2 == "") ){
									return ;
								}

								if(value2){
									this.value = parseFloat(value2, 10);
								}

								this.defaultMsg = '请输入大于' + this.value +'的数字。';
								value = parseFloat(value, 10);

								return (!(value>this.value));
							},
							value:"1",
							defaultMsg:'请输入大于'
						},
                maxlength:
                        {
                            check:function(value, $obj) {

                                //传递了比较值
                                var value2 = $obj.data("maxlength");

                                if(value2){
                                    this.value = parseNum(value2);

                                }

                                //更新消息
                                this.defaultMsg = $.i18n("i18n.valiForm.error.maxlength",this.value);

                                //空格不计
                                value = $.trim(value);
                                return (!(getByteLen(value)<=this.value));
                            },
                            value:6,
                            defaultMsg:"i18n.valiForm.error.maxlength"

                        },
                minlength:
                        {
                            check:function(value, $obj) {

                                //传递了比较值
                                var value2 = $obj.data("minlength");

                                if(value2){
                                    this.value = parseNum(value2);
                                }

                                //更新消息
                                this.defaultMsg = $.i18n("i18n.valiForm.error.minlength",this.value);;

                                //空格不计
                                value = $.trim(value);

                                return (!(getByteLen(value)>=this.value));
                            },
                            value:4,
                            defaultMsg:"i18n.valiForm.error.minlength"

                        },
                pswagain:
                        {
                            check:function(value, $obj) {

                                //传递了比较值pswAgain传递是一个jquery选择器字符
                                var sel = $obj.data("pswagain");
                                var value2 = $(sel).val();

                                return ( !( $.trim(value) == $.trim(value2) ) );
                            },
                            defaultMsg:"i18n.valiForm.error.password.inconsistent"
                        },
                password: {
                    check:function(value, $obj) {

                        if(/^\d+$/.test(value.trim())){
                            return true;
                        }else if(!/\d/.test(value.trim())){
                            return true;
                        }else{
                            return false
                        }

                    },
                    defaultMsg:"i18n.valiForm.passwordError"
                }

        };

        /*跟据校验规则校验单条数据*/

        function checkByRule( $target,   error, success){

			//防止验证的数据没有value值 val统一经过trim处理
			var value;
			if( $target.data( "ishtml" ) ){

				value = $.trim( $target.html().replace( /\n|\t/g, "" ) );
			//必须在父类设置
			}else if( $target.length && ( $target.attr( "type" ) == "checkbox" || $target.attr( "type" ) == "radio" ) ){

				value = $target.find("input:checked").prop( "checked" )?"1":"";

			}else{

				value = $.trim( $target.val() );

			}

            var checkTypes = $target.attr( "check-type" );
			var checkTypeNames, checkTypeName, checkBoth;

            //隔离符号是空格，&&
            checkTypes = ( checkTypes && checkTypes.split( /\s+|,|&&/ ) ) ||[];

            for(var i=0; i<checkTypes.length; i++){

                //"或"规则的检测项
                checkTypeNames = checkTypes[ i ].split( "||" );

				checkBoth = false;

				if( checkTypeNames.length>1 ){
					checkBoth = true;
				}

				for(var j=0; j<checkTypeNames.length; j++){
					checkTypeName = checkTypeNames[j];

					//如果checktype没有或者checktype函数没有就跳出循环继续
					if( !validRules[ checkTypeName ] || !validRules[ checkTypeName ].check ){
						continue;
					}

					//让required 起作用
					if( checkTypeName != "required" ){
						if( value === "" || value === undefined ){
							continue;
						}
					}

					//将对象和值传递过去 true表示错误
					if( validRules[ checkTypeName ].check( value, $target ) ){

						//“或”规则失败继续校验,除了最后一次
						if( checkBoth && (j!=checkTypeNames.length-1)){
							continue;
						}

						if( $.type( error ) == "function"){

							//统一定义错误消息
							if($target.data( checkTypeName + "-allmsg" ) ){

								error( $target, $.i18n($target.data( checkTypeName + "-allmsg" ),value), checkTypeName );

							}else{
								//自定义错误消息
								if( $target.data( checkTypeName + "-msg" ) ){

									error( $target, $.i18n($target.data( checkTypeName + "-msg" ),value), checkTypeName );

								}else{

									error( $target, $.i18n(validRules[ checkTypeName ].defaultMsg,value), checkTypeName );

								}
							}

						}

						//一旦发生错误就不会校验下一个类型
						return false;

						//校验成功之后的函数
					}else {
						//“或”规则只要成功就跳出
						if( checkBoth ){
							break;
						}
					}
				}//end for j

            }//end for i

			//全部成功之后单个校验完成
			if( $.type( success ) == "function" ){

				success( $target );

			}

            //全部类型都校验成功之后返回true
            return true;
        }

		/*校验执行函数
		* opts = setRule 外部使用用于扩展校验方法
		* opts = setBlur 内部使用用于绑定blur校验
		* */

		function checkForm( $subFrom, opts, success, successList, error, obj ){

				//刷选出校验的数据
				var $subFormInput = $subFrom.find( "input" )
					.add( $subFrom.find( "textarea" ) )
					.add( $subFrom.find( "select" ) )
					.add( $subFrom.find( ".needCheck" ) )
					.not( ".noCheck" )
                    .not(":disabled")

				var retVal = true;

				$subFormInput.each( function(){

					var $this =  $( this );

					//如果没有设置checktype就返回
					if( !$this.attr( "check-type" ) ){
						return ;
					}

					//如果设置focus,blur为true 函数为设定绑定focus,blur事件,
					if( opts == "setBlur" ){
						if( $this.data("blur") ){
							//不重复绑定
							$this.data("blur",false);
							$this.bind("blur", function(){

								//用于动态取消校验
								if( $this.hasClass( "noCheck" ) ){
									return;
								}

								//这里的校验不会传递successList
								if($this.data("blur-action")){
									
									console.log("blur-action");
									
									if(typeof obj.blurCallback=="function" && checkByRule( $this , error)==true){
										obj.blurCallback($this);
									}
								}else{
									checkByRule( $this , error, successList);
								}
							});
						}

						if( $this.data("focus") ){
							$this.data("focus",false);
							$this.bind("focus", function(){
								if(typeof obj.focusCallback=="function"){
									obj.focusCallback($this);
								}
							});
						}
						return ;
					}


					//跟据校验规则校验单条数据
					retVal = checkByRule( $this , error, successList);

					//当发生错误时，且没有设置显示所有错误时。默认就跳出each。执行一条错误校验。并且之后表单停止校验直接返回
					if( !$subFrom.data( "showallerror" ) && retVal == false ){
						return false;
					}

				});//end each

				//不进行校验
				if( opts == "setBlur" ){
					return ;
				}

				//如果全部通过
				if( ( $.type( success ) == "function" ) && retVal ){

					success( $subFrom );

				}
		}

        /*校验初始化函数。提供一个校验函数*/

        $.valiForm = function ( obj ){

            var selector = obj.form || "",
				successList = obj.successList,
                success = obj.success,
                error = obj.error;

            if( error == undefined ){
                error = defaultErr;
            }

            //提供选择器缓存和不缓存
            var $subFrom;

            if( $.type( selector ) == "string" ){

                $subFrom = $( selector );

            }else{

                $subFrom = selector;

            }

			//失去焦点就校验对象
			checkForm( $subFrom, "setBlur", success, successList, error, obj);

            //验证执行函数 //工厂模式
            return	function( opts ){

				//设置校验参数
				if( opts == "setRule" ){
					return validRules;
				}

				checkForm( $subFrom, opts, success, successList, error );
			}

        }//end valiForm2 
        
    })(jQuery, window.undefined);
}catch(e){
    alert( "valiForm2 error:" + e );
}