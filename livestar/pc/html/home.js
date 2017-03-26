$(function(){
	var Base64 = require('/pc/public/js/module/base64.js');

	var md5 = require("/pc/public/js/module/md5.js");

	function getThumb(uid){

		var key = md5(uid+"image");

		if(window.PAGE.DEBUG){
			return md5(uid+"image")
		}else{
			var domain = window.location.href.split("#")[0].split("?")[0];
			var dev = "user"
			if(domain.indexOf("test")){
				dev = "user.test"
			}else if(domain.indexOf("preview")){
				dev = "user.preview"
			}
			return "http://{0}.livestar.com/?ct=image&uid={1}&key={2}&isthumb".tpl(dev,uid,key)
		}

	}

	var featureVue = new Vue({
		el: '#featureVue',
		data: {
			topFeatures:[],
			bottomFeatures:[],
			dataStatus:"init"
		},
		filters:{
			formatNum:function(val){
				var str = (val||"").format("###,###,###,###");
				return str;
			},
			getDefImg:function(val){
				return val||'/pc/public/images/df.jpg';
			},
			getHomeDef:function(val){
				return val||"pc/public/images/live_defaulteBg.jpg"
			},
			parseUrl:function(val){
				var base64 = new Base64();
				var url = encodeURIComponent(base64.encode( "uid={0}&roomid={1}".tpl(this.feature.uid,this.feature.id) ));
                return "#/pc/html/room/vertical?short={0}".tpl(url);
			},
			parseBroadcast:function(val){
				if(val&&~val.indexOf("#")){
					var arr = val.match(/#[A-Z0-9]+/ig);
						if(arr){
							for(var i=0;i<arr.length;i++){
								val = val.replace(arr[i],'<span class="ls-f-primary">{0}</span>'.tpl(arr[i]) )
							}
						}
				}

				//return val||'Share your <span class="ls-f-primary">streaming</span> with your friends!';
				return val||'';
			}
		},
		methods:{
			getThumb:function(uid){
				return getThumb(uid);
			}
		}
	})

    var Jpage, Jtotalpage;
		
	$("#featureVue").find(".pages-more").click(function(){
		findList(((Jpage*1)||1)+1);
	})
	
	/*去重*/
	function filterFirstPage(arr){
		var newArr = [];
		var idMap = {};
		for(var i=0;i<arr.length;i++){
			if(idMap[arr[i].uid]){
				continue
			}else{
				newArr.push(arr[i])
				idMap[arr[i].uid]=1
			}
		}
		return newArr
	}

	/*更新数据*/
	var featureAllList = [];

	function renderHome(){

		featureAllList = filterFirstPage(featureAllList);

		var len = featureAllList.length-3;

		/*如果存在下一页，或者是第一页*/
		if(!Jpage || Jpage==1 || (Jpage>1&&Jtotalpage!=Jpage) ){
			len = Math.floor((featureAllList.length-3)/5)*5;
		}

		//前面第一页不能超过10条
		if(!Jpage||Jpage==1){
			len = len>10?10:len;
		}

		featureVue.topFeatures = featureAllList.slice(0,3);
		featureVue.bottomFeatures = featureAllList.slice(3,len+3);

	}

	/*
	*分页请求数据
	* */
	function findList(pageNo){

		pageNo = pageNo || 1;

		var limit=15;

		//当前的已经加载过的页面不会再加载数据
		var newPage = Math.ceil(featureAllList.length / limit);

		//对于非法参数的传递不
		if( pageNo <= newPage || Jpage > Jtotalpage || featureVue.dataStatus=="loadding" ) {
			console.log("find feature list not change");
			return;
		}


        featureVue.dataStatus = "loadding";

		LS.ajax({
			url:getUrl(pageNo,limit),
			success: function(data) {

				/*堆加数据*/
				featureAllList = featureAllList.concat(data.info);

				/*当前页*/
				Jpage = data.nowpage;

				/*总共页*/
				Jtotalpage = data.totalpage;

				/*最后一页*/
				if(Jtotalpage==Jpage){
					$("#featureVue").find(".pages-more").hide();
				}

				renderHome();
				
			},
			complete: function() {
				featureVue.dataStatus = "loaded";
			}
		})
	}

	/**/

	function getUrl(pageNo,limit){
		var url;
		if(window.PAGE.DEBUG){
			url = "/pc/public/data/getRecently.json?page={0}&limit={1}".tpl(pageNo,limit);
		}else{
			url = '/api/?ct=api&ac=web&platform=livestar&method={0}&page={1}&limit={2}'.tpl("getRecently",pageNo,limit)
		}
		return url;
	}

	var loopLock = false;
	function updateAway(){

		var limit = featureAllList.length;
		//如果第一页还没拉取，或者正在拉取，或者正在更新
		if(!limit || featureVue.dataStatus=="loadding" || loopLock){
			return;
		}

		loopLock = true;

		LS.ajax({
			url:getUrl(1,limit),
			success: function(data) {
				//优先加载新数据
				if( featureVue.dataStatus=="loadding"){
					return;
				}

				featureAllList = data.info;

				renderHome();

			},
			complete: function() {
				loopLock = false;
			}
		})

	}

	findList();

	function loopUpdate(){
		updateAway();
		PAGE.setTimeout(loopUpdate,15000)
	}

	//loopUpdate();


})
