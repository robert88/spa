$(function(){
	$(".selectwarp").each(function(){

		var $that = $(this),
			$value = $that.find( ".selectdata" ),
			$text  = $that.find( ".selecttext" );

		//屏蔽输入
		$text.prop("readonly",true);
		//建立隐藏数据和显示数据联系
		$value.data("shownode",$text);

		//点击按钮和显示文字框都可以选择
		$that.delegate( '.selectbtn,.selecttext', 'click', function( e ) {
			//隐藏其他控件
			$(".selectwarp").not( $that ).css("z-index",0).find(".option").hide();
			//显示当前控件
			$that.css("z-index",1000).find(".option").show();

		}).delegate( '.option p', 'click', function( e ) {

			var $this = $(this);

			$that.css("z-index",0).find(".option").hide().find("p").removeClass("active");

			$this.addClass("active");

			//当前触发一次change事件
			$text.val( $this.html() ).focus().change();

			$value.val( $.trim( $this.attr("value") ) ).change();

		});
	}).click(function(e){
		e.stopPropagation();
		e.preventDefault();
		return false;
	});

	//点击全部隐藏
	$( document ).click(function(e){
		$(".selectwarp").css("z-index",0).find(".option").hide();
	});
})
    