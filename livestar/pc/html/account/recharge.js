
$(function(){



    function getDictProduct(vue){
        var url;
        if(window.PAGE.DEBUG){
            url = "/pc/public/data/dictProduct.json";
        }else{
            if(window.PAGE.checkLogin()) {
                return;
            }
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("dictProduct");
        }

        LS.ajax({
            url: url,
            success: function(data) {
                vue.payList = data;

            }
        })
    }






    function  bindSelectCharge($module,vue){

        $module.on("click",".J-select-recharge-item",function(){
            var $this = $(this);
            $this.addClass("current").siblings().removeClass("current");

            var temp ={
                product_id:$this.data("id"),
                priceDescription: $this.data("price"),
                title:$this.data("title"),
                channel:$this.data("channel"),
                subTitle:$this.data("subtitle")
            } ;
            var t = $.extend(vue.input,temp);
            if(temp.channel){
                $module.find(".J-submitBtn").removeClass("btn-disable").addClass("btn-primary")
            }

        })

    }


    function init(){


        if(window.PAGE.checkLogin()) {
            return;
        }

        var  $module = $("#rechargeVue");


        var chargeVue = new Vue({
            el:"#rechargeVue",
            data:{
                uInfo:{},
                payList:[],
                input:{
                    product_id:"",
                    channel:"",
                    priceDescription:0,
                    title:0,
                    subTitle:0
                }
            },
            methods:{
                removeCoinsText:function(val,freetext){
                    var coin = val&&val.toFloat()||0;
                    var free = freetext&&freetext.replace(/free/gi,"").replace(/\+/gi,"").replace(/\s+/gi,"").toFloat();
                    return Math.floor(coin+free);
                },
                convertFree:function(val1,val2){
                    var coins = val1&&val1.toFloat()||0;

                    var free = val2&&val2.replace(/free/i,"").replace(/\+/i,"").replace(/\s+/i,"");

                    return Math.floor(free/coins*10000)/100;
                }
            },
            watch:{
                payList:function(){
                    var $f = $module.find(".J-select-recharge-item").eq(0)
                    var $f1 = $module.find(".J-select-recha" +
                        "" +
                        "rge-item01").eq(0)
                    $f.trigger("click");
                    $f1.trigger("click");
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
                convertCoins:function(val){
                    return val&&val.toFloat()||0;
                },
                removeDollarText:function(val){
                    return val&&val.replace("$","");
                },
                removeFreeText:function(val){

                },
                formatNum:function(val){
                    var str = (val||"").format("###,###,###,###");
                    return str;
                }
            }
        });

        $module.find(".J-submitBtn").click(function(){
            if($(this).hasClass("btn-disable")){
                return false;
            }
            if(!chargeVue.input.product_id){
                $.tips($.i18n("i18n.pay.no.product.id"));
                return false;
            }
            if(!chargeVue.input.channel){
                $.tips($.i18n("i18n.pay.no.payment"));
                return false;
            }

            $("#rechargeForm").submit();

            $.dialog($("#dialogPayment"),{ready:function($dialog){
                console.log($dialog);
            },close:false})

        });

        chargeVue.uInfo = $.extend({},window.PAGE.UserInfo);
         $.extend(chargeVue.input,window.PAGE.UserInfo);

        bindSelectCharge($module,chargeVue);

        getDictProduct(chargeVue);



    }
    init();
})
