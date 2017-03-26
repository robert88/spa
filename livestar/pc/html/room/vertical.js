;
(function () {

    require("/pc/public/js/module/im.js");

    var md5 = require("/pc/public/js/module/md5.js");

    require("/pc/public/js/common/ajaxPage.js");

    var Base64 = require('/pc/public/js/module/base64.js');
    var flashPlay = require('/pc/public/js/module/player.js');

    var $module = $("#J_room_vertical");

    function blockStream(){
        $.dialog.closeAll();
        $.dialog($("#sysDialog"), {close: false, ready: function ($dialog) {
        }});
        setTimeout(function () {
            window.location.hash = "";
        }, 5000);
    }

    /*礼物和贡献榜*/
    function watch(vue, callBack) {


        var url;
        if (window.PAGE.DEBUG) {
            url = '/pc/public/data/watch.json'
        } else {
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("watch");
        }

        //没有登录
        if(window.PAGE.checkLogin(true)){
            $module.find(".J-login-require").parent().children().hide();

            $module.find(".J-send-msg-btn").show();
            $module.find(".J-login-require").show().click(function(){
                window.PAGE.checkLogin();
            })
        }else{
            $module.find(".J-login-require").hide();
        }
        var roomId = getRoomId();

		//没有调用roomId，表示没有直播状态
		if( !(roomId*1) ){
			callBack();
			return ;
		}

        LS.ajax({
            url: url,
            data: {
                rid: roomId
            },
            success: function (data) {

                //拉入黑名单
                if (data.allow_watch * 1 != 1) {
                    callBack(true);
                    blockStream();
                    return;
                }

                //主播离开
                //if (data.status * 1 == 2) {
				//
                //} else if (data.status * 1 == 1) {
                //    vue.canplay = "noready";
                //}
                vue.canplay = "noready";

                callBack();
            }
        })
    }

    /*请求次数比较多加缓存*/

    function getUserInfo(uid,callback) {
        var userInfo = {};
        var url;
        if (window.PAGE.DEBUG) {
            url = "/pc/public/data/getUserInfo.json";
        } else {
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("getUserInfo");
        }

        LS.ajax({
			async: false,
            url: url,
            data: {
                id: uid//主播id
            },
            success: function (data) {
                userInfo[uid] = data;
				if(typeof  callback == "function"){
					callback(data);
				}
            }
        })

		return userInfo[uid]
    }

    function initScrollBar() {
        var $scroll = $module.find(".J-scroller");
        /*自定义滚动条*/
        $scroll.customScrollbar({
            content: ".J-scroller-con",
            bar: ".scroll-bar",
            barContain: ".scroll-control",
            overflow: "auto",
            fixHeight: false//固定高度不去调整
        });

    }

    function initPlay(url,rtmp,vVue) {

        /*播放视频*/
        flashPlay({
            id: "player1",
            rtmp: rtmp,
            flashResize: function (w, h) {
                console.log("-----vidow width",w,"height",h)
                if(w>h){
                    console.log("width > height return;");
                    return;
                }
                adjustRoomBody(w / h);
            },
            ready: function (swfPlayer) {

                console.log("flash player is ready!", swfPlayer.width, swfPlayer.height);

                initVol(swfPlayer);

                //initFullScreen(swfPlayer);

                $module.find(".J-video-controlBar").show();

                //回放的是hls
                callPlay(url,swfPlayer);

            },
            pause: function () {
                console.log("pause");
            },
            steamClosed:function(){
                vVue.canplay = "streamStop"
            }
        });
    }

    function callPlay(url,swf){

        if (window.PAGE.DEBUG) {
            url = "rtmp://yfrtmp.livestar.com/live/410310";
        }

        var base64 = new Base64();

        var playUrl = base64.encode(url).ENC(1);

        console.log("play base64 url",playUrl);

        swf.playStream( playUrl );
    }

    function initResize() {

        function resize() {
            adjustRoomBody()
        }

        function windowResizeEvent() {
            $(window).off("resize", resize)
        }

        resize();
        $(window).off("resize", resize).on("resize", resize);
        window.PAGE.destroy.push(windowResizeEvent);
    }


    function getRagen(val, max, min) {
        return (val <= min) ? min : ((val <= max) ? val : max);
    }


////根据window调整容器
//    function getRoomContentSize($containPadding) {
//
//        var containPaddingLeft = $containPadding.css("padding-left").toFloat();
//
//        var containPaddingRight = $containPadding.css("padding-right").toFloat();
//
//        var $contain = $containPadding.parent();
//
//        var offTop = 198//$contain.offset().top;
//
//        var windowWidth = $(window).width();
//
//        var windowHeight = $(window).height();
//
//        //(windowHeight-600)*(60-10)/(948-600)+10;
//
//        var containPaddingTop =getResizeHeight(948,600,windowHeight,60,10);
//
//        containPaddingTop = getRagen(containPaddingTop,10,10);
//
//        if(windowWidth<830){
//            $contain.addClass("J-resize-adjust");
//        }
//        if(windowHeight<670){
//            $(".ls-header").addClass("J-resize-adjust");
//        }
//        var activeMinWidth = 1000;
//        if(windowWidth<1000){
//            activeMinWidth = 780;
//        }
//
//
//
//
//
//        var activeWidth = getRagen(windowWidth, 1200, activeMinWidth);
//        var activeHeight = getRagen(windowHeight - offTop, 740, 500);
//        var videoWidth = (activeWidth - containPaddingRight - containPaddingLeft);
//
//        return {
//            paddingLeft: containPaddingLeft,
//            paddingRight: containPaddingRight,
//            videoWidth: videoWidth,
//            height: activeHeight,
//            width: activeWidth,
//            maxHeight: activeHeight,
//            minHeight: 500,
//            maxWidth: activeWidth,
//            minWidth: activeMinWidth,
//            maxRadio: videoWidth / 500,
//            minRadio: (activeMinWidth - containPaddingRight - containPaddingLeft) / activeHeight
//        }
//    }

    //等比
    function resizeEndedStream(windowHeight){
        var $streamEnded = $module.find(".room-streamEnded");//结束界面
        var resizeEnd = getResize(948,600,windowHeight,34,13);
        resizeEnd = getRagen(resizeEnd,34,13);
        $streamEnded.css("padding-top",resizeEnd+"%");
    }

    function resizeLeftGift(heightInfo){
        var $leftTop = $module.find(".J-resize-left-top");
        var $leftBottom1 = $module.find(".J-resize-left-bottom1");
        var $leftBottom2 = $module.find(".J-resize-left-bottom2");
        var bottom = $leftBottom1.height()+$leftBottom2.height();
        var $leftBottom = $module.find(".J-resize-left-bottom");
        $leftBottom.height(heightInfo.wrapHeight - $leftTop.height()-bottom-70 ).updateUI();//发送礼物框
    }
    //等比
    function getResize(max,min,cur,maxCur,minCur){
        return (cur-min)*(maxCur-minCur)/(max-min)+minCur;
    }

    /*
    * min版时的状态，根据视频大小调整容器
    *
    * */
    function initMINIpc(){
        var $rigthBar = $module.find(".J-resize-rightBar");
        $module.on("click",".J-openRight",function(){
            $rigthBar.addClass("J-adjust-slide");
        })
         $module.on("click",".J-closeRight",function(){
            $rigthBar.removeClass("J-adjust-slide");
        })
    }
	//
    ////根据视频大小调整容器
    //function adjustSizeByRadio(radio, adjustSize) {
	//
    //    //radio = getRagen(radio, adjustSize.maxRadio, adjustSize.minRadio);
	//
    //    if (adjustSize.height * radio > adjustSize.videoWidth) {
    //        adjustSize.height = adjustSize.videoWidth / radio;
    //    } else {
    //        adjustSize.width = adjustSize.width + adjustSize.height * radio - adjustSize.videoWidth;
    //        adjustSize.videoWidth = adjustSize.height * radio;
    //    }
    //    return adjustSize;
    //}

    //记录视频宽度,在没有保存视频宽度之前使用默认比例
    var g_VideoRadio;
    function getRadio(radio){

        if (radio) {
            g_VideoRadio = radio
        }

        if (typeof g_VideoRadio == "undefined") {
            radio = 368 / 640;
        } else {
            radio = g_VideoRadio;
        }
        return radio;
    }

    /*根据窗口的高度得到视频的zui最大高度*/
    function getVideoHeight(){

        var $header =  $(".ls-header");

        var winH = $(window).height();

        /*窗口大小必须在*/
        winH = getRagen(winH, 1000, 700);

        if(winH<750){
            $header.addClass("J-resize-adjust");
        }else{
            $header.removeClass("J-resize-adjust");
        }

        var top = $header.height();

        var padding =getResize( 1014, 600, winH, 20, 5) ;

        padding = getRagen( padding, 20, 5 );

        var innerPadding = $module.find(".J-room-video").css("padding-top").toFloat();

        var height = winH - top-padding*2-padding*2-innerPadding*2;
        return {
            top:Math.floor(top),
            winH:Math.floor(winH),
            height:Math.floor(height),
            padding:Math.floor(padding),
            margin:Math.floor(padding),
            innerPadding:Math.floor(innerPadding),
            wrapHeight:Math.floor(height+innerPadding*2)
        }
    }


    function clearResizeAdjust(){
        $(".ls-header").removeClass("J-resize-adjust");
        return true;
    }

    window.PAGE.destroy.push(clearResizeAdjust);

    /*根据radio和高度来得到宽度*/

    function getVideoWidth(radio, heightInfo){

        var $containPadding = $module.find(".J-room-contain-padding");//视频主体框

        var left = $containPadding.css("padding-left").toFloat();

        var right = $containPadding.css("padding-right").toFloat();

        var $contain = $containPadding.parent();

        var winW = $(window).width();

        /*窗口大小必须在*/
        winW = getRagen(winW, 1200, 800);

        if( winW < 830 ){
            $contain.addClass("J-resize-adjust");
        }

        return {
            width:Math.floor(heightInfo.height*radio),
            winW : Math.floor(winW),
            left:Math.floor(left),
            right:Math.floor(right),
            wrapWidth:Math.floor(heightInfo.height*radio+left+right+heightInfo.innerPadding*2)
        }
    }

    function adjustRoomBody(radio) {

        var $contain = $module.find(".J-room-contain");//视频主体框

        var $videoContain = $module.find(".J-room-video-player");//视频主体框
        var $videoWrapContain = $module.find(".J-room-player");//视频主体框
        var $videoWrapPadding = $module.find(".J-room-video");//视频主体框

        var orgHeight = $contain.height();

        var heightInfo = getVideoHeight();

        radio = getRadio(radio);

        var widthInfo = getVideoWidth(radio, heightInfo);

        //视频大小按比例呈现adjustSize.videoWidth/adjustSize.height=radio
        $videoContain.css({width: (widthInfo.width) + "px", height: (heightInfo.height) + "px"});
        $videoWrapPadding.css({width: (widthInfo.width) + "px", height: (heightInfo.height) + "px"});
        $videoWrapContain.css({width: (widthInfo.width+heightInfo.innerPadding*2) + "px", height: (heightInfo.wrapHeight) + "px"});
        $contain.css({
            width: (widthInfo.wrapWidth) + "px",
            height: (heightInfo.wrapHeight) + "px",
            marginTop:heightInfo.margin+"px",
            marginBottom:heightInfo.margin+"px",
            padding:heightInfo.padding+"px"
        });

        resizeEndedStream(heightInfo.winH);

        resizeLeftGift(heightInfo)

        var $rightTop = $module.find(".J-resize-right-top");
        var $rightBottom = $module.find(".J-resize-right-bottom");

        $rightBottom.height(heightInfo.wrapHeight - $rightTop.innerHeight()-131).updateUI();//消息框

    }



    function initVol(swfPlayer) {
        var $moveBg = $module.find(".J-slider-move-bg");
        var $move = $module.find(".J-slider-move");
        var $speak = $module.find(".J-sound");
        var $speakMute = $module.find(".J-sound-mute");
        var moveFlag = false;
        var dx
        var per
        var width
        var maxVol = 1;

        var curVol = maxVol * 0.5;
        $speak.click(function(){
            swfPlayer.setVolume(0);
            updateVolUi(0);
            $(this).hide();
            $speakMute.show()
        });

        $speakMute.click(function(){
            swfPlayer.setVolume(curVol);
            updateVolUi(curVol/maxVol*100)
            $(this).hide();
            $speak.show()
        });

        function updateVolUi(per){
            if(per<9){
                per=9;
                $speak.hide();
                $speakMute.show()
            }else{
                $speakMute.hide();
                $speak.show()
            }
            $moveBg.css("width", per + "%")
        }

        swfPlayer.setVolume(curVol);

        $move.mousedown(function (e) {
            moveFlag = true;
            dx = e.pageX;
            per = $moveBg.css("width").trim().toFloat();
            width = $moveBg.parent().width();
            $.disableSelection()
        });

        function move(e) {
            if (moveFlag) {
                var mx = e.pageX - dx;

                var curPer = mx * 100 / width + per;
                if (curPer < 9 && curVol!=0 ) {
                    swfPlayer.setVolume( 0);
                    updateVolUi(curPer);
                } else if (curPer < 99) {
                    curVol = maxVol * curPer / 100
                    swfPlayer.setVolume(curVol);
                    updateVolUi(curPer)
                }
            }
        }

        function up(e) {

            if(moveFlag){
                moveFlag = false;
                $.enableSelection()
            }

        }

        $(document).on("mousemove", move).on("mouseup", up);

        function documentEvent() {
            $(document).off("mousemove", move).off("mouseup", up);
            //销毁
            return true;

        }

        window.PAGE.destroy.push(documentEvent);

    }

    /*获取敏感词*/
    function getLimitWord(){
        var limitWord = [];
        var url;
        if (window.PAGE.DEBUG) {
            url = "/pc/public/data/reservedWord.json";
        } else {
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("reservedWord");
        }

        LS.ajax({
            url:url,
            async:false,
            success:function(ret){
                if(ret.array&&$.type(ret.array.chat)=="array"){
                    limitWord = ret.array.chat
                }
            }
        })
        return limitWord;
    }

    function imReady(chatroom, vVue, rVue, lVue) {

        var $send = $module.find(".J-send-msg");
        var $sendText = $send.find(".J-send-msg-input");
        var $sendBtn = $send.find(".J-send-msg-btn");
        var $barrange =  $module.find(".J-barrange");
		var timeCount = 3;//3s不能重复发言
		var perText;
		var timer
        $barrange.off("click").on("click",function(){
            var $this = $(this);
            $this.toggleClass("J-active");
			if( $barrange.hasClass("J-active")){
				$sendText.attr("placeholder","Sending Bullhorn message for 1 star coin！")
			}else{
				$sendText.attr("placeholder","Say something...")

			}
        });


		function bindCount(){
			timeCount = 0;
			clearTimeout(timer);
			timer = setTimeout(function(){
				timeCount = 3;
                $module.find(".J-sameMsg-tips").hide();
                $module.find(".J-muteMsg-tips").hide();
			},3000);
		}


		/*一般发言：最多75个字符*/
		//弹幕：最多40个字符
		$sendText.keyup(function (e) {

            if(e.key=="Enter"){
                $sendBtn.trigger("click");
                return;
            }

			var text = $(this).val();
			if( $barrange.hasClass("J-active")){
				if(text.length>40){
					$(this).val(text.slice(0,40))
				}
			}else{
				if(text.length>75){
					$(this).val(text.slice(0,75))
				}
			}

		});

		/*发送按钮*/

        var limitWord = getLimitWord();

        $sendBtn.removeClass("btn-disable").addClass("btn-primary").off("click").on("click", function () {

            if(window.PAGE.checkLogin()){
                return;
            }
            if($(this).hasClass("btn-disable")){
                return;
            }
            var text = $sendText.val();

            if (!text) {
                console.log("msg is empty!");
                return
            }

            $module.find(".J-sameMsg-tips").hide();
            $module.find(".J-muteMsg-tips").hide();

            var customMsg = {imMessageType: 1};

			$sendText.val('');

            $.each(limitWord,function(idx,val){

                if(~text.indexOf(val)){
                    val = val.replace(/\./g,"\.").replace(/\+/g,"\+").replace(/\\/g,"\\").replace(/\?/g,"\?").replace(/\*/g,"\*")
                        .replace(/\(/g,"\(").replace(/\)/g,"\)").replace(/\[/g,"\[").replace(/\]/g,"\]").replace(/\{/g,"\{").replace(/\}/g,"\}");
                    text = text.replace(new RegExp(val,"gi"),"****")
                }
            });

            if( $barrange.hasClass("J-active") ){
                text =text.slice(0,40);
               sendBarrange(text,lVue);
            }else{
                if(perText==text&&timeCount==0){
                    $module.find(".J-sameMsg-tips").show();
                    return ;
                }
                bindCount();
                perText=text;
                text =text.slice(0,75);
				sendMsg(chatroom,text,customMsg,function(msg){
					msg.userTagInfo.text = text;
					limitVueLength(rVue.roomMsgList, msg.userTagInfo);
				},vVue,rVue);
			}

            return false;
        });

		//用户进入
        if(!window.PAGE.checkLogin(true)){
            console.log("pc room in");
            var newMsg = {};
            var randText = ["i18n.stream.system02","i18n.stream.system03","i18n.stream.system04"]
            var randIndex = Math.floor(Math.random()*3);
            newMsg.text = $.i18n(randText[randIndex]);
            newMsg.type = 3;
            limitVueLength(rVue.roomMsgList, newMsg);

            sendMsg(chatroom,"pc user in",{imMessageType: 2},null,vVue,rVue);

        }
    }

	/*获取img id*/
	var g_userimgList = {};

	function addUser(customMsg,vVue,rVue) {
		vVue.online_num++;
		var uid = customMsg.userTagInfo.uid;

		if(!g_userimgList[uid] ){
			g_userimgList[uid]=getUserInfo(uid);
		}
		insertViewList(g_userimgList[uid],rVue);
	}
	/*是否已经存在了*/
	function insertViewList(uInfo,rVue){
		if(checkViewList(uInfo,rVue)){
			rVue.viewList.push(uInfo)
		}
	}
	/*是否已经存在了*/
	function checkViewList(uInfo,rVue){
		for(var i=0;i<rVue.viewList.length;i++){
			if(rVue.viewList.uid==uInfo.uid){
				return false
			}
		}
		return true;
	}
	function sendBarrange(text,lVue){
		var msg = {message:text};
		if(checkCoin(1,1,lVue,false)){
			return
		}
		var url;
		if (window.PAGE.DEBUG) {
			url = "/pc/public/data/consume.json";
		} else {
			url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("consume");
		}

		LS.ajax({
			url: url,
			data: {
				actionid: "10001",
				suid : getUid(),
				params:JSON.stringify(msg)
			},
			success: function (data) {
				lVue.vInfo.coin = lVue.vInfo.coin - 1;

				lVue.vInfo.coin = lVue.vInfo.coin<=0?0:lVue.vInfo.coin;
			},error:function(e){
				console.log("发送弹幕失败",e)
			}
		})
	}

    /*保留chatroom*/
    var g_chatRoom;
    function sendMsg(chatroom,text,customMsg,callBack,vVue,rVue){
        if(!chatroom){
            chatroom = g_chatRoom;
        }else{
            g_chatRoom = chatroom;
        }
        if(!chatroom){
            console.log("chatroom is not ready");
            return;
        }
		var userInfo = window.PAGE.UserInfo;
        var def = {
            userTagInfo: {
                uid: userInfo.uid,
                uname: userInfo.base_name,
                ulevel: userInfo.exp&&userInfo.exp.lvl
            }
        }

        customMsg = $.extend({},def,customMsg);

        /*用户进入聊天室，自己的消息不会再自己token里面接收*/
        if(customMsg.imMessageType==2){
            customMsg.userTagInfo.type = 1;
            limitVueLength(rVue.roomMsgList, customMsg.userTagInfo);
            addUser(customMsg,vVue,rVue);
        }

        var sendText = chatroom.sendText({
            text: text,
            custom: JSON.stringify(customMsg),
            done: function (error) {

                if(!error && typeof callBack=="function"){
                    callBack(customMsg,text)
                }
                
                if(error){
                    $module.find(".J-muteMsg-tips").show()
                }

                console.log('发送聊天室' + sendText.type + '消息' + (!error ? '成功' : '失败') + ', id=' + sendText.idClient, error, sendText);
            }
        });

        console.log('正在发送聊天室text消息, id=' + sendText.idClient);
    }

    var updateContributionLock = 0;
    function updateContribution(rVue){
        if(updateContributionLock==1){
            return;
        }
        updateContributionLock=1;
        imTime3 = setTimeout(function(){
            var $con = $module.find(".J-tab-contribution")
            if($con.css("display")!="none"){
                initContribution(1, rVue);
            }
            updateContributionLock=0;
        },10000)
    }
    /*
    *初始化im
    *初始化播放器
    *
    * */
    var imTime1,imTime2,imTime3
    function initIm(vVue, rVue, lVue) {

        var opts =
        {
            roomError: function () {

            },//进入房间时发生的错误
            chatError: function (e) {
                //被拉黑
                if(e.code=="kicked"){
                    blockStream();
                }
            },//进入房间时发生的错误
            roomULeave: function (customMsg) {

                //。从分享链接或者首页链接直接进来
                vVue.canplay = "streamStop";
                roomULeave(customMsg,vVue);
                $module.find(".J-btn-sendGift").removeClass("btn-primary").addClass("btn-disable");
                $module.find(".J-send-msg-btn").removeClass("btn-primary").addClass("btn-disable");
            },//主播离开消息
            ready: function (chatroom, nim, roomInfo, addrInfo) {
                imReady(chatroom,vVue, rVue, lVue);
            },//im已经处于监听状态
            chatMsg: function (msg, text) {
                msg.userTagInfo.text = text;
                limitVueLength(rVue.roomMsgList, msg.userTagInfo);
            },//普通聊天消息
            barrageMsg: function (msg, text,time) {
                msg.userTagInfo.text = msg.messageText||text;
                limitVueLength(rVue.roomMsgList, msg.userTagInfo);
                showBarrageMsg(msg,msg.userTagInfo.text,time)
            },//弹幕聊天消息
            someOneIn: function (customMsg, text) {
                customMsg.userTagInfo.type = 1
                customMsg.userTagInfo.text = text;
                limitVueLength(rVue.roomMsgList, customMsg.userTagInfo);
                updateViewers(rVue, vVue)
            },//用户进入
            robotIn: function (customMsg) {
                updateViewers(rVue, vVue)
                console.log("robert in")
            },//机器人进入
            someOneOut: function () {
                console.log("some body out")
                updateViewers(rVue, vVue)
            },//用户退出
            robotOut: function () {
                console.log("robert out")
                updateViewers(rVue, vVue)
            },//机器人退出
            giftMsg: function (msg, text,time) {
                msg.userTagInfo.text = text;
                showGiftMsg(msg, lVue, rVue,time)
                updateContribution(rVue);
                getStreamerInfo(lVue,vVue);
            },//礼物消息
            likeMsg: function (customMsg, text) {
                console.log("like msg in")
            },//点赞消息
            backStream:function(){
                clearTimeout(imTime1)
                clearTimeout(imTime2)
                vVue.canplay = "blockStream"
                imTime1= setTimeout(function(){
                    vVue.canplay = "waitingStream"
                },1500)
                imTime2= setTimeout(function(){
                    vVue.canplay = "streamStop";
                },60000)

            },
            followMsg:function(customMsg, text){
                customMsg.userTagInfo.type = 2
                limitVueLength(rVue.roomMsgList, customMsg.userTagInfo);
            },
            streaming:function(){

                clearTimeout(imTime1)
                clearTimeout(imTime2)
                if(vVue.canplay!="streamStop"){
                    vVue.canplay = "ok";
                }

            },
            sysMsg: function () {
                console.log("sys msg in")
            }//系统消息

        }

        getIMInfo(getUid(),vVue, function (imOpts,isRTMP) {

            imOpts = $.extend({}, opts, imOpts);

            if(isRTMP){
                //聊天室设计为单例模式
                var hanlderMsg = $.im(imOpts);
                //本地测试
                if (window.PAGE.DEBUG) {
                    testim(hanlderMsg, opts);
                }
                initPlay(imOpts.url,isRTMP,vVue);
                initSendGift(lVue);

            }else{

                $module.find(".J-contribution-tabTitle").trigger("click");

                triggerReplay(imOpts.url,isRTMP,vVue)
            }

        });

    }

    //播放结束
    function roomULeave(customMsg,vVue){
        if(customMsg.endLiveInfo&&customMsg.endLiveInfo.data){
			var data = customMsg.endLiveInfo.data;
            vVue.like = data.like;
            vVue.coins = data.coins;
            vVue.views = data.views;
            vVue.stream_time = data.stream_time;
        }
    }

    //弹幕消息
    //每次只能显示两个动画必须用到队列
    var g_barrage_queue = [];
    var g_barrage_time=0;
    var g_barrage_timer;
    var g_barrage_index=0;
    function showBarrageMsg(customMsg,text,time){
        g_barrage_index++;
        if(g_barrage_index>1){
            g_barrage_index=0;
        }
        var top = [65,75][g_barrage_index];
        var videoWidth =$module.find(".J-room-video").width()+50
        var templ = [
            '<div class="barrage" style="top:'+top+'%;left:'+videoWidth+'px;width: 200px">',
                '<div class="userImg-circle">',
                   ' <img src="{0}">',
                        '<p class="userImg-mask"></p>',
                    '</div>',
                    '<div class="name">{1}</div>',
                    '<div class="barrage-mes">{2}</div>',
                '</div>',
            '</div>'
        ].join("");
        var userInfo = customMsg.userTagInfo;
        var animateHtml = templ.tpl(getThumb(userInfo.uid), userInfo.uname, text);
        var $playerContain = $module.find(".J-room-video-player");//视频

        g_barrage_queue.push($(animateHtml).appendTo($playerContain));

        clearTimeout(g_barrage_timer);
        clearBarrageAnimate()
    }
    //弹幕消息动画
    //每次只能显示两个动画必须用到队列
    function clearBarrageAnimate(){
        //没有了动画
            if(g_barrage_queue.length==0){
                return;
            }
        //超过2条
            if(g_barrage_time>1){
                g_barrage_timer= setTimeout(clearBarrageAnimate,2000);
                return
            }
             g_barrage_time++;

            var $cur = g_barrage_queue.shift();

            if($cur.length){
                $cur.animate({left: -340}, 10000, function () {
                    $cur.remove();
                    g_barrage_time--;
                })
            }else{
                g_barrage_time--;
            }

        g_barrage_timer= setTimeout(clearBarrageAnimate,2000);
    }



    //礼物消息动画
    //每次只能显示两个动画必须用到队列
    var g_giftAnimate_queue = [];
    var g_giftAnimate_time=0;
    var g_giftAnimate_timer;
    var g_giftAnimate_timer2;
    var g_giftAnimate_index=0;
    var g_awayAnimate_time;//连击的动画效果
    var g_awayAnimate= 0;
    function showGiftMsg(customMsg, lVue, rVue,time) {



        var templ = ['<div class="pop-gifts" style="top:{4}%;left:-280px;width: 250px">',
            '<div class="userImg-circle">',
            '<img src="{0}">',//用户头像
            '<p class="userImg-mask"></p>',
            '</div>',
            '<div class="nick-name">',
            '<p class="name">{1}</p>',//用户名称
            '<p class="ls-f-primary">Sent</p>',
            '</div>',
            '<div class="gift">',
            '<img src="{2}"><span class="amount">X<em><span class="J-amount">{3}<span></span></em></span>',//礼物数和礼物图片
            '</div>',
            '</div>'].join("");
        var updateList = updateSendGiftList(customMsg.userTagInfo, customMsg.giftMessages, lVue, rVue,g_awayAnimate);

        var $playerContain = $module.find(".J-room-video-player");//视频

        for (var i = 0; i < updateList.length; i++) {
            g_giftAnimate_index++;
            if(g_giftAnimate_index>1){
                g_giftAnimate_index=0;
            }
            var top = [40,50][g_giftAnimate_index];
            var sendGiftInfo = updateList[i];
            var animateHtml = templ.tpl(sendGiftInfo.userimg, sendGiftInfo.uname, sendGiftInfo.src, sendGiftInfo.quantity,top);
            //以id为主来解决唯一性
            g_giftAnimate_queue.push($(animateHtml).appendTo($playerContain).attr("id",sendGiftInfo.id));
        }
        clearTimeout(g_awayAnimate_time)
        g_awayAnimate_time =  setTimeout(function(){
            g_awayAnimate++;
        },3000)
        clearTimeout(g_giftAnimate_timer);
        clearGiftAnimate()
    }

    function clearGiftAnimate(){
        console.log("clearTime",g_giftAnimate_queue.length)

        //没有了动画
        if(g_giftAnimate_queue.length==0){
            return;
        }

        //超过2条
        if(g_giftAnimate_time>1){
            g_giftAnimate_timer= setTimeout(clearGiftAnimate,1000);
            return
        }
        g_giftAnimate_time++;

        var $cur = g_giftAnimate_queue.shift();

        if($cur.length){
            $cur.animate({left: 0}, 200, function () {
                if(!$cur.hasClass("gift-animate-out")){
                    outGiftAnimate($cur)
                }

            });
        }else{
            g_giftAnimate_time--;
        }

        g_barrage_timer= setTimeout(clearGiftAnimate,1000);
    }

    function outGiftAnimate($cur){
        clearTimeout($cur.data("out-timer")||0)
        var outTimer= setTimeout(function () {
            //退出的动画不连续
            $cur.addClass("gift-animate-out");
            $cur.animate({left: -260}, 500, function () {
                $cur.remove()
                g_giftAnimate_time--;
                console.log("cler-----")
            })
        }, 3000);
        $cur.data("out-timer",outTimer)
    }
    /*垃圾回收*/
    window.PAGE.destroy.push(function(){
        clearTimeout(g_barrage_timer);
        clearTimeout(g_giftAnimate_timer);
        clearTimeout(g_giftAnimate_timer2);
        clearTimeout(imTime1)
        clearTimeout(imTime2)
        clearTimeout(imTime3)
        return true;
    })

    function getSendGiftKey(gfId, uid,time) {
        return "gift" + gfId + "uid" + uid+"time"+time
    }

    var g_gift_info = {};//存储礼物信息
    var g_send_gift_map = {};//存储发送的礼物信息

    /*发送礼物列表变成map*/

    function get_gift_info() {
        if (!g_gift_info.length) {
            initAllGiftList();
            g_gift_info.length = 1;
        }
    }

    /*
     *发送礼物提示消息全部礼物
     * */
    function initAllGiftList() {
        var url;
        if (window.PAGE.DEBUG) {
            url = "/pc/public/data/dictGift.json";
        } else {
            url = '/api/?ct=api&ac=web&platform=livestar&gift_type=all&method={0}'.tpl("dictGift");
        }

        LS.ajax({
            url: url,
            async: false,
            success: function (data) {
                if(data&&data.array){
                    for(var i=0;i<data.array.length;i++){
                        var item = data.array[i];
                        g_gift_info[item.id] = item;
                    }
                }
            }
        })
    }
    /*更新发送礼物数据*/

    function updateSendGiftList(userInfo, giftInfos, lVue, rVue,time) {

        var showKeys = [];

        get_gift_info(lVue);

        for (var i = 0; i < giftInfos.length; i++) {

            var giftInfo = giftInfos[i];

            var key = getSendGiftKey(giftInfo.gift_id, userInfo.uid,time);

            var giftActiveInfo = {
                src: g_gift_info[ giftInfo.gift_id ]&&g_gift_info[ giftInfo.gift_id ].msg_icon||"",
                message:g_gift_info[ giftInfo.gift_id ]&&g_gift_info[ giftInfo.gift_id ].message,
                quantity: giftInfo.quantity * 1 || 0,
                userimg: getThumb(userInfo.uid),
                level: userInfo.ulevel,
                uname: userInfo.uname,
                giftName: g_gift_info[ giftInfo.gift_id ]&&g_gift_info[ giftInfo.gift_id ].name,
                id:key
            };

            if (g_send_gift_map[key]) {

                g_send_gift_map[key].quantity = (g_send_gift_map[key].quantity || 0) + giftActiveInfo.quantity;

                if($("#"+key).length){
                    $("#"+key).find(".J-amount").html( g_send_gift_map[key].quantity);
                    if(!$("#"+key).hasClass("gift-animate-out")){
                        outGiftAnimate($("#"+key))
                    }
                }

            } else {
                g_send_gift_map[key] = $.extend({},giftActiveInfo);
                limitVueLength(rVue.sendList,g_send_gift_map[key]);// 更新礼物列表
                $module.find(".J-tab-giftMsg").updateUI();
                showKeys.push(g_send_gift_map[key]);
            }

        }

        return showKeys;
    }


    /*防止内存泄漏*/

    function limitVueLength(arr, val) {

        //保存1000的长度
        if (arr.length > 1000) {
            arr.shift();
            //为空不需要添加
            if(val!=null){
                arr.push(val);
            }
        } else {
            if(val!=null){
                arr.push(val);
            }
        }
    }

    function getThumb(uid){

        var key = md5(uid+"image");

        if(window.PAGE.DEBUG){
            return md5(uid+"image")
        }else{
            var domain = window.location.href.split("#")[0].split("?")[0];
            var dev = "user"
            if(~domain.indexOf("test")){
                dev = "user.test"
            }else if(~domain.indexOf("preview")){
                dev = "user.preview"
            }
            return "http://{0}.livestar.com/?ct=image&uid={1}&key={2}&isthumb".tpl(dev,uid,key)
        }

    }
    function getIMInfo(aid,vVue, callback) {

        var url;
        if (window.PAGE.DEBUG) {
            url = "/pc/public/data/getIMInfo.json";
        } else {
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("getIMInfo");
        }

        LS.ajax({
            url: url,
            data: {
                aid: aid
            },
            success: function (data) {

                var isRTMP = true;

                if (typeof callback == "function") {

                    //回放状态
                    if(data.review_url){
                        vVue.canplay = "streamEnded";
                        vVue.views = data.views;
                        vVue.coins = data.coins;
                        vVue.like = data.likes;
                        vVue.stream_time = data.live_time;

                        isRTMP = false;

                    //重来就没有直播过的状态
                    }else if(!data.live_url){

                        vVue.canplay = "noStream";

                    //直播状态
                    }else{
                        vVue.canplay = "ok";
                    }

                    var newOpts = {
                        url:data.live_url||data.review_url,
                        isOnline:data.live_url?true:false,
                        appKey: data.im_appkey,//appkey
                        token: data.im_token,
                        account: data.im_accid,//游客id
                        imRoomId: data.im_roomid//roomId
                    };
                    callback(newOpts,isRTMP);
                }
            }
        })

    }

    /*trigger replay*/
    function triggerReplay(url,rtmp,vVue){

        var $replayBtn = $module.find(".J-trigger-replay");
        $replayBtn.click(function(){
            vVue.canplay = "ok";
            initPlay(url,rtmp,vVue);
        });
    }

    /*
    * 创建了循环计时器必须清除
    *
    * */
    var timer;
    function testim(hanlderMsg, opts) {
        var url = "/pc/public/data/im.json";
        LS.ajax({
            url: url,
            success: function (msg) {
                hanlderMsg(msg, opts);
            }
        });

       timer = setTimeout(function () {
            testim(hanlderMsg, opts);
        }, 2000);
    }
    function clearTimer(){
        clearTimeout(timer);
    }
    window.PAGE.destroy.push(clearTimer);

    /*
     * f发送礼物
     *
     * */

    function initGiftHover(vue) {
        var $giftsList = $module.find(".room-giftsWindow");
        var $giftsTop = $giftsList.find(".tipsPop");
        var $giftsdir = $giftsList.find(".i-direction");

        $giftsList.on("mouseenter", "li", function () {

            var $this = $(this);
            var index = $this.index();
            var position = $this.position();
            var top = position.top;
            var height = $this.height();
            var left = position.left+6;
            var tipHeight = 52;
            var dir = "left";

            if ((index + 1) % 3 == 0) {
                dir = "right"
            }
            //显示左右位置
            if (dir == "right") {
                $giftsTop.addClass("tips-topLeft").removeClass("tips-topRight");
            } else {
                $giftsTop.addClass("tips-topRight").removeClass("tips-topLeft");
            }

            //显示上下位置
            if (top < tipHeight) {
                $giftsTop.css({
                    top: top + height,
                    left: left
                });
                $giftsdir.addClass("tipsPop-rotate")
            } else {
                $giftsTop.css({
                    top: top - tipHeight,
                    left: left
                });
                $giftsdir.removeClass("tipsPop-rotate");
            }
            $giftsList.find(".tipsPop").show();
            vue.giftList.exp = $this.data("exp");
            vue.giftList.value = $this.data("value");
            return false;

        }).on("mouseleave", "li", function () {
            //hover效果结束
            $giftsList.find(".tipsPop").hide();
        })
    }

    /*
     *发送礼物提示消息
     * */
    function initGiftList(vue) {
        var url;
        if (window.PAGE.DEBUG) {
            url = "/pc/public/data/dictGift.json";
        } else {
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("dictGift");
        }

        LS.ajax({
            url: url,
            success: function (data) {
                vue.giftList.items = data.array;
                vue.giftList.ver = data.version || 1;
            }
        })
    }

    /*
     *发送礼物提示消息
     * */

    function sendTips($tips, $msg, msg, timer) {
        clearTimeout(timer);
        $tips.show();
        $msg.html(msg);
        return setTimeout(function () {
            $tips.hide();
        }, 3000)
    }

	/*发送礼物金币是否充足*/
	function checkCoin(quantity,value,lVue,giftFlag){
        var id;
        if(giftFlag){
            id="#rechargeGiftDialog";
        }else{
            id="#rechargeImDialog";
        }
		if(quantity*value>lVue.vInfo.coin){
			$.dialog.closeAll();
			$.dialog($(id),{dialogStyle:"background-color:transparent;",bodyStyle:"padding:0;",close:".close",maskClose:false,ready:function($dialog){
			}});
			return true;
		}
	}

    /*退出时注销*/
    function bindPageUnload(vVue,rVue){
        var oldLoad =  window.onbeforeunload;
        window.onbeforeunload = onclose;

        function onclose() {
            if(typeof oldLoad=="function"){
                oldLoad();
            }
            if(window.PAGE.checkLogin(true)){
                $.ajax({
                    url: '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("destoryToken")
                });
            }else{
                sendMsg(null,"pc user leave",{imMessageType: 3},null,vVue,rVue)
            }
        }
        function clearBeforeLoad(){
            onclose();
            window.onbeforeunload = oldLoad;
            return true;
        }
        window.PAGE.destroy.push(clearBeforeLoad)
    }


	function bindDocHideQuantityList(){
		function bindDoc(e){

			if( $(e.target)[0]==$module.find(".J-chooseGift")[0] || $(e.target).parents(".J-chooseGift").length ){

			}else{
				$module.find(".J-chooseGift").hide();
			}
		}
		$(document).off("click",bindDoc).on("click",bindDoc);
		function unbindDoc(){
			$(document).off("click",bindDoc);
			return true;
		}
		window.PAGE.destroy.push(unbindDoc)
	}

    function initSendGift(lVue) {

        //礼物hover显示tips效果
        var $giftsList = $module.find(".J-room-giftsWindow");
        var $chooseGiftList = $module.find(".J-chooseGift");
        var $giftQuantityIpt = $module.find(".J-chooseGiftIpt");
        var $sendGiftBtn = $module.find(".J-btn-sendGift");
        var $chooseGiftContent = $module.find(".J-chooseGiftContent");
        var timer;
        var $tips = $module.find(".J-btn-sendGift-tips");
        var $msg = $module.find(".J-btn-sendGift-msg");
        var roomUid = getUid();

        /*选择礼物*/
        $giftsList.on("click", "li", function () {
			if(window.PAGE.checkLogin()){
				return false;
			}
            var $this = $(this);
            if($giftQuantityIpt.data("id")==$this.data("id")){
                return false;
            }
            $giftsList.find("li").removeClass("current");
            $chooseGiftContent.find("img").attr("src", $this.find("img").attr("src"));
            $this.addClass("current");

            $giftQuantityIpt.data("id", $this.data("id"));
            $giftQuantityIpt.data("value", $this.data("value"));
            $giftQuantityIpt.data("type", $this.data("type"));
            $giftQuantityIpt.val(1);
            return false;
        });



        /*选择数量*/
        $module.find(".J-slide-up").click(function () {
            if($giftQuantityIpt.data("type")=="2"){
                return false;
            }
            $chooseGiftList.toggle();
            return false;
        })

        /*选择礼物数量*/
        $chooseGiftList.on("click", "li", function () {
            if($giftQuantityIpt.data("type")=="2"){
                return false;
            }
            var $this = $(this);
            $chooseGiftList.hide();
            $giftQuantityIpt.val($this.data("value").trim());
            return false;
        });

		bindDocHideQuantityList();

        /*监听选择礼物*/
        $giftQuantityIpt.change(function () {
            $chooseGiftList.hide();
        })

        $giftQuantityIpt.keyup(function(){
            var $this = $(this);
            if($giftQuantityIpt.data("type")=="2"){
                $this.val(1);
                return false;
            }

            var val = $this.val();
            if(val.length>2){
                $this.val(val.slice(0,2))
            }
        });

        function lockTime(time){
            $sendGiftBtn.removeClass("btn-primary").addClass("btn-disable")
            PAGE.setTimeout(function(){
                $sendGiftBtn.removeClass("btn-disable").addClass("btn-primary")
            },time)
        }

        /*发送礼物*/
        $sendGiftBtn.removeClass("btn-disable").addClass("btn-primary").click(function () {

			if (window.PAGE.checkLogin()) {
				return;
			}
            if($sendGiftBtn.hasClass("btn-disable")){
                return;
            }

            var url;
            if (window.PAGE.DEBUG) {
                url = "/pc/public/data/sendGift.json";
            } else {
                url = '/api/?ct=api&ac=web&platform=livestar&method={0}&route=livestar'.tpl("sendGift");
            }

            //数量
            var quantity = $giftQuantityIpt.val().trim() * 1;
            var gift_id = $giftQuantityIpt.data("id");
			var value = $giftQuantityIpt.data("value");
            var type = $giftQuantityIpt.data("type");
            if(type==2){
                lockTime(3000)
            }
            value = (value&&(value*1))||0;

			if( checkCoin(quantity,value,lVue,true) ){
				return;
			}

            if (!gift_id) {
                timer = sendTips($tips, $msg, "Please choose a gift", timer);
                return;
            }

            if (!quantity) {
                timer = sendTips($tips, $msg, "Please input ‘1-99’", timer);
                return;
            }

            LS.ajax({
                url: url,
                data: {
                    streamer: roomUid,
                    gifts: [
                        { "gift_id": gift_id, "quantity": quantity, "time": +new Date()}
                    ]
                },
                success: function (data) {

					lVue.vInfo.coin = lVue.vInfo.coin - quantity*value;

					lVue.vInfo.coin = lVue.vInfo.coin<=0?0:lVue.vInfo.coin;

					timer = sendTips($tips, $msg, "Success", timer);
                }
            })
        })
    }

    function initFollow(lVue,vVue,rVue) {
        /*关注*/
        var $follow = $module.find(".J-btn-follow");
        var uid = getUid();

        //如果是自己,就不需要显示follow
        if(uid== $.cookie("lv_uid")){
            $follow.hide();
            return;
        }

        $follow.click(function () {

            var url;
            if (window.PAGE.DEBUG) {
                url = "/pc/public/data/preview.json";
            } else {
                if (window.PAGE.checkLogin()) {
                    return;
                }
                //为0表示没有follow，就要请求follow
                if(lVue.uInfo.is_follow*1){
                    url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("unfollow");
                    //不需要关注
                    return
                }else{
                    url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("follow");
                }
            }


            LS.ajax({
                url: url,
                limitTime: 1,
                data: {
                    follow_uid: uid
                },
                success: function () {
                    if(lVue.uInfo.is_follow*1){
                        lVue.uInfo.is_follow = 0;
                        lVue.uInfo.follower--;
                    }else{
                        lVue.uInfo.is_follow = 1;
                        lVue.uInfo.follower++;
                    }
                    console.log("follow seccess!");
                    sendMsg(null,"following Streamer",{imMessageType:9},function(msg){
                        msg.userTagInfo.text = text;
                        limitVueLength(rVue.roomMsgList, msg.userTagInfo);
                    },vVue,rVue)

                }
            })
        });

    }
function bindGoReCharge(){
	$module.find(".J-go-Recharge").click(function(){
		if(window.PAGE.checkLogin()){
            //阻止默认行为
			return false;
		}
	})
}
    function initTab(rVue, vVue,rVue) {
        /*tab*/
        var $tapWrap = $module.find(".J-tab");
        var $tabli = $tapWrap.find(".J-tab-title").find("li");
        var $tabCon = $tapWrap.find(".J-tab-body-item");
        $tabli.click(function () {
            var $this = $(this);
            $tabli.removeClass("current");
            $this.addClass("current")
            $tabCon.hide();
            $tapWrap.find(".J-scroller-con").css("margin-top", 0);
            if($this.data("tab")==".J-tab-viewer"){
                initViewers(1, rVue, vVue);
            }
            if($this.data("tab")==".J-tab-contribution"){
                /*消息中礼物*/
                initContribution(1, rVue);
            }
            $tapWrap.find($this.data("tab")).show().updateUI();
        })
    }

    /*获取主播id*/
    function getUid() {

        var short = getShortParam();
        var roomUid = $.getParam(short).uid;
        if (!roomUid) {
            console.log("can not find room player id!");
            return;
        }
        return roomUid;
    }
    /*
    * 获取短暂的url
    * */
    function getShortParam(){

        var short = $.getParam(window.location.hash).short;
        if(!short){
            console.error("param short lose");
            return ;
        }
        var base64 =new Base64()
        return base64.decode(decodeURIComponent(short));
    }


    /*获取主播房间id*/
    function getRoomId() {
        var short = getShortParam();
        var roomid = $.getParam(short).roomid;
        if (!roomid) {
            return;
        }
        return roomid;
    }


    /*消息中的礼物*/
    function initMsgGiftList() {

    }




    /*消息中的礼物*/
    function initContribution(pageNo, vue,complete) {
        var url;
        if (window.PAGE.DEBUG) {
            url = "/pc/public/data/getRank.json";
        } else {
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}&type=total'.tpl("getRank");
        }


        LS.pageAjax({
            url: url,
            vue: vue,
            pageNo: 1,
            data: {
                anchorId: getUid(),
                page: pageNo
            },
            complete:function(){
                if(typeof complete=="function"){
                    complete();
                }
            },
            success: function (historyPage, currentPage) {
                vue.contribution1 = historyPage[0]||{};
                vue.contribution2 = historyPage[1]||{};
                vue.contribution3 = historyPage[2]||{};
                vue.conList = historyPage.slice(3);
            }
        })
    }
    var updateViewerTimer =0
    function updateViewers(rVue, vVue){
        if(updateViewerTimer){
            return;
        }
        updateViewerTimer=1;
        updateViewerTimer = PAGE.setTimeout(function(){
            var $tab = $module.find(".J-tab-viewer");
            if($tab.css("display")!="none"){
                initViewers(1, rVue, vVue);
            }
            updateViewerTimer=0
        },60000)
    }
    /*在线人数列表*/
    function initViewers(pageNo, rVue, vVue,getNum) {

        var url;
        if (window.PAGE.DEBUG) {
            url = "/pc/public/data/getRoomOnline.json";
        } else {
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("getRoomOnline");
        }
		var roomId = getRoomId();
		if(! (roomId*1) ){
			console.log("getRoomOnline room id error:",roomId);
			return;
		}

        LS.pageAjax({
            url: url,
            vue: rVue,
            pageNo: 1,
            data: {
                rid: roomId,
                page: pageNo
            },
            success: function (historyPage, currentPage, limit, totalPage,total) {
                //不更新用户列表
                if(!getNum){
                    rVue.viewList = historyPage;
                }
                vVue.online_num = total
            }
        })

    }
    /*触发跳转到2*/
    function triggerCanplay2(vVue){
        $module.find(".J-trigger-canplay2").click(function(e){
            vVue.canplay = "pushStream";
            return false;
        })
    }

    /*举报*/
    function initReport() {
        $module.find(".J-report").click(function () {
            $.dialog($("#reportDialog"), {close: false, maskClose: false, ready: function ($dialog) {
                $dialog.off("click", ".J-btn-ok").on("click", ".J-btn-ok", function () {
                    var url;
                    if (window.PAGE.DEBUG) {
                        url = "/pc/public/data/report.json";
                    } else {
                        if (window.PAGE.checkLogin()) {
                            return;
                        }
                        url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("report");
                    }


                    LS.ajax({
                        url: url,
                        limitTime: 1,
                        data: {
                            ruid: getUid()
                        },
                        success: function (ret) {
                            $.dialog.close($dialog);
                        }
                    })
                })
            }});
        })
    }

    /*分享*/
    function initShare() {
        var text = encodeURIComponent(document.title + " " + location.href);
        $module.find(".J-share-fb").attr("href", "http://www.facebook.com/sharer.php?u=" + encodeURIComponent(location.href) + "&t=" + encodeURIComponent(document.title));
        $module.find(".J-share-tw").attr("href", "https://twitter.com/intent/tweet?text=" + text + "&source=webclient");
    }

    /*添加了全局的样式，关闭页面要清除*/
    function pageDestroy() {
        $("body").removeClass("room-dark room-vertical").find(".J-header-wrap").addClass("ls-wrap");
        if (window.location.hash.indexOf("#/pc/html/room/vertical") == -1) {
            return true;
        }
    }

    window.PAGE.destroy.push(pageDestroy);

    $("body").addClass("room-dark room-vertical").find(".J-header-wrap").removeClass("ls-wrap")
    var videoVue = new Vue({
        el: "#videoVue",
        data: {
            canplay: "noready",
            online_num: 0,
            canReplay:0,
            live_end_time:0,
            coins:0,
            views:0,
            like:0,
            stream_time:"",
            streamerList: [],
            userimg:""
        },
        methods:{
            parseUrl:function(uid,roomid){
                var base64 = new Base64();
                var url = encodeURIComponent(base64.encode( "uid={0}&roomid={1}".tpl(uid,roomid) ));
                return "#/pc/html/room/vertical?short={0}".tpl(url);
            },
            getThumb:function(uid){
                return getThumb(uid);
            }
        },
        filters: {
            forkXSS:function(val){
                return val;
            },
            formatStreamTime:function(val){
                if(typeof val=="string"&&val.indexOf(":")){
                    return val;
                }
                val = (val*1||0);
                var h = Math.floor(val/60/60);
                var m = Math.floor((val-(h*3600))/60);
                var s = Math.floor((val-(h*3600)-(m*60)));
                return h.toString().fill("00")+":"+m.toString().fill("00")+":"+s.toString().fill("00");
            },
            formatNum:function(val){
                var str = val;
                if(/^\d+$/.test(val)){
                    str = (val||"").format("###,###,###,###");
                }
                return str;
            },
            formatK:function(val){
                val = (val||0)/1000;
                var str = Math.floor(val*100)/100;
                return str+"k";
            },
            formatTime:function(val){
                return val.toString().toDate().format("hh:mm:ss")
            },
            getULevelClass: function (val) {
                var level = val || "01"
                return "i-userLevel i-userLevel{0}".tpl(level.trim().fill("00", 2));
            },
            getDefImg: function (val) {
                return val || '/pc/public/images/df.jpg';
            }
        }
    });

    function initStreamerList(vue) {

        var url;
        if (window.PAGE.DEBUG) {
            url = "/pc/public/data/getRecently.json";
        } else {
            url = '/api/?ct=api&ac=web&platform=livestar&method={0}&page={1}&limit={2}'.tpl("getRecently", 1, 4)
        }

        LS.ajax({
            url: url,
            success: function (data) {
                vue.streamerList = data.info;
            }
        })

    }
    /*实时更新主播信息*/
    var streamerInfoTime=0;
    function getStreamerInfo(lVue,vVue){
        if(streamerInfoTime==1){
            return;
        }
        streamerInfoTime = 1
        PAGE.setTimeout(function(){
            getUserInfo(getUid(),function(data){
                lVue.uInfo = data;
                if(lVue.uInfo.userimg){
                    vVue.userimg=lVue.uInfo.userimg
                }

            });
            streamerInfoTime =0;
        },3000);
    }

    //必须先获取
    watch(videoVue, function (block) {

        var leftVue = new Vue({
            el: "#leftRoomInfoVue",
            data: {
                uInfo: {},//主播信息
                vInfo: {
					coin:window.PAGE.UserInfo.coin||0,
				},//当前用户信息
                giftList: {//礼物列表
                    exp: 0,
                    value: "",
                    items: []
                }
            },
            filters: {

                forkXSS:function(val){
                    return val;
                },
				formatNum:function(val){
                    var str = val;
                    if(/^\d+$/.test(val)){
                        str = (val||"").format("###,###,###,###");
                    }
					return str;
				},
                formatK:function(val){
                    if(val>1000){
                        val = (val||0)/1000;
                        var str = Math.floor(val*100)/100;
                        return str+"k";
                    }
                    return val||"";
                },
                getULevelClass: function (val) {
                    var level = val || "01"
                    return "i-userLevel i-userLevel{0}".tpl(level.trim().fill("00", 2));
                },
                getDefImg: function (val) {
                    return val || '/pc/public/images/df.jpg';
                }
            },

            watch:{
                "giftList.items":function(){
                    var $giftsList = $module.find(".J-room-giftsWindow");
                    var $chooseGiftContent = $module.find(".J-chooseGiftContent");
                    var $resizeGift = $module.find(".J-resize-gift");
                    $chooseGiftContent.find("img").attr("src", $giftsList.find("li").find("img").attr("src"));
                    $resizeGift.updateUI()
                }
            },
            methods:{
                getThumb:function(uid){
                    return getThumb(uid);
                }
            }
        });

        /*礼物和贡献榜*/
        var rightVue = new Vue({
            el: "#rightRoomInfoVue",
            data: {
                sendList: [],//礼物显示列表
                viewList: [],//关注列表
                conList: [],//贡献榜
                contribution1: {},
                contribution2: {},
                contribution3: {},
                roomMsgList: [],
                remindCount: 0
            },
            methods:{
                parseUrl:function(uid,roomid){
                    var base64 = new Base64();
                    var url = encodeURIComponent(base64.encode( "uid={0}&roomid={1}".tpl(uid,roomid) ));
                    return "#/pc/html/room/vertical?short={0}".tpl(url);
                },
                getThumb:function(uid){
                    return getThumb(uid);
                }
            },
            filters: {
                getULevelClass: function (val) {
                    var level = val || "01";
                    return "i-userLevel i-userLevel{0}".tpl(level.trim().fill("00", 2));
                },
                formatNum:function(val){
                    var str = val;
                    if(/^\d+$/.test(val)){
                        str = (val||"").format("###,###,###,###");
                    }
                    return str;
                },
                forkXSS:function(val){
                    return val;
                }

            },
            watch: {
                roomMsgList: function (val) {
                    var len = val&&val.length;
                    var $msg = $module.find(".J-resize-msg");
                    var addLen = 0
                    if($msg.data("scrollbardown")){
                        this.remindCount = len- (parseInt($msg.data("length"),10)||0);
                    }else{
                        this.remindCount =0;
                        $msg.data("pullend",true).data("length",len)
                    }
                    $msg.updateUI();

                },
                sendList:function(){
                    $module.find(".J-tab-giftMsg").updateUI();
                },
                viewList:function(){
                    $module.find(".J-tab-viewer").updateUI();
                },
                conList:function(){
                    $module.find(".J-tab-contribution").updateUI();
                }
            }

        });

        initResize();

        if(block){
            return
        }
		//获取主播信息
		bindGoReCharge();

        //获取主播信息
        getStreamerInfo(leftVue,videoVue)

        //min版时的状态，根据视频大小调整容器
        initMINIpc();

        initScrollBar();

        //初始化举报按钮
        initReport();

        //初始化分享
        initShare();




        triggerCanplay2(videoVue);

        initGiftList(leftVue);

        initGiftHover(leftVue);

		//初始化主播列表，当前主播下播时显示
		initStreamerList(videoVue);

		if( (getRoomId()*1) ){

            //初始化选项卡
            initTab(rightVue, videoVue,rightVue);

			initIm(videoVue, rightVue, leftVue);

            initViewers(1, rightVue, videoVue,true)

		}else{
			videoVue.canplay = "noStream";
		}

        //初始化关注按钮
        initFollow(leftVue,videoVue,rightVue);

        /*消息中礼物*/
        initMsgGiftList();

        bindPageUnload(videoVue,rightVue);

        if(videoVue.canplay == "noStream"){
            $module.find(".J-contribution-tabTitle").trigger("click")
        }


    });

})();