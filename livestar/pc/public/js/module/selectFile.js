;(function(){
	function selectByDropOrInput( e ,callBack){

		var files,
			reader,
			f;

		if( e.dataTransfer ){
			files = e.dataTransfer.files;
			//input
		}else{
			files=e.target.files;
		}
console.log("files",files)
		for (var i=0; f=files[i]; i++) {
			console.log(URL.createObjectURL(f));
			reader = new FileReader();
			//readAsBinaryString
			//readAsText()
			//readAsArrayBuffer

			console.log("name:",f.name,"type:",f.type,"size:",f.size,"lastmodify",f.lastModifiedDate,"webkitRelativePath",f.webkitRelativePath);

			reader.onload = (function( theFile ) {
				return function( e ) {
					var fileData = e.srcElement.result;
					if( typeof callBack === "function" ){
						callBack(fileData,theFile)
					}
				}
			})( f );
			reader.readAsDataURL( f );
		}

	}
	function handleFileSelect( e ,callBack) {
		e.stopPropagation();
		e.preventDefault();
		if( document.domain ){
			selectByDropOrInput( e ,callBack);
		}
	}

	function handleDragOver( e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	}


	function SelectFile($target, callBack){
		initEvent($target,callBack);
	}

	function initEvent($target,callBack){
		if($target[0].tagName === "INPUT"){
			$target.on( "change", function(e){
				console.log("dfjdskfj")
				handleFileSelect(e,callBack)
			});
		}else{
			$target.on( "drop", function(e){
				handleFileSelect(e,callBack)
			});
			$target.on("dragover", handleDragOver,callBack);
		}
	}
	if($.fn.selectFile){
		console.log("$.fn.selectFile has init!");
		return;
	}
	$.fn.selectFile = function(callBack){


		return this.each(function(){
			var $this = $(this);

			if($.fn.fileReader){
				$this.fileReader({callback:function(){
					SelectFile( $this, callBack );
				},load:callBack} );
			}else{
				SelectFile( $this, callBack );
			}

		});
	}
})()
