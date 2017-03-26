$(function(){
    $.cookie("paypal",null);
    var verifypaypalVue = new Vue({
            el:"#setpaypalVue",
            data:{
                paypal:window.PAGE.data.paypal
            }
      });

    var $module = $("#setpaypalVue");

    var $continueBtn = $module.find(".J-continue");

    var $paypalIpt = $module.find(".J-paypal-ipt");

    var $errorMsg = $module.find(".J-data-Msg");
    var $headerErrorMsg = $module.find(".J-sys-Msg");


    function showError($input,msg){
        $errorMsg.show().html(msg);
        if($input){
            $input.addClass("input-error");
        }
    }
    function hideError($input){
        $errorMsg.hide();
         $input.removeClass("input-error");
    }

    /*去掉readoly*/
    if(!window.PAGE.data.paypalVeried){
        $paypalIpt.removeAttr("readonly")
    }

    $paypalIpt.on("focus",function(){
        hideError($paypalIpt);
    })

    /*continue验证手机验证码*/
    $continueBtn.click(function(){

        var url;
        if(window.PAGE.DEBUG){
            url= "/pc/public/data/watch.json";
        }else{
            url = "/cashout/?ac={0}".tpl("submitTime");
        }

        var paypal = $paypalIpt.val().trim();

        hideError($paypalIpt);


        if( !paypal ){
            showError($paypalIpt,"Please enter a valid paypal address.")
            return ;
        }

        LS.ajax({
            url:url,
            limitTime:1,
            data:{
                paypal:paypal
            },
            success:function(ret){
                window.PAGE.data.paypal = paypal;
                verifypaypalVue.paypal = paypal;
                $paypalIpt.prop("readonly",true);
                window.PAGE.loading();
                window.location.hash = "#/mb/cash_out/confirmation";
            },
            error:function(msg){
               $headerErrorMsg.show().html("Invalid code");
               $.delay(3000,function(){
                    $headerErrorMsg.hide();
               });
            }
        })
    })

    /*code 输入时高亮continue*/
    $paypalIpt.on("keyup",function(){
        var $this = $(this);
        if($this.val().trim()!=""){
            $continueBtn.removeClass("btn-disable");
        }else{
            $continueBtn.addClass("btn-disable");
        }
    });
})