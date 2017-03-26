$(function(){
    var incomeVue = new Vue({
        el:"#incomeVue",
        data:{
            totalMoney:window.PAGE.data.totalMoney,
            cashoutTime : window.PAGE.data.cashoutTime
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
    })

    var $module = $("#incomeVue");

     $module.find(".J-cashout").click(function(){
        //低于20K星票-提示语
//         客服端做判断
//        if(incomeVue.totalMoney<20000){
//            $.tips("低于20K星票!");
//            return
//        }
        //用户提现次数超限：每月3次-提示语：XXX
       if(incomeVue.cashoutTime>=6){
           showTopMsg($.i18n("payout.month.limit",6));
            return
        }
         window.PAGE.loading();
        window.location.hash = "#/mb/cash_out/introduction";
        return false;
       
     })

    var $headerErrorMsg = $module.find(".J-sys-Msg");
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