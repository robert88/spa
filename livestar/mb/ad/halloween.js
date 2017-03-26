$(function(){
    var $module = $('#halloweenVue');
    function getWeek(start,end){
        start = start*1;
        end = end*1;
        var week = [];
        var day7 = 7*60*60*24*1000;
        var len = Math.ceil((end-start)/(day7));
        var tempstart;
        var tempend
        len = len>2?2:len;
        for(var i=0;i<len;i++){
            tempstart = start + i*(day7);
            tempend = start + (i+1)*(day7);
            if(tempend>end){
                tempend = end;
            }
            week.push({startTime:new Date(tempstart),endTime:new Date(tempend)})
        }
        return week;
    }
    var halloween = new Vue({
        el: '#halloweenVue',
        data: {
            streamers:window.PAGE.data.streamers||[],
            viewers:window.PAGE.data.viewers||[],
            week1:getWeek(window.PAGE.data.activeStartTime,window.PAGE.data.activeEndTime)[0]||{startTime:0,endTime:0},
            week2:getWeek(window.PAGE.data.activeStartTime,window.PAGE.data.activeEndTime)[1]||{startTime:0,endTime:0}
        },
        filters:{
            formatDate:function(val){
                var patten = "MM/dd/yy hh:mm PDT";
                return val.toString().toDate().format(patten);
            },
            fill:function(val){
                var klass;
                if(val<3){
                    klass = "topOfstreamer top"+(val+1).toString().fill("00")
                }else{
                    klass = "top"+(val+1).toString().fill("00")
                }
                return klass;
            },
            formatNum:function(val){
                if(val==null){
                    return 0;
                }
                var str = val.format("###,###,###,###");
                return str;
            }
        }
    })
    $module.on("click",".J-follow",function(){

        var $this = $(this);

        var streamerId = $this.data("id");

        var url;
        if (window.PAGE.DEBUG) {
            url = "/pc/public/data/preview.json";
        } else {
            url = '/activity/?ac=follow&aid={0}'.tpl(streamerId||"");
        }

        if(!streamerId){
            showTopMsg($.i18n("i18n.no.streamer.id"));
            return ;
        }

        if($this.hasClass("i-faved")){
            if (window.PAGE.DEBUG) {
                url = "/pc/public/data/preview.json";
            } else {
                url = '/activity/?ac=unfollow&aid={0}'.tpl(streamerId||"");
            }
        }
        window.PAGE.loading();
        LS.ajax({
            url: url,
            limitTime: 1,
            success: function () {
                $this.toggleClass("i-fav").toggleClass("i-faved");
            },
            error:function(msg){
                showTopMsg($.i18n(msg));
            },
            complete:function(){
                window.PAGE.closeLoading();
            }
        })
    })

    function showTopMsg(msg,callBack){
        var $headerErrorMsg =  $module.find(".J-sys-Msg");
        $headerErrorMsg.show().html(msg);
        $.delay(3000,function(){
            if(typeof callBack=="function"){
                callBack();
            }
            $headerErrorMsg.hide();
        });
    }


    function initTab() {
        /*tab*/
        var $tapWrap = $module.find(".J-tab");
        var $tabli = $tapWrap.find(".J-tab-title").find("li");
        var $tabCon = $tapWrap.find(".J-tab-body-item");
        $tabli.click(function () {
            var $this = $(this);
            $tabli.removeClass("current");
            $this.addClass("current")
            $tabCon.hide();
            $tapWrap.find(".J-scroller-con").css("margin-top", 0)
            $tapWrap.find($this.data("tab")).show().updateUI();
        })
    }
    initTab();
})