;(function(){ var innerModule = {};var innerRequire = function(index){ return innerModule[index]; }; /*../../pc/public/js/module/md5.js*/(function(){function r(e){return b(f(y(e),e.length*n))}function i(e){return w(f(y(e),e.length*n))}function s(e,t){return b(v(e,t))}function o(e,t){return w(v(e,t))}function u(e){return b(f(y(e),e.length*n))}function a(){return r("abc")=="900150983cd24fb0d6963f7d28e17f72"}function f(e,t){e[t>>5]|=128<<t%32,e[(t+64>>>9<<4)+14]=t;var n=1732584193,r=-271733879,i=-1732584194,s=271733878;for(var o=0;o<e.length;o+=16){var u=n,a=r,f=i,l=s;n=c(n,r,i,s,e[o+0],7,-680876936),s=c(s,n,r,i,e[o+1],12,-389564586),i=c(i,s,n,r,e[o+2],17,606105819),r=c(r,i,s,n,e[o+3],22,-1044525330),n=c(n,r,i,s,e[o+4],7,-176418897),s=c(s,n,r,i,e[o+5],12,1200080426),i=c(i,s,n,r,e[o+6],17,-1473231341),r=c(r,i,s,n,e[o+7],22,-45705983),n=c(n,r,i,s,e[o+8],7,1770035416),s=c(s,n,r,i,e[o+9],12,-1958414417),i=c(i,s,n,r,e[o+10],17,-42063),r=c(r,i,s,n,e[o+11],22,-1990404162),n=c(n,r,i,s,e[o+12],7,1804603682),s=c(s,n,r,i,e[o+13],12,-40341101),i=c(i,s,n,r,e[o+14],17,-1502002290),r=c(r,i,s,n,e[o+15],22,1236535329),n=h(n,r,i,s,e[o+1],5,-165796510),s=h(s,n,r,i,e[o+6],9,-1069501632),i=h(i,s,n,r,e[o+11],14,643717713),r=h(r,i,s,n,e[o+0],20,-373897302),n=h(n,r,i,s,e[o+5],5,-701558691),s=h(s,n,r,i,e[o+10],9,38016083),i=h(i,s,n,r,e[o+15],14,-660478335),r=h(r,i,s,n,e[o+4],20,-405537848),n=h(n,r,i,s,e[o+9],5,568446438),s=h(s,n,r,i,e[o+14],9,-1019803690),i=h(i,s,n,r,e[o+3],14,-187363961),r=h(r,i,s,n,e[o+8],20,1163531501),n=h(n,r,i,s,e[o+13],5,-1444681467),s=h(s,n,r,i,e[o+2],9,-51403784),i=h(i,s,n,r,e[o+7],14,1735328473),r=h(r,i,s,n,e[o+12],20,-1926607734),n=p(n,r,i,s,e[o+5],4,-378558),s=p(s,n,r,i,e[o+8],11,-2022574463),i=p(i,s,n,r,e[o+11],16,1839030562),r=p(r,i,s,n,e[o+14],23,-35309556),n=p(n,r,i,s,e[o+1],4,-1530992060),s=p(s,n,r,i,e[o+4],11,1272893353),i=p(i,s,n,r,e[o+7],16,-155497632),r=p(r,i,s,n,e[o+10],23,-1094730640),n=p(n,r,i,s,e[o+13],4,681279174),s=p(s,n,r,i,e[o+0],11,-358537222),i=p(i,s,n,r,e[o+3],16,-722521979),r=p(r,i,s,n,e[o+6],23,76029189),n=p(n,r,i,s,e[o+9],4,-640364487),s=p(s,n,r,i,e[o+12],11,-421815835),i=p(i,s,n,r,e[o+15],16,530742520),r=p(r,i,s,n,e[o+2],23,-995338651),n=d(n,r,i,s,e[o+0],6,-198630844),s=d(s,n,r,i,e[o+7],10,1126891415),i=d(i,s,n,r,e[o+14],15,-1416354905),r=d(r,i,s,n,e[o+5],21,-57434055),n=d(n,r,i,s,e[o+12],6,1700485571),s=d(s,n,r,i,e[o+3],10,-1894986606),i=d(i,s,n,r,e[o+10],15,-1051523),r=d(r,i,s,n,e[o+1],21,-2054922799),n=d(n,r,i,s,e[o+8],6,1873313359),s=d(s,n,r,i,e[o+15],10,-30611744),i=d(i,s,n,r,e[o+6],15,-1560198380),r=d(r,i,s,n,e[o+13],21,1309151649),n=d(n,r,i,s,e[o+4],6,-145523070),s=d(s,n,r,i,e[o+11],10,-1120210379),i=d(i,s,n,r,e[o+2],15,718787259),r=d(r,i,s,n,e[o+9],21,-343485551),n=m(n,u),r=m(r,a),i=m(i,f),s=m(s,l)}return Array(n,r,i,s)}function l(e,t,n,r,i,s){return m(g(m(m(t,e),m(r,s)),i),n)}function c(e,t,n,r,i,s,o){return l(t&n|~t&r,e,t,i,s,o)}function h(e,t,n,r,i,s,o){return l(t&r|n&~r,e,t,i,s,o)}function p(e,t,n,r,i,s,o){return l(t^n^r,e,t,i,s,o)}function d(e,t,n,r,i,s,o){return l(n^(t|~r),e,t,i,s,o)}function v(e,t){var r=y(e);r.length>16&&(r=f(r,e.length*n));var i=Array(16),s=Array(16);for(var o=0;o<16;o++)i[o]=r[o]^909522486,s[o]=r[o]^1549556828;var u=f(i.concat(y(t)),512+t.length*n);return f(s.concat(u),640)}function m(e,t){var n=(e&65535)+(t&65535),r=(e>>16)+(t>>16)+(n>>16);return r<<16|n&65535}function g(e,t){return e<<t|e>>>32-t}function y(e){var t=Array(),r=(1<<n)-1;for(var i=0;i<e.length*n;i+=n)t[i>>5]|=(e.charCodeAt(i/n)&r)<<i%32;return t}function b(t){var n=e?"0123456789ABCDEF":"0123456789abcdef",r="";for(var i=0;i<t.length*4;i++)r+=n.charAt(t[i>>2]>>i%4*8+4&15)+n.charAt(t[i>>2]>>i%4*8&15);return r}function w(e){var n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",r="";for(var i=0;i<e.length*4;i+=3){var s=(e[i>>2]>>8*(i%4)&255)<<16|(e[i+1>>2]>>8*((i+1)%4)&255)<<8|e[i+2>>2]>>8*((i+2)%4)&255;for(var o=0;o<4;o++)i*8+o*6>e.length*32?r+=t:r+=n.charAt(s>>6*(3-o)&63)}return r}var e=0,t="",n=8;innerModule[1]=r})();/*../../pc/public/js/lib/upload/handlers.js*/(function(){(function(){function r(e){var t=e.getStats();t.successful_uploads--,e.setStats(t)}function i(n){try{if(n.getStats().files_queued>0){var r=n.getQueueFile(0);n.post_params={},n.post_params.time=(new Date).getTime(),n.post_params.flag=t("jv4GFGCP"+n.post_params.time),r.type==".png"?(n.post_params.fileExt="png",n.startResizedUpload(r.id,e.settings.maxWidth,e.settings.maxHeight,SWFUpload.RESIZE_ENCODING.PNG,70,!1)):(n.post_params.fileExt="jpg",n.startResizedUpload(r.id,e.settings.maxWidth,e.settings.maxHeight,SWFUpload.RESIZE_ENCODING.JPEG,70,!1))}}catch(i){alert(i)}}var e={},t=innerRequire(1),n=0;e.settings={customFileList:"",upload_url:"http://tools.livestar.com/upload",flash_url:"/pc/public/js/lib/upload/swfupload.swf",file_post_name:"Filedata",use_query_string:!1,requeue_on_error:!1,http_success:[201,202],assume_success_timeout:0,file_types:"*.jpg;*.gif;*.png;*.icon;*.jpeg;",file_types_description:"Web Image Files",file_size_limit:"5120",file_upload_limit:1,file_queue_limit:1,prevent_swf_caching:!1,preserve_relative_urls:!1,button_placeholder_id:"btnAddFile",button_action:SWFUpload.BUTTON_ACTION.SELECT_FILES,button_disabled:!1,button_cursor:SWFUpload.CURSOR.HAND,button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,maxWidth:500,maxHeight:500,debug:!1},e.settings.swfupload_preload_handler=function(){if(!this.support.loading||!this.support.imageResize)return alert("You need Flash Player 10 to upload resized images."),!1},e.settings.swfupload_load_failed_handler=function(e){alert("上传组件加载失败:"+e)},e.settings.file_queue_error_handler=function(t,n,r){var i="";switch(n){case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:i="最多只能添加"+e.settings.file_queue_limit+"个文件";break;case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:i="Can not find file!";break;case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:i="File over size 5M";break;case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:i="Support PNG or JPG file only!";break;default:i=r}alert(i)},e.settings.upload_error_handler=function(e,t,n){typeof this.settings.error=="function"?this.settings.error.call(this,e,t,n):alert("upload_error_handler("+e+":"+t+")"),r(this)},e.settings.upload_progress_handler=function(e,t){var n=(t/e.size*100).format("###.#")+"%";typeof this.settings.progress=="function"?this.settings.progress.call(this,n,e,t):console.log("上传中:"+n,"uploading")},e.settings.upload_success_handler=function(e,t){~t.indexOf("系统出错")?this.settings.upload_error_handler.call(this,"SYSERROR",t):(t=t.toURI(),t=="-1"?this.settings.upload_error_handler.call(this,"WIDTHLIMIT","宽度小于5PX！"):t=="-2"?this.settings.upload_error_handler.call(this,"IOERROR","图片保存出错！"):typeof this.settings.success=="function"?this.settings.success.call(this,e,t):console.log("上传成功:",e,t))},e.settings.upload_complete_handler=function(t){try{this.getStats()&&this.getStats().files_queued>0&&(t.type==".png"?this.startResizedUpload(t.id,e.settings.maxWidth,e.settings.maxHeight,SWFUpload.RESIZE_ENCODING.PNG,70,!1):this.startResizedUpload(t.id,e.settings.maxWidth,e.settings.maxHeight,SWFUpload.RESIZE_ENCODING.JPEG,70,!1))}catch(n){alert(n)}},e.settings.file_queued_handler=function(e){typeof this.settings.ready=="function"&&this.settings.ready.call(this,e),i(this)},window.initSWFUpload=function(t){var r=$.extend(!0,{},e.settings,t),i=new SWFUpload(r,"sub"+n++);$.extend(!0,i.settings,t)}})()})()})();