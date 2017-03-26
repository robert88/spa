$(function(){

    var exchangeVue = new Vue({
        el:"#exchangeVue",
        data:{
            totalMoney:window.PAGE.data.totalMoney,
            exchangeMoney:window.PAGE.data.exchangeMoney,
            selectCoins:0,//可体现的美元
            selectStarBuck:0,//兑换的星票
            starBuckList:window.PAGE.data.proListMap.exchange
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
            },
            formatNum:function(val){
                var str = (val||"").format("###,###,###,###");
                return str;
            }
        }
    })

    var $module = $("#exchangeVue");
    var $Jdialog = $module.find(".J-dialog");
    var errotipsshow =false
    function dialog(){
        $.dialog(
            $Jdialog,{
                maskClose:false,
                close:".dl-close",
                ready:function($dialog){
                    $dialog.off("click",".J-ok-btn").on("click",".J-ok-btn",function(){
                        //错误信息还在显示不让他请求
                        if(errotipsshow){
                            return;
                        }

//                        var url = "/pc/public/data/watch.json";
                        var url = "/cashout/?ac={0}".tpl("exchange");
                        LS.ajax({
                            url:url,
                            limitTime:1,
                            data:{
                                type:2,
                                buck:exchangeVue.selectStarBuck,
                                paypal:window.PAGE.data.paypal
                            },
                            success:function(ret){
                                $.dialog.close($dialog);
                                //兑换成功相应的要减少
//                                exchangeVue.exchangeMoney -= exchangeVue.selectStarBuck;
//                                window.PAGE.data.exchangeMoney -= exchangeVue.selectStarBuck;
//                                exchangeVue.totalMoney -= exchangeVue.selectStarBuck;
                                $headerErrorMsg.show().html("You exchanged successfully!");
                                errotipsshow = true;
                                $.delay(3000,function(){
                                    errotipsshow = false;
                                    $headerErrorMsg.hide();
                                    window.location.reload();
                                });
                            },
                            error:function(msg){
                                $.dialog.close($dialog);
                                errotipsshow = true;
                                $headerErrorMsg.show().html(msg);
                                $.delay(3000,function(){
                                    errotipsshow = false;
                                    $headerErrorMsg.hide();
                                });
                            }
                        })

                    })
                }
            });

    }
    /*发送邮箱验证码*/
    var $headerErrorMsg = $module.find(".J-sys-Msg");
    $module.on("click",".J-cannotItem",function(){

        $headerErrorMsg.show().html("Insufficient available balance");
        $.delay(3000,function(){
            errotipsshow = false;
            $headerErrorMsg.hide();
        });

    }).on("click",".J-canItem",function(){
        var $this = $(this);

        exchangeVue.selectStarBuck = $this.data("starbuck")*1||0;

        exchangeVue.selectCoins = $this.data("coins")*1||0;


        //另外一个线程
        setTimeout(dialog,20)
    })

})