//search
(function() {

	var Base64 = require('/pc/public/js/module/base64.js');

	var md5 = require("/pc/public/js/module/md5.js");

	var $Jsearch = $("#Jsearch");
	
	var Jkeyword;

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

	var searchVue = new Vue({
		el: '#searchVue',
		data: {
			searchInfo: [],
			searchStatus: "init"
		},
		methods:{
			getThumb:function(uid){
				return getThumb(uid);
			}
		},
		filters: {
			followFormat: function(str) {
				//console.log("filter",str)
				return str.format("###,###,###,###")
			},parseUrl:function(val){
				var base64 = new Base64();
				var url = encodeURIComponent(base64.encode("uid={0}&roomid={1}".tpl(this.info.uid,this.info.id)));
				return "#/pc/html/room/vertical?short={0}".tpl(url);
			}
		},
		watch: {
			"searchInfo": function() {
				updataWatchSearch();
			}
		}
	})

	function updataWatchSearch(){
		var Jpage
		if(searchCach[Jkeyword]){
			Jpage = searchCach[Jkeyword].Jpage
		}
		if(Jpage==1){
			$Jsearch.find(".J-scroller-con").css("margin-top",0)
		}
		
		$(".J-scroller").updateUI();
	}
	
		/*自定义滚动条*/
	$Jsearch.find(".J-scroller").customScrollbar({
		content: ".J-scroller-con",
		bar: ".scroll-bar",
		barContain: ".scroll-control",
		overflow: "auto",
		pullEnd: function() {

			var Jpage,  Jtotalpage;
			if( Jkeyword) {
				if(searchCach[Jkeyword]){
					Jpage = searchCach[Jkeyword].Jpage
					Jtotalpage = searchCach[Jkeyword].Jtotalpage
					console.log("search more", Jpage, Jkeyword, Jtotalpage)
					if(Jpage<Jtotalpage){
						//向后搜索
						search(Jkeyword, Jpage+1);
					}

				}else{
					//向后搜索
					search(Jkeyword, 1);
				}
				//					console.log("search more",Jpage+1,Jkeyword)

			}
		}
	});



	//300ms的打字速度
	var keyupTimer;
	var $searchVue = $("#searchVue");
	var $searchIptWrap = $("#JsearchIptWrap");

	function hideSearchResult(){
		$searchVue.hide();
		$searchIptWrap.removeClass("ls-search-radius-top3 input-box-selected").addClass("input-box-radius")
	}
	function showSearchResult(){
		$searchVue.show();
		$searchIptWrap.removeClass("input-box-radius").addClass("ls-search-radius-top3 input-box-selected")
	}

	$("#homeSearch").keyup(function(e) {
		if(e.key=="Enter"&& searchVue.searchStatus != "loadding"){
			var href = $searchVue.find("a").filter(function(){
				return !!$(this).attr("href");
			}).attr("href")
			if(href){
				window.location.href=href;
				hideSearchResult()
			}
			return;
		}

		//		console.info("keyup")
		clearTimeout(keyupTimer);
		var $this = $(this);
		if($this.val().trim() == "") {
			hideSearchResult()
			return;
		} else {
			showSearchResult()
			updataWatchSearch();
		}

		keyupTimer = setTimeout(function() {
			search($this.val());
		}, 300);
	})

	/*显示和隐藏搜索结果*/
		.focus(function() {
			if($(this).val().trim() == "") {
				hideSearchResult()
				return;
			} else {
				showSearchResult()
				updataWatchSearch();
			}
		})
		.blur(function(e) {
			//如果隐藏了就不能及时触发点击事件
			setTimeout(function(){
				hideSearchResult()
			},200);
		});

	//缓存50个查询结果
	window.searchCach = {};
	//keyword队列
	var searchCachQueue = [];

	//每隔1小时清除一次缓存,保证可以请求服务器的数据，但又要不频繁
	function clearAllCach() {
		//		searchCach = null;
		searchCach = {};
		console.log("clear search Cach");
		setTimeout(clearAllCach, 1000 * 60 * 60);
	}
	clearAllCach();

	//缓存50个查询结果
	function clearLargeCach() {
		var keyword;
		var maxCachLength = 50;
		if(searchCachQueue.length > maxCachLength) {
			var shiftKeyword = searchCachQueue.splice(0, searchCachQueue.length - maxCachLength);
			for(var i = 0; i < shiftKeyword.length; i++) {
				keyword = shiftKeyword[i];
				delete searchCach[keyword];
				console.log("delete cach!", keyword)
			}
		}
	}
	/*
	 * 合并{1：[1,2],2:[2,3]}==>[1,2,3,4]
	 *
	 */
	function mergeObject(obj) {
		if(typeof obj !== "object") {
			return [];
		};
		var arr = [];
		for(var no in obj) {
			if($.type(obj[no]) != "array") {
				//console.error("mergeObject", no, "is not array!");
				continue;
			}
			arr = arr.concat(obj[no]);
		}
		return arr;
	}

	/*查询接口*/
	var loaddingTimer;

	function search(keyword, pageNo) {
		if(searchVue.searchStatus=="loadding"){
			console.log("search lock loadding");
			return;
		}
		console.log("enter search",keyword, pageNo)
		keyword = keyword.trim();

		//默认是第一页，保证数据是大于等于1
		pageNo = pageNo>=1?pageNo: 1;

		//当前keyword没有变，前查询的结果页数不是最新的
		var newPage
		if(searchCach[keyword]){
			newPage = Math.ceil(searchVue.searchInfo.length / searchCach[keyword].Jlimit)||0;
		}else{
			newPage =0;
		}
		
		//保证数据是大于等于1
		newPage = newPage;
		
		console.log("当前 积累的数据", newPage, Jkeyword, pageNo,searchCach[keyword]&&searchCach[keyword].Jpage);
		
		if(keyword == Jkeyword && pageNo <= newPage && (searchCach[keyword] &&pageNo > searchCach[keyword].Jtotalpage)) {
			console.log("search not change")
			return;
		}

		//当前keyword没有变，当前页是大于历史页，确认一下该页是否是最新的页

		if(searchCach[keyword] && searchCach[keyword][pageNo]) {
			//合并所有页的数据
			searchVue.searchInfo = mergeObject(searchCach[keyword]);
			console.log("search data by cach!");
			return;
		}

		/*200之类没有数据显示loadding*/
		searchVue.searchStatus = "loadding";
		var curTop = $Jsearch.find(".J-scroller-con").css("margin-top")
		curTop = parseFloat(curTop,10)||0;
		
		if(pageNo>1){
			$Jsearch.find(".J-scroller-con").css("margin-top",curTop-60)
		}
		
		//stype	string	是	1或2 默认2	搜索类型（1:主播昵称，2：主播房间）
		var stype = 1;
		if(/^\d+$/.test(keyword)) {
			stype = 2;
		}

		console.log("search data by ajax! stype：", stype, "pageno", pageNo, "keyword", keyword,"Jpage",searchCach[keyword]&&searchCach[keyword].Jpage);

		//记录请求cach
		if(searchCachQueue.indexOf(keyword) == -1) {
			searchCachQueue.push(keyword);
		}

		clearLargeCach();

		console.log("searchRoom",stype,keyword,pageNo);
		var url;
		if(window.PAGE.DEBUG){
			url ='/pc/public/data/search.json';
		}else{
			url = '/api/?ct=api&ac=web&platform=livestar&method={0}&type={1}&skwd={2}&page={3}'.tpl("searchRoom",stype,keyword,pageNo)
		}
		LS.ajax({
			url:url,
//			url: "/pc/public/data/search.json",
			success: function(data) {

				//记录cach
				searchCach[keyword] = searchCach[keyword] || {};
				searchCach[keyword][pageNo] = data.info;


				Jkeyword = keyword;
				searchCach[keyword].Jpage = pageNo;//加载更多
				searchCach[keyword].Jtotalpage = data.totalpage;
				searchCach[keyword].Jlimit = (data.limit * 1) || 1;

				//合并所有页的数据
				searchVue.searchInfo = mergeObject(searchCach[keyword]);
				
			},
			error: function() {
				searchVue.searchInfo = [];
			},
			complete: function() {
				clearTimeout(loaddingTimer);
				searchVue.searchStatus = "loaded";
				//请求不到也要记录一下
				searchCach[keyword] = searchCach[keyword] || {};
				searchCach[keyword][pageNo] = searchCach[keyword][pageNo]||[];
			}
		})
	}

	//样式文件未完全加载，就要导致重绘一次
	window.PAGE.load = function() {
		$(".J-scroller").updateUI();
	}

})()