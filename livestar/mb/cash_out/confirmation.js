$(function(){

    var verifypaypalVue = new Vue({
            el:"#confirmationVue",
            data:{
                totalMoney:window.PAGE.data.totalMoney,
                selectDollar: $.cookie("selectDollar"),
                paypal:window.PAGE.data.paypal
            },
            filters:{
                toMenoy:function(val){
                    var str = val.format("###,###,###,###");
                    var code = {};
                    for(var i=0;i<10;i++){
                        code[i+""]='<i class="i-f-special i-f-no0{0}">{0}</i>'.tpl(i);
                    }
                    code[","] = '<i class="i-f-special i-f-noComma">,</i>';
                    // code["."] = '<i class="i-f-special i-f-noComma">,</i>';
                    var str2=[];
                    for(var i=0;i<str.length;i++ ){
                        str2.push(code[str[i]]);
                    }
                    return str2.join("\n");
                }
            }
      });

    var $module = $("#confirmationVue");

    var $continueBtn = $module.find(".J-continue");

    var $headerErrorMsg = $module.find(".J-sys-Msg");

    var $Jdialog = $module.find(".J-dialog");

    /*continue提交*/
    $continueBtn.click(function(){

        var url;
        if(window.PAGE.DEBUG){
            url= "/pc/public/data/watch.json";
        }else{
            url = "/cashout/?ac={0}".tpl("exchange");
        }
        var cashoutTime = window.PAGE.data.cashoutTime;

        if(cashoutTime>=6){
            showTopMsg($.i18n("payout.month.limit",6));
            return ;
        }

        LS.ajax({
            url:url,
            limitTime:1,
            data:{
                type:1,
                buck:$.cookie("selectCashBuck"),
                paypal:window.PAGE.data.paypal||$.cookie("paypal")
            },
            success:function(ret){
                //paypal是在这里认证的
                window.PAGE.data.paypalVeried = true;
                window.PAGE.data.cashoutTime++;

                $.dialog(
                    $Jdialog,
                    {
                        maskClose:false,
                        close:false,
                        ready:function($dialog){
                            $dialog.off("click",".J-ok-btn").on("click",".J-ok-btn",function(){
                                //重新拿数据
                                $.cookie("selectCashBuck",null);
                                window.PAGE.loading();
                                window.location.hash = "#/mb/cash_out/income";
                                setTimeout(function(){window.location.reload();},20);
                            })
                        }
                    }
                );
            },
            error:function(msg){
                showTopMsg(msg);
            }
        })
    })


    function showTopMsg(msg,callBack){
        $headerErrorMsg.show().html(msg);
        $.delay(3000,function(){
            if(typeof callBack=="function"){
                callBack();
            }
            $headerErrorMsg.hide();
        });
    }

})