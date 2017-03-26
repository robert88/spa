
	/*进入房间*/
	function onRoomError(opts,msg,type) {
        if(typeof opts.roomError == "function"){
            opts.roomError(msg,type);
        }
		console.log.apply(null, arguments);
	}
	/*进入聊天室*/
	function onChatError(opts,msg,type) {
        if(typeof opts.chatError == "function"){
            opts.chatError(msg,type);
        }
		console.log.apply(null, arguments);

	}

var settings={
	appKey:null,//appkey
	token:null,//token
	account:null,//游客id
	imRoomId:null,//roomId
    roomULeave:null,//主播离开消息
	ready:null,//im已经处于监听状态
	chatMsg:null,//普通聊天消息
	barrageMsg:null,//弹幕聊天消息
	someOneIn:null,//用户进入
	robotIn:null,//机器人进入
	someOneOut:null,//用户退出
	robotOut:null,//机器人退出
	giftMsg:null,//礼物消息
	likeMsg:null,//点赞消息
	sysMsg:null//系统消息
	
}

	function onChatroomMsgs(msg,opts) {
		if($.type(msg) == "array") {
			for(var i = 0; i < msg.length; i++) {
				handlerMsg(msg[i],opts);
			}
		}else{
			handlerMsg(msg[i],opts);
		}
	}
	
	function handlerMsg(msg,opts) {
		//过滤垃圾信息
		if(!msg.custom) {
			return
		}
		var customMsg = msg.custom;
		if(typeof customMsg == "string") {
			try {
				customMsg = JSON.parse(customMsg);
			} catch(e) {
				console.error("parse customMsg error!");
			}
		}
		//主播退出
		var isroomLever = (customMsg.imMessageType * 1 == 3) && (customMsg.streamerId == customMsg.userTagInfo.uid);
		if(isroomLever || customMsg.endLiveInfo) {
			opts.roomULeave(customMsg);
		}
		console.log("收到消息",msg,customMsg);
		//消息类型 1 表示 普通文本消息 2表示进入房间 3 离开房间 4 发送礼物 5 点赞  6 机器人进入房间  7 机器人离开房间 8 弹幕 9关注主播 
		switch(customMsg.imMessageType * 1) {
			case 1: //聊天消息
				opts.chatMsg(customMsg, customMsg.text||msg.text);
				break;
			case 8: //弹幕
				opts.barrageMsg(customMsg, customMsg.text||msg.text,msg.time);
				break;
			case 2: //(个体进入房间）
				opts.someOneIn(customMsg, customMsg.text||msg.text);
				break;
			case 6: //（机器人进入房间）
				opts.robotIn(customMsg, customMsg.text||msg.text);
				break;
			case 3: //（个体退出房间）
				opts.someOneOut(customMsg, customMsg.text||msg.text);
				break;
			case 7: //（机器人离开房间）
				opts.robotOut(customMsg, customMsg.text||msg.text);
				break;
			case 4: //自定义（送礼物）
				opts.giftMsg(customMsg, customMsg.text||msg.text,msg.time);
				break;
			case 5: //点赞
				opts.likeMsg(customMsg, customMsg.text||msg.text);
				break;
			case 9: //关注主播
				opts.followMsg(customMsg, customMsg.text||msg.text);
				break;
			case 10: //推到后台
				opts.backStream(customMsg, customMsg.text||msg.text);
				break;
			case 11: //回到前台
				opts.streaming(customMsg, customMsg.text||msg.text);
				break;
			case 12: //用户直播间分享消息
			case 14: //用户点赞特定数量消息
			default:
				opts.sysMsg(customMsg, customMsg.text||msg.text);
		}
	}


	function gerRoomAddr(){
		var opts = window.PAGE.imInfo.opts;
		var nim = window.PAGE.imInfo.nim;

		nim.getChatroomAddress({
			chatroomId: opts.imRoomId,
			done: function(err, addrInfo) {
				if(err) {
					$.tips("getChatroomAddress error"+err);
					return;
				}
				window.PAGE.imInfo.addrInfo = addrInfo;
				roomInstance()
			}
		});
	}

	function getIMInstance(){
		var opts = window.PAGE.imInfo.opts
		return NIM.getInstance({
				appKey: opts.appKey,
				token: opts.token,
				account: opts.account,
				onconnect: function(){gerRoomAddr(opts);},//成功实例化IM
				onwillreconnect: function(e){onRoomError.call(this,opts,e,"onwillreconnect")},
				ondisconnect: function(e){onRoomError.call(this,opts,e,"ondisconnect")},
				onerror: function(e){onRoomError.call(this,opts,e,"onerror")},
				onroamingmsgs: function(e){onRoomError.call(this,opts,e,"onroamingmsgs")},
				onofflinemsgs: function(e){onRoomError.call(this,opts,e,"onofflinemsgs")},
				onmsg: function(e){onRoomError.call(this,opts,e,"onmsg")}
		});
	}

	/*实例化room*/
	function roomInstance(){

		var opts = window.PAGE.imInfo.opts;
		var nim = window.PAGE.imInfo.nim;
		var addrInfo = window.PAGE.imInfo.addrInfo;

		window.PAGE.imInfo.chatroom = Chatroom.getInstance({
			appKey: opts.appKey,
			token: opts.token,
			account: opts.account,
			chatroomId: opts.imRoomId,
			chatroomAddresses: addrInfo["address"],
			onconnect: function(roomInfo){window.PAGE.imInfo.addrInfo=roomInfo;opts.ready(window.PAGE.imInfo.chatroom, nim, roomInfo, addrInfo)},//成功连接
			onerror: function(e){onChatError.call(this,opts,e,"onerror")},
			onwillreconnect: function(e){onChatError.call(this,opts,e,"onwillreconnect")},
			ondisconnect: function(e){onChatError.call(this,opts,e,"ondisconnect")},
			onmsgs: function(msg){onChatroomMsgs(msg,opts)}//消息过来
		});
	}

	/*重新实例化room*/
	function changeRoomOption(){

		var opts = window.PAGE.imInfo.opts;
		var chatRoom = window.PAGE.imInfo.chatroom;
		var nim = window.PAGE.imInfo.nim;
		var addrInfo = window.PAGE.imInfo.addrInfo;

		chatRoom.getInstance({
			appKey: opts.appKey,
			token: opts.token,
			account: opts.account,
			chatroomId: opts.imRoomId,
			onconnect: function(roomInfo){window.PAGE.imInfo.addrInfo=roomInfo;opts.ready(chatRoom,nim,roomInfo,addrInfo)},//成功连接
			onerror: function(e){onChatError.call(this,opts,e,"onerror")},
			onwillreconnect: function(e){onChatError.call(this,opts,e,"onwillreconnect")},
			ondisconnect: function(e){onChatError.call(this,opts,e,"ondisconnect")},
			onmsgs: function(msg){onChatroomMsgs(msg,opts)}//消息过来
		})
	}

	function  NIMInstance(opts){
		//第二次进入时如果在切换页面的时候为销毁，就主动销毁一次
		if( window.PAGE.imInfo ){
			if(window.PAGE.imInfo.nim ){
				window.PAGE.imInfo.nim.disconnect();
			}
		}else{
			window.PAGE.imInfo = {};
		}

		window.PAGE.imInfo.opts = opts;
		window.PAGE.imInfo.nim = getIMInstance();
	}
	//页面退出的时候主动销毁一次
	window.PAGE.destroy.push(function(){
		if(window.PAGE.imInfo&&window.PAGE.imInfo.nim){
			window.PAGE.imInfo.nim.disconnect();
			window.PAGE.imInfo.nim = null;
		}
		return true;
	});

	
	if($.im){
		console.log("$.im is init!");
	}
	window.PAGE.destroy.push(function(){
		$.im = null;
		//销毁
		return true;
	});

	$.im = function(opts){
		var imOpts = $.extend({},settings,opts);
			if(!opts.appKey){
				$.tips("Lose app key!");
				return
			}
		console.log("------------key",opts.appKey,"-----token",opts.token,"------account",opts.account,"------imRoomId",opts.imRoomId)
			if(!opts.token){
				$.tips("Lose token!");
				return;
			}
			if(!opts.account) {
                $.tips("Lose account!");
                return;
            }
			if(!opts.imRoomId){
				$.tips("Lose imRoomId!");
				return;
			}
			/*云信初始化*/
			NIMInstance(imOpts);

			return handlerMsg
	}
