
$(function(){

    require("/pc/public/js/common/pagination.js");

    /*日期选择-年*/
    function initYear(year,$yearOption) {

        var str = [];

        for(var i = year; i > year - 150; i--) {
            str.push('<li data-value="{0}"><a>{0}</a></li>'.tpl(i));
        }

        $yearOption.html("<li data-value=''><a>&nbsp;</a></li>" + str.join(""));

    }
    /*日期选择-月*/
    function initMonth($monthOption) {

        var str = [];

        for(var i = 1; i < 13; i++) {
            str.push('<li data-value="{0}"><a>{0}</a></li>'.tpl(i.toString().fill("00")));
        }

        $monthOption.html("<li data-value=''><a>&nbsp;</a></li>" + str.join(""));

    }

    /*日期选择-交互*/
    function bindDateChange(  $module  ) {

        var curYear = new Date().getFullYear();
        var $yearSelect = $module.find(".J-year");
        var $monthSelect = $module.find(".J-month");

        initYear(curYear, $yearSelect.find(".J-option"));
        initMonth($monthSelect.find(".J-option"));


        $module.find(".J-select-birthday").on("click", ".J-select-item", function () {
            var $this = $(this);
            var $parent = $this.parent();
            var $optionWarp = $this.find(".J-option");
            $parent.find(".J-option").hide();
            $optionWarp.show();
        }).on("click", "li", function () {

            var $this = $(this);
            var $parent = $this.parent().parent()
            $parent.find("li").removeClass("current");
            $this.addClass("current");
            var value = $this.data("value") || "";
            $parent.find("input").val(value).trigger("change");
            $parent.find(".J-option").hide();
        })
    }

    function getQuereParam($module){
        var year = $module.find(".J-year").find("input").val().trim();
        var month = $module.find(".J-month").find("input").val().trim();

        if(year&&month){
            return {year:year,month:month}
        }
    }

    var g_curPage;
    function getRechargeHistory(pageNo,$pageFooter,vue,$module){

        var url;
        if(window.PAGE.DEBUG){
            url = "/pc/public/data/orderList.json";
        }else{
            if(window.PAGE.checkLogin()) {
                return;
            }
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("orderList");
        }

        pageNo = pageNo||1;
        var param = getQuereParam($module);
        var data = {page:pageNo};

        if(param){
            data.begin_timestamp = new Date(param.year,param.month*1-1,1).getTime()/1000;
            data.end_timestamp = new Date(param.year,param.month,0,23,59,59).getTime()/1000;//最后一天
        }


        LS.ajax({
            url: url,
            data: data,
            limitTime:1,
            success: function(data) {
                g_curPage = pageNo;
                vue.historyList = data.list;
                LS.setpageFooter($pageFooter, data.total_page, pageNo, function(changePageNo){
                    getRechargeHistory(changePageNo,$pageFooter,vue,$module)
                });
            }
        })
    }

    function bindCheckByMonth($module,$pageFooter,vue){
        $module.find(".J-check").click(function(){

            var param = getQuereParam($module);
            if(!param){
                return false;
            }
            getRechargeHistory(g_curPage,$pageFooter,vue,$module)
            return false;
        });

    }


    function setCurDate($module){
        var date = new Date();
        var year = $module.find(".J-year").find("input").val(date.getFullYear());
        var month = $module.find(".J-month").find("input").val(date.getMonth()+1);
    }


    function loopHistoryList(vue){

        if(vue.historyList){
            vue.historyList = $.extend(true,{},vue.historyList);

        }
        PAGE.setTimeout(loopHistoryList,60000,vue)
    }


    function init(){

        if(window.PAGE.checkLogin()) {
            return;
        }
        
        var  $module = $("#rechargeHistoryVue");


        var rechargeHistoryVue = new Vue({
            el:"#rechargeHistoryVue",
            data:{
                uInfo:{},
                historyList:[]
            },
            filters: {
                getULevelClass: function(val) {
                    var level = val||"01"
                    return "i-userLevel i-userLevel{0}".tpl(level.trim().fill("00", 2));
                },
                getDefImg:function(val){
                    return val||'/pc/public/images/df.jpg';
                },
                toDate:function(val){
                   return (val*1000).toString().toDate().format("yy-MM-dd");
                },
                removeDollarText:function(val){
                    return val&&val.replace("$","");
                },
                removeFreeText:function(freetext){
                    return freetext&&freetext.replace(/free/gi,"").replace(/\+/gi,"").replace(/\s+/gi,"").toFloat();
                },
                formatNum:function(val){
                    var str = (val||0).toString().format("###,###,###,###");
                    return str;
                }
            },methods:{
                removeCoinsText:function(val,freetext){
                    var coin = val&&val.toFloat()||0;
                    var free = freetext&&freetext.replace(/free/gi,"").replace(/\+/gi,"").replace(/\s+/gi,"").toFloat();
                    return Math.floor(coin+free);
                },
                isGoToPay:function(url,status,channel,createTime){
                    console.log(111111111111)
                    var curTime = new Date().getTime()/1000;
                    if(status==1){
                        if(( channel=='paypal' || channel=='xsolla')&& (curTime-createTime)<(60*60*24)){
                            return '<a href="{0}" class="btn btn-primary btn-s"  target="_blank">Go to pay</a>'.tpl(url);
                        }else{
                            return '<span>Incomplete</span>'
                        }
                    }else if(status==4){
                        return  '<span class="ls-f-inProcess" >In Process</span>'
                    }else if(status==2){
                        return  '<span class="ls-f-succeed" v-show="item.status==2">Succeed</span>';
                    }else{
                        return  '<span>Closed</span>';
                    }
                }
            }
        });

        rechargeHistoryVue.uInfo = $.extend({},window.PAGE.UserInfo);

        bindDateChange( $module );

        loopHistoryList(rechargeHistoryVue)

        setCurDate($module);

        getRechargeHistory(1,$module.find(".J-pageFooter"),rechargeHistoryVue,$module);

        bindCheckByMonth($module,$module.find(".J-pageFooter"),rechargeHistoryVue)

    }
    init();
})
