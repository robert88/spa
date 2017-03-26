// swfupload上传组件API: http://www.cnblogs.com/youring2/archive/2012/07/13/2590010.html

;(function(){
	var upload = {};

	var md5 =  require("/pc/public/js/module/md5.js");
	
	var g_swfCount = 0;

	upload.settings = {

		//自定义区域
		customFileList:"",

		//服务器请求路径
		upload_url : "http://tools.livestar.com/upload",

		//flash路径
		flash_url : "/pc/public/js/lib/upload/swfupload.swf",

		//提交到服务器数据名称
		file_post_name : "Filedata",

		//该属性可选值为true和false，设置post_params是否以GET方式发送。如果为false，那么则以POST形式发送。
		use_query_string : false,

		//如果设置为true，当文件对象发生uploadError时（除开fileQueue错误和FILE_CANCELLED错误），
		// 该文件对象会被重新插入到文件上传队列的前端，而不是被丢弃。如果需要，重新入队的文件可以被再次上传。
		// 如果要从上传队列中删除该文件对象，那么必须使用cancelUpload方法。
		requeue_on_error : false,

		// 允许设置在HTTP状态码为非200的其他值时也触发uploadSuccess事件
		http_success : [201, 202],

		//将等待多少秒来检测服务器响应，超时将强制触发上传成功 （uploadSuccess）事件。
		assume_success_timeout : 0,

		//设置文件选择对话框的文件类型过滤规则
		file_types : "*.jpg;*.gif;*.png;*.icon;*.jpeg;",

		//设置文件选择对话框中显示给用户的文件描述
		file_types_description: "Web Image Files",

		//设置文件选择对话框的文件大小过滤规则，该属性可接收一个带单位的数值，
		//可用的单位有B,KB,MB,GB。如果忽略了单位，那么默认使用KB。特殊值0表示文件大小无限制
		file_size_limit : "5120",

		//设置SWFUpload实例允许上传的最多文件数量
		file_upload_limit : 1,

		//设置文件上传队列中等待文件的最大数量限制。
		file_queue_limit : 1,

		//该布尔值设置是否在Flash URL后添加一个随机值，用来防止浏览器缓存了该SWF影片
		prevent_swf_caching : false,

		//如果设置对象的属性preserve_relative_urls为false，SWFUpload将会把相对路径转化成绝对路径
		preserve_relative_urls : false,

		//该必要参数指定了swfupload.swf将要替换的页面内的DOM元素的ID值。
		// 当对应的DOM元素被替换为SWF元素时，SWF的容器会被添加一个名称
		button_placeholder_id : "btnAddFile",
		button_action : SWFUpload.BUTTON_ACTION.SELECT_FILES,
		button_disabled : false,
		button_cursor : SWFUpload.CURSOR.HAND,
		button_window_mode : SWFUpload.WINDOW_MODE.TRANSPARENT,

		//图片最大分辨率
		maxWidth: 500,
		maxHeight: 500,

		//flash 中debug
		debug: false
	}

	//事件名：swfUploadPreload
	//Flash Movie加载完毕之前的这段时间内触发的事件.
	//此事件的处理函数如果返回false，将停止加载swfupload。通常用在处理浏览器不支持某重要特性参数的情况

	upload.settings.swfupload_preload_handler = function(){

		if (!this.support.loading || !this.support.imageResize) {//this ==>SWFUpload
			alert("You need Flash Player 10 to upload resized images.");
			return false;
		}
	}

	//事件名：swfUploadLoadFailed
	//当页面不能正常加载flash影片的时候。通常是因为没有安装Flash Player或者它的版本低于 9.0.28

	upload.settings.swfupload_load_failed_handler = function( msg ){
		alert("上传组件加载失败:" + msg);
	}

	//事件名;fileQueueError
	//如果选择的文件加入到上传队列中失败，那么针对每个出错的文件都会触发一次该事件

	upload.settings.file_queue_error_handler = function(file, errorCode, message) {
		var errMsg = '';
		switch (errorCode) {
			case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
				errMsg = '最多只能添加' + upload.settings.file_queue_limit + '个文件';
				break;
			case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
				errMsg = 'Can not find file!';
				break;
			case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
				errMsg = 'File over size 5M';
				break;
			case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
				errMsg = 'Support PNG or JPG file only!';
				break;
			default:
				errMsg = message;
		}
		alert(errMsg);
	}

	//事件名;uploadError
	//只要上传被终止或者没有成功完成，那么uploadError事件都将被触发

	upload.settings.upload_error_handler = function(errorCode, message, file) {
		if(typeof this.settings.error == "function"){
			this.settings.error.call(this,errorCode, message, file);
		}else{
			alert("upload_error_handler("+errorCode+":"+message+")");
		}
		delStatsFile(this);
	}

	//事件名;uploadProgress
	//由flash控件定时触发，提供三个参数分别访问上传文件对象、已上传的字节数，总共的字节数。
	//因此可以在这个事件中来定时更新页面中的UI元素，以达到及时显示上传进度的效果.

	upload.settings.upload_progress_handler = function(file, bytesLoaded) {

		var percent = ((bytesLoaded / file.size) * 100).format("###.#")+"%" ;

		if(typeof this.settings.progress == "function"){
			this.settings.progress.call(this,percent,file, bytesLoaded);
		}else{
			console.log('上传中:' + percent, "uploading")
		}
	}

	//当文件上传的处理已经完成（这里的完成只是指向目标处理程序发送完了Files信息，只管发，不管是否成功接收）
	// ，并且服务端返回了200的HTTP状态时触发uploadSuccess事件.erver data是服务端处理程序返回的数据。

	upload.settings.upload_success_handler = function(file, serverData) {

		//session 拦截
		if(~serverData.indexOf("系统出错")){
			this.settings.upload_error_handler.call(this,"SYSERROR",serverData);
		}else{
			serverData = serverData.toURI();

			if(serverData == "-1"){
				this.settings.upload_error_handler.call(this,"WIDTHLIMIT","宽度小于5PX！");
			}else if (serverData == "-2"){
				this.settings.upload_error_handler.call(this,"IOERROR","图片保存出错！");
			}else{
				if(typeof this.settings.success == "function"){
					this.settings.success.call(this,file, serverData);
				}else{
					console.log('上传成功:',file, serverData)
				}
			}
		}
	}

	//当上传队列中的一个文件完成了一个上传周期，
	// 无论是成功(uoloadSuccess触发)还是失败(uploadError触发)，uploadComplete事件都会被触发

	upload.settings.upload_complete_handler = function(file) {
		try {
			if (this.getStats()&&this.getStats().files_queued > 0) {
				if(file.type==".png"){
					this.startResizedUpload(file.id, upload.settings.maxWidth, upload.settings.maxHeight, SWFUpload.RESIZE_ENCODING.PNG, 70, false);
				}else{
					this.startResizedUpload(file.id, upload.settings.maxWidth, upload.settings.maxHeight, SWFUpload.RESIZE_ENCODING.JPEG, 70, false);
				}
			}
		}
		catch (ex) {
			alert(ex);
		}
	}


	//事件名;fileQueued
	//当选择好文件，文件选择对话框关闭消失时，如果选择的文件成功加入待上传队列，
	// 那么针对每个成功加入的文件都会触发一次该事件（N个文件成功加入队列，就触发N次此事件

	upload.settings.file_queued_handler = function(file){

		if(typeof this.settings.ready == "function"){
			this.settings.ready.call(this,file);
		}

		//添加就自动上传
		SubFile(this);

	}

	//监听删除文件。实际服务器图片还是存在。数据库不会记录该图片

	function delStatsFile(swfObj){
		var stats = swfObj.getStats();
		stats.successful_uploads--;
		swfObj.setStats(stats);
	}

	//监听触发提交文件

	function SubFile( swfObj ){

			try {
				if (swfObj.getStats().files_queued > 0) {
					var file = swfObj.getQueueFile(0);
					swfObj.post_params = {};
					swfObj.post_params.time = new Date().getTime();
					swfObj.post_params.flag = md5("jv4GFGCP"+swfObj.post_params.time);

					//接收file_id参数来上传文件. SWFUpload尝试调整文件长宽等设置（如果是flash支持的图片格式） .如果图片格式不被支持，会引发一个上传错误
					//width和height参数用来设定图片最大宽和高。但调整过程中会保持图片宽高比。
					//encoding的值必须是是存在SWFUpload.RESIZE_ENCODING中的常量.
					//quality 只能用于调节JPEG格式图像的品质。接收范围是0-100。如果在这个范围外，会强制成0或100.
					if(file.type==".png"){
						swfObj.post_params.fileExt = "png";
						swfObj.startResizedUpload(file.id, upload.settings.maxWidth, upload.settings.maxHeight, SWFUpload.RESIZE_ENCODING.PNG, 70, false);
					}else{
						swfObj.post_params.fileExt = "jpg";
						swfObj.startResizedUpload(file.id, upload.settings.maxWidth, upload.settings.maxHeight, SWFUpload.RESIZE_ENCODING.JPEG, 70, false);
					}

				}
			}catch (ex) {
				alert(ex);
			}

	}

	window.initSWFUpload = function( option ){


		var opt = $.extend(true,{},upload.settings,option);

		//sub防止实例化后id冲突
		var swf = new SWFUpload(opt, "sub"+(g_swfCount++));

		$.extend(true,swf.settings,option);
	}
})();












