
$(function(){



    /*
     获取用户订单的信息
     * */

    function getOrder(vue,id){

        var url;
        if(window.PAGE.DEBUG){
            url = "/pc/public/data/getUserInfo.json";
        }else{
            if(window.PAGE.checkLogin()) {
                return;
            }
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("getUserInfo");
        }

        LS.ajax({
            url: url,
            data: {
                cno:id//登陆用户的id
            },
            success: function(data) {
                $.extend(vue.input,data);
            }
        })
    }



    function init(){

        if(window.PAGE.checkLogin()) {
            return;
        }


        var chargeOkVue = new Vue({
            el:"#rechargeOKVue",
            data:{
                uInfo:{},
                input:{
                    price:0,
                    coin:0
                }
            },
            filters: {
                getULevelClass: function(val) {
                    var level = val||"01"
                    return "i-userLevel i-userLevel{0}".tpl(level.trim().fill("00", 2));
                },
                getDefImg:function(val){
                    return val||'/pc/public/images/df.jpg';
                },
                removeCoinsText:function(val){
                   return val&&val.toFloat()||"";
                },
                removeDollarText:function(val){
                    return val&&val.replace("$","");
                },
                removeFreeText:function(val){
                    return val&&val.replace(/free/i,"");
                }
            }
        });

        var params = $.getParam(window.location.hash);

        if(params.cno){
            getOrder(chargeOkVue,params.cno);
        }

        chargeOkVue.uInfo = $.extend({},window.PAGE.UserInfo);
    }

    init();
})
