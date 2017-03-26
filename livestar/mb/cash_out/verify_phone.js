$(function(){
    var countdownTotalTime = 60;
//    if(window.PAGE.data.sendmobileTime*1 > 2 ){
//        countdownTotalTime = 60*60;
//    }
    var historyTime = countdownTotalTime - Math.floor( (+new Date() - $.cookie("mobileCountdownTime")||0)/1000 );
    if(historyTime<0){
        historyTime = 0;
    }
    var verifymobileVue = new Vue({
            el:"#verifyPhoneVue",
            data:{
                mobile:window.PAGE.data.mobile,
                countryStr:"+"+window.PAGE.data.countryCode+" "+window.PAGE.data.countryName,//手机code
                sendmobileTime:window.PAGE.data.sendmobileTime*1||0,
                countdownTime:historyTime||0
            }
        })

    var $module = $("#verifyPhoneVue");

    var $getCode = $module.find(".J-send-code");
    var $continueBtn = $module.find(".J-continue");

    var $mobileIpt = $module.find(".J-mobile-ipt");
    var $mobileCodeIpt = $module.find(".J-mobile-code-ipt");

    var $errorMsg = $module.find(".J-data-Msg");
    var $headerErrorMsg = $module.find(".J-sys-Msg");
   
    var $getCountry = $module.find(".J-country");

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
    function checkmobile(value) {
        return /^\d{5,}$/i.test(value);
    }

    //倒计时
    function countdown(){
        setTimeout(function(){
            verifymobileVue.countdownTime--;

            if(verifymobileVue.countdownTime>0){
                countdown();
            }
        },1000);
    }

    /*重新加载页面时还原倒计时。*/
    if(verifymobileVue.countdownTime>0){
        countdown();
    }

    /*去掉readoly*/
    if(!window.PAGE.data.mobileVeried){
        $mobileIpt.removeAttr("readonly")
    }

    var errotipsshow = false;

    $mobileCodeIpt.on("focus",function(){
        hideError($mobileCodeIpt);
    })
    $mobileIpt.on("focus",function(){
        hideError($mobileIpt);
    })

    /*发送手机验证码*/
    $getCode.click(function(){

        var url;
        if(window.PAGE.DEBUG){
            url= "/pc/public/data/watch.json";
        }else{
            url = "/cashout/?ac={0}".tpl("getSmsCode");
        }

        //错误信息还在显示不让他请求
        if(errotipsshow){
            return;
        }
        //还在计数
        if(verifymobileVue.countdownTime>0){
            return;
        }

        var mobile = $mobileIpt.val().trim();

        var sname = window.PAGE.data.countrySName;

        hideError($mobileIpt);
        
        hideError($mobileCodeIpt);

        if( !checkmobile(mobile) ){
            showError($mobileIpt,"Please enter a valid mobile.")
            return ;
        }

        if(verifymobileVue.sendmobileTime>=10){
             showError(null,"Sorry, you have reached the verification limit. Please try again tomorrow.")
            return ;
        }

        //120s
        verifymobileVue.countdownTime = countdownTotalTime;
        $.cookie("mobileCountdownTime",+new Date())
        countdown()

        LS.ajax({
            url:url,
            limitTime:1,
            data:{
                phone:mobile,
                country:sname
            },
            success:function(ret){
                errotipsshow = true;
                showTopMsg("Verify code has been sent",function(){
                    errotipsshow = false
                });
                console.log(ret);
                verifymobileVue.mobile = mobile;
                window.PAGE.data.sendmobileTime++;
                verifymobileVue.sendmobileTime = window.PAGE.data.sendmobileTime;
            },
            error:function(msg){
                verifymobileVue.countdownTime=0;
                $.cookie("mobileCountdownTime",null);
                $mobileCodeIpt.addClass("input-error");
                errotipsshow = true;
                showTopMsg(msg,function(){
                    errotipsshow = false
                });


            }
        })
    })

    /*continue验证手机验证码*/
    $continueBtn.click(function(){

        var url;
        if(window.PAGE.DEBUG){
            url= "/pc/public/data/watch.json";
        }else{
            url = "/cashout/?ac={0}".tpl("checkSmsCode");
        }

        //错误信息还在显示不让他请求
        if(errotipsshow){
            return;
        }

        var mobile = $mobileIpt.val().trim();

        var code = $mobileCodeIpt.val().trim();

        hideError($mobileIpt);

        hideError($mobileCodeIpt);

        if( !checkmobile(mobile) ){
            showError($mobileIpt,"Please enter a valid mobile number.﻿")
            return ;
        }

        if( !code ){
            showError($mobileCodeIpt,"Please enter mobile code.")
            return ;
        }

        LS.ajax({
            url:url,
            limitTime:1,
            data:{
                code:code
            },
            success:function(ret){
                window.PAGE.data.mobileVeried = true;
                window.PAGE.data.mobile = verifymobileVue.mobile;
                $mobileIpt.prop("readonly",true);
                window.PAGE.loading();
                window.location.hash = "#/mb/cash_out/set_paypal";
            },
            error:function(msg){

               $mobileCodeIpt.addClass("input-error");

                errotipsshow = true;
                showTopMsg(msg,function(){
                    errotipsshow = false
                });

            }
        })
    })

    /*code 输入时高亮continue*/
    $mobileCodeIpt.on("keyup",function(){
        var $this = $(this);
        if($this.val().trim()!=""){
            $continueBtn.removeClass("btn-disable");
        }else{
            $continueBtn.addClass("btn-disable");
        }
    });

    function showTopMsg(msg,callBack){
        $headerErrorMsg.show().html(msg);
        $.delay(3000,function(){
            if(typeof callBack=="function"){
                callBack();
            }
            $headerErrorMsg.hide();
        });
    }

    /* 选择*/
    $getCountry.click(function(){
        //手机已经认证
        if(!window.PAGE.data.mobileVeried){
            window.PAGE.loading();
            window.location.hash="#/mb/cash_out/country";
        }
        return false;
    })
    
})