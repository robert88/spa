$(function(){
    var countdownTotalTime = 120;
//    if(window.PAGE.data.sendEmailTime*1 > 2 ){
//        countdownTotalTime = 60*60;
//    }
    var historyTime = countdownTotalTime - Math.floor( (+new Date() - $.cookie("emailCountdownTime")||0)/1000 );
    if(historyTime<0){
        historyTime = 0;
    }
    var verifyEmailVue = new Vue({
            el:"#verifyEmailVue",
            data:{
                email:window.PAGE.data.email,
                sendEmailTime:window.PAGE.data.sendEmailTime*1||0,
                countdownTime:historyTime||0
            }
        })

    var $module = $("#verifyEmailVue");

//    var $getCode = $module.find(".J-send-code");
    var $continueBtn = $module.find(".J-continue");

    var $emailIpt = $module.find(".J-email-ipt");
    var $emailCodeIpt = $module.find(".J-email-code-ipt");

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
    function checkEmail(value) {
        return /^.*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i.test(value);
    }

    //倒计时
    function countdown(){
        setTimeout(function(){
            verifyEmailVue.countdownTime--;

            if(verifyEmailVue.countdownTime>0){
                countdown();
            }
        },1000);
    }

    /*重新加载页面时还原倒计时。*/
    if(verifyEmailVue.countdownTime>0){
        countdown();
    }

    /*去掉readoly*/
    if(!window.PAGE.data.emailVeried){
        $emailIpt.removeAttr("readonly")
    }

    var errotipsshow = false;


    $emailCodeIpt.on("focus",function(){
        hideError($emailCodeIpt);
    })
    $emailIpt.on("focus",function(){
        hideError($emailIpt);
    })
    /*发送邮箱验证码vue 的if会将code解析掉*/
    $module.on("click",".J-send-code",function(){

        //错误信息还在显示不让他请求
        if(errotipsshow){
            return;
        }
        //还在计数
        if(verifyEmailVue.countdownTime>0){
            return;
        }

        var url;
        if(window.PAGE.DEBUG){
            url= "/pc/public/data/watch.json";
        }else{
            url = "/cashout/?ac={0}".tpl("getEmailCode");
        }


        var email = $emailIpt.val().trim();

        hideError($emailIpt);
        
        hideError($emailCodeIpt);

        if( !checkEmail(email) ){
            showError($emailIpt,"Please enter a valid email address.")
            return ;
        }

        if(verifyEmailVue.sendEmailTime>=10){
             showError(null,"Sorry, you have reached the verification limit. Please try again tomorrow.")
            return ;
        }


        //120s
        verifyEmailVue.countdownTime = countdownTotalTime;
        $.cookie("emailCountdownTime",+new Date())
        countdown()



        LS.ajax({
            url:url,
            limitTime:1,
            data:{
                email:email
            },
            success:function(ret){
                errotipsshow = true;
                showTopMsg("Verify code has been sent",function(){
                    errotipsshow = false
                });
                //全局也要改变
                window.PAGE.data.sendEmailTime++;
                verifyEmailVue.sendEmailTime = window.PAGE.data.sendEmailTime;
                verifyEmailVue.email = email;

            },
            error:function(msg){
                //错误清除
                verifyEmailVue.countdownTime=0;
                $.cookie("emailCountdownTime",null);
                errotipsshow = true;
               $headerErrorMsg.show().html(msg);
               $.delay(3000,function(){
                   errotipsshow = false
                    $headerErrorMsg.hide();
               });
            }
        })
    })

    /*continue验证邮箱验证码*/
    $continueBtn.click(function(){

        var url;
        if(window.PAGE.DEBUG){
            url= "/pc/public/data/watch.json";
        }else{
            url = "/cashout/?ac={0}".tpl("checkEmailCode");
        }


        //错误信息还在显示不让他请求
        if(errotipsshow){
            return;
        }

        var email = $emailIpt.val().trim();

        var code = $emailCodeIpt.val().trim();

        hideError($emailIpt);

        hideError($emailCodeIpt);

        if( !checkEmail(email) ){
            showError($emailIpt,"Please enter a valid email address.")
            return ;
        }

        if( !code ){
            showError($emailCodeIpt,"Please enter email code.")
            return ;
        }

        LS.ajax({
            url:url,
            limitTime:1,
            data:{
                code:code
            },
            success:function(ret){

                $emailIpt.prop("readonly",true);
                window.PAGE.data.emailVeried = true;
                window.PAGE.data.email = verifyEmailVue.email;
                window.PAGE.loading();
                window.location.hash = "#/mb/cash_out/verify_phone";
            },
            error:function(msg){
                showError($emailCodeIpt,"");
                errotipsshow = true;
                showTopMsg(msg,function(){
                    errotipsshow = false
                })
            }
        })
    })
    /*  */

function showTopMsg(msg,callBack){

    $headerErrorMsg.show().html(msg);
    $.delay(3000,function(){
        if(typeof callBack=="function"){
            callBack();
        }
        $headerErrorMsg.hide();
    });
   }

    /*code 输入时高亮continue*/
    $emailCodeIpt.on("keyup",function(){
        var $this = $(this);
        if($this.val().trim()!=""){
            $continueBtn.removeClass("btn-disable");
        }else{
            $continueBtn.addClass("btn-disable");
        }
    });

})