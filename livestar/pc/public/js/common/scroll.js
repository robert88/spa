	/*扩展滚动条*/
	;(function(){
		var defaultSetting = {
			content:"",
			bar:"",
			barContain:"",
			overflow:"auto",
			speed:60,
			fixHeight:true
		}
		function CustomScrollbar(opt){
			
			checkStuct.call(this,opt);
			
			initBar(opt);
			
			checkBarStatus(opt);
			
			listnerShowBar(opt);
			
			initScrollEvent(opt);
			
		}
		
		function initScrollEvent(opt){
			var timer;
			opt.$contain.on("mousewheel",function(evt){
				
				var wheelDelta = evt.wheelDelta || evt.detail;

				opt.$contain.data("scrollbardown",true);
				PAGE.clearTimeout(timer);
				timer = PAGE.setTimeout(function(){
					opt.$contain.data("scrollbardown",false);
				},3000);

				//jquery bug； zepto没这个问题
				if(!wheelDelta&&evt.originalEvent){
					evt = evt.originalEvent;
					wheelDelta = evt.wheelDelta || evt.detail;
				}
				//没有滚动条
				if(opt.cHeight>=opt.bHeight){
					return ;
				}
				
				var returnFlag = false;
				
				if(wheelDelta == -120 || wheelDelta == 3){
					
					returnFlag = scrollContentUp(opt);
					
				}else if (wheelDelta == 120 || wheelDelta == -3){
					
					returnFlag = scrollContentDown(opt)
				} 
				
				//滚到底部跳出阻止默认行为
//				if(returnFlag){
					return false;
//				}
				
			})
			
			var downFlag =false;
			var perY = 0;
			//如果是临时页面
			if(opt.$contain.parents("#pageDsync").length){
				opt.$wrap = opt.$contain.parents("#pageDsync")
			}else{
				opt.$wrap = $(document)
			}
			
			/*点击滚动事件
			 不能用click时间，mouseup之后会触发click
			 * */
			opt.$scrollBarContain.on("mousedown",function(e){
				if(e.target==this){
					var clickTop = e.layerY/(opt.cHeight||1)*100;
					var scrollBarTop = parseFloat(opt.$scrollBar.css("top"),10)||0;
					//console.log("e.layerY",e.layerY,clickTop,scrollBarTop)
					if(clickTop-scrollBarTop>0){
						scrollContentUp(opt);
					}else{
						scrollContentDown(opt);
					}
					
				}
			})
			var heightRadio;
			opt.$scrollBar.on("mousedown",function(e){
				opt.$contain.data("scrollbardown",true);
				downFlag = true;
				perY = e.pageY;
				//console.log("mousedown");
				$.disableSelection();
				//滚动的相对比例
				heightRadio = opt.$scrollBody.height()/opt.$contain.height();

				return false;
			});

			opt.$wrap.on("mousemove.scroll",function(e){
				
				if(downFlag){
					//console.log("mousemove")
					var y = e.pageY-perY;
					//console.log(y)
					//鼠标向下

					if(y>0){
						scrollContentUp(opt,-y*heightRadio);
					}else{
						scrollContentDown(opt,-y*heightRadio);
						
					}
					perY = e.pageY;
					
				}
			}).on("mouseup.scroll",function(){
				
				if(downFlag){
//					console.log("mouseup",downFlag)
					opt.$contain.data("scrollbardown",false);
					downFlag = false;
					$.enableSelection();
				}
				
				
			})
		}
		
		/*setTop:表示设置top*/
		function scrollContentDown(opt,setTop){
			
			setTop = (typeof setTop=="undefined")?opt.speed:setTop;
			
			var bMarginTop = parseFloat(opt.$scrollBody.css("margin-top"),10)||0;
			
			var top = Math.min(bMarginTop+setTop,0);
			
			//表示已经滚到顶了
			if(top==0&&bMarginTop==0){
				return;
			}
			console.log("down",top)
			initBarTop(opt,top)
			
			opt.$scrollBody.css("margin-top",top);
			
			return true;
		}
		
		/*setTop:表示设置top*/
		function scrollContentUp(opt,setTop){
			//setTop==0时也是正确的
			setTop = (typeof setTop=="undefined")?(-opt.speed):setTop;
			
			var bMarginTop = parseFloat(opt.$scrollBody.css("margin-top"),10)||0;
			
			var min = (opt.cHeight - opt.bHeight)||0;
			
			var top = Math.max( bMarginTop+setTop, min );

			if(top==min && bMarginTop==min ){
				//拉到顶部触发end函数
				if(typeof opt.pullEnd=="function"){
					opt.pullEnd();
				}
				
				return;
			}
			
			initBarTop(opt,top);
			
			opt.$scrollBody.css("margin-top",top);
			
			return true;
		}

		
		
		function showBar(opt){
			opt.$scrollBarContain.show();
			opt.$contain.addClass("J-scroller-hasScroll")
		}
		
		function hideBar(opt){
			opt.$scrollBarContain.hide();
			opt.$contain.removeClass("J-scroller-hasScroll");
		}
		
		function checkBarStatus(opt){
			if(opt.overflow=="auto"){
				var cHeight = opt.$contain.height();
				var bHeight = opt.$scrollBody.height()
				if(cHeight<bHeight){
					showBar(opt);
					return true;
				}else{
					hideBar(opt);
					return false
				}
			}else if(opt.overflow=="scroll"){
				showBar(opt);
				return true
			}else{
				hideBar(opt);
				return false
			}
		}
		
		function listnerShowBar(opt){
			opt.$contain.on("updateUI",function(){
				var isShow = checkBarStatus(opt);
				initBar(opt);
				if(opt.$contain.data("pullend")&& !opt.$contain.data("scrollbardown")&&isShow){
					pullEnd(opt)
				}
			})
		}

		function pullEnd(opt){

			var top = (opt.cHeight - opt.bHeight)||0;

			initBarTop(opt,top);

			opt.$scrollBody.css("margin-top",top);
		}

		function checkStuct(opt){
			opt.$contain = $(this);
			opt.$scrollBody = opt.$contain.find(opt.content);
			opt.$scrollBar = opt.$contain.find(opt.bar);
			opt.$scrollBarContain = opt.$contain.find(opt.barContain);
		}
		
		//高度比例一致
		function initBar(opt){
			
			var cHeight = opt.cHeight = opt.$contain.height()||0;
			var bHeight = opt.bHeight = opt.$scrollBody.height()||0;
		
			var heightRadio = cHeight/bHeight*100;
			
			heightRadio = Math.min(heightRadio,100);//最高100
			heightRadio = Math.max(heightRadio,10);
			
			opt.$scrollBar.height(heightRadio+"%");
			
			var bMarginTop = parseFloat(opt.$scrollBody.css("margin-top"),10)||0;
			
			initBarTop(opt,bMarginTop);
			
			//滚动时改变margin会改变height
			if(opt.overflow=="auto" && opt.$contain.css("max-height") ){
				
				if(cHeight<bHeight){
					opt.$contain.css("height",cHeight);
				}else if(opt.fixHeight){
					opt.$contain.css("height","auto");
				}
				
			}
			
		}
		
		//marginTop为百分比
		function initBarTop(opt,bMarginTop){
			var barTop = -bMarginTop/(opt.bHeight||1)*100;
			//console.log("initBarTop",barTop,bMarginTop)
			barTop = Math.min(barTop,90);
			barTop = Math.max(barTop,0);
			opt.$scrollBar.css("top",barTop+"%");
		}
		
		if(!$.fn.customScrollbar){
			$.fn.customScrollbar=function(opt){
				return this.each(function(){
					var cusOpt = $.extend({},defaultSetting,opt);
					CustomScrollbar.call(this,cusOpt);
				});
			}
		}
	})()

