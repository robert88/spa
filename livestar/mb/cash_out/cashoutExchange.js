$(function(){

    $.cookie("selectDollar",null);
    $.cookie("selectCashBuck",null);
    var cahsoutExchangeVue = new Vue({
        el:"#cashoutExchangeVue",
        data:{
            totalMoney:window.PAGE.data.totalMoney,
            cashoutMoney:window.PAGE.data.cashoutMoney,
            selectDollar:0,//可体现的美元
            selectStarBuck:0,//兑换的星票
            starBuckList:window.PAGE.data.proListMap.cashout
        },
        filters:{
            toMenoy:function(val){
                var str = val.format("###,###,###,###");
                var code = {};
                for(var i=0;i<10;i++){
                    code[i+""]='<i class="i-f-special i-f-no0{0}">{0}</i>'.tpl(i);
                }
                code[","] = '<i class="i-f-special i-f-noComma">,</i>';
                var str2=[];
                for(var i=0;i<str.length;i++ ){
                    str2.push(code[str[i]]);
                }
                return str2.join("\n");
            },
            formatNum:function(val){
                var str = val.format("###,###,###,###");
                return str;
            }
        }
    })

    var $module = $("#cashoutExchangeVue");
    var $Jdialog = $module.find(".J-dialog");
    function dialog(){
        $.dialog(
            $Jdialog,{
                maskClose:false,
                close:".dl-close",
                ready:function($dialog){
                    $dialog.off("click",".J-ok-btn").on("click",".J-ok-btn",function(){
                        $.cookie("selectDollar",cahsoutExchangeVue.selectDollar);
                        $.cookie("selectCashBuck",cahsoutExchangeVue.selectStarBuck);
                        window.PAGE.loading();
                        window.location.hash = "#/mb/cash_out/verify_email";
                    })
                }
            });

    }
    /*发送邮箱验证码*/
    var $headerErrorMsg = $module.find(".J-sys-Msg");
    $module.on("click",".J-cannotItem",function(){

        $headerErrorMsg.show().html("Insufficient available balance");
        $.delay(3000,function(){
            $headerErrorMsg.hide();
        });

    }).on("click",".J-canItem",function(){
        var $this = $(this);

        cahsoutExchangeVue.selectStarBuck = $this.data("starbuck")*1||0;

        cahsoutExchangeVue.selectDollar = $this.data("dollar")*1||0;


        //另外一个线程
        setTimeout(dialog,20)
    })

})