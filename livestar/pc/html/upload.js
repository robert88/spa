$(function(){
    require("/pc/public/js/module/selectFile.js");
    require("/pc/public/js/module/cutImage.js");

    var $module = $("#J-upload-wrap");
    var $dragArea = $module.find(".J-select-area");
    var $dragBtn = $module.find(".J-btn-upload");
    // var $cutBtn = $module.find(".J-cut-image-btn"); //目前没有按钮
    var $delBtn = $module.find(".J-btn-delete");
    var $fileIpt = $module.find(".J-input-file")
    var $fileIptLabel = $module.find(".J-input-file").parent()
    var $filePathIpt = $module.find(".J-upload-file-path")
    var $reduce = $module.find(".J-reduce")
    var $zoom = $module.find(".J-zoom")
    var $tip = $module.find(".J-upload-tip")
    var activeSize = $dragArea.data("width")||336;
    var cutSize = $dragArea.data("height")||336;
    var backgroundRadio = activeSize / cutSize;

    var mousedown, downX, downY, positionX, positionY, maxWidth, maxHeight, zoomWidth, zoomHeight, selectImg;

    /*缩小*/
    function reduceImage(){
        var curw = maxWidth - 6;
        var curh = maxHeight - 6 * maxHeight / maxWidth;
        //                      maxWidth
        if(curw < (activeSize+1) || curh < (cutSize+1)) {
            return false;
        }
        maxHeight = curh;
        maxWidth = curw;
        $dragArea.css({
            backgroundSize: "{0}px {1}px".tpl(maxWidth, maxHeight)
        });
    }

    /*放大*/
    function zoomImage(){
        var curw = maxWidth + 6;
        var curh = maxHeight + 6 * maxHeight / maxWidth;
        maxHeight = curh;
        maxWidth = curw
        $dragArea.css({
            backgroundSize: "{0}px {1}px".tpl(maxWidth, maxHeight)
        });
    }
    /*剪切图片->返回base64编码*/
    function cutImage() {
        var top = -$dragArea.css("background-position-y").toFloat() / backgroundRadio;
        var left = -$dragArea.css("background-position-x").toFloat() / backgroundRadio;
        console.log("cut", top, left)
        if(selectImg.load) {
            var src = $.cutImage({
                    img: selectImg,
                    width: cutSize,
                    height: cutSize,
                    top: top,
                    left: left,
                    type: selectImg.type,
                    //缩小图片，等于放大比例
                    zoom: zoomHeight / maxHeight
                })
                //          $.dialog("<img src='{0}'>".tpl(src))
            return src;
        } else {
            $.tips("Image file is loadding!")
        }

        return false;
    }

    /*删除按钮->删除图片重新选图*/
    $delBtn.click(function() {
        $dragBtn.show();
        $fileIpt.show();
        $delBtn.hide();
        $fileIptLabel.show();
        $dragArea.css({
            backgroundImage: ""
        })
        selectImg = null;
        //trigger change可以重复选择图片
        $fileIpt.val("").trigger("change");
    });

    /*input flie->选择图片，获取图片信息*/
    $fileIpt.selectFile(function(src, file) {

        if(file.type!=="image/png"&&file.type!=="image/jpeg"){
            $.tips("Can not support file type!");
            //trigger change可以重复选择图片
            $fileIpt.val("").trigger("change");
            return ;
        }
        if(file.size/1024/1024>5){
            $.tips($.i18n("i18n.upload.limit"));
            //trigger change可以重复选择图片
            $fileIpt.val("").trigger("change");
            console.log(file.size)
            return ;
        }
        selectImg = new Image();
//        var width, height;
        selectImg.onload = function() {
            zoomWidth = maxWidth = backgroundRadio * selectImg.width;
            zoomHeight = maxHeight = backgroundRadio * selectImg.height;
            selectImg.type = file.type;
            $dragBtn.hide();
            $fileIpt.hide();
            $delBtn.show();
            $fileIptLabel.show();
            $dragArea.css({
                backgroundImage: "url({0})".tpl(src),
                backgroundPosition: "0px 0px",
                backgroundSize: "{0}px {1}px".tpl(maxWidth, maxHeight),
                backgroundRepeat: "no-repeat"
            });
            $delBtn.show();
            $zoom.show();
            $delBtn.show();
            $filePathIpt.data("upload","ready")
            //$fileIpt.trigger("change");

            selectImg.load = true;
        }
        selectImg.src = orgSrc = src;

    });

    /*点击切图*/
    //  $cutBtn.click(function(e) {
    //      cutImage();
    //  })
    //
    /*滚轮放大和缩小*/
    var hover = false;
    var leftmin = 0
    var leftmax = 0;
    var topmin = 0
    var topmax = 0;
    $dragArea.on("mousewheel", function(evt) {

        var wheelDelta = evt.wheelDelta || evt.detail;

        //jquery bug； zepto没这个问题
        if(!wheelDelta && evt.originalEvent) {
            evt = evt.originalEvent;
            wheelDelta = evt.wheelDelta || evt.detail;
        }
        //没有滚动条
        if(wheelDelta == -120 || wheelDelta == 3) {
            reduceImage();

        } else if(wheelDelta == 120 || wheelDelta == -3) {
            zoomImage();
        }

        return false;
    }).on("mouseenter", function(e) {
        if($filePathIpt.data("upload") == "ready"){
            $reduce.show();
            $tip.show();
        $zoom.show();}
        leftmin = $dragArea.offset().left;
        leftmax = $dragArea.offset().left+$dragArea.width();
        topmin = $dragArea.offset().top;
        topmax = $dragArea.offset().top+$dragArea.height();
    }).on("mousedown", function(e) {
        $dragArea.parents(".J-tip-contain").removeClass("input-box-error");
        if(!selectImg) {
            console.log("return")
            return;
        }
        positionX = $dragArea.css("background-position-x").toFloat();
        positionY = $dragArea.css("background-position-y").toFloat();
        $dragArea.css("cursor", "move")
        downX = e.pageX;
        downY = e.pageY;
        mousedown = true;
        $.disableSelection();
        console.log("down", mousedown, downX, downY, positionX, positionY)
    }).on("mousemove", function(e) {
        if(mousedown) {
            var dx = e.pageX - downX + positionX;
            var dy = e.pageY - downY + positionY;
            console.log("move", dx, activeSize - maxWidth)
            dx = Math.max(dx, activeSize - maxWidth);

            dx = Math.min(dx, 0);
            dy = Math.max(dy, activeSize - maxHeight);
            dy = Math.min(dy, 0);
            console.log(dx, dy)
            $dragArea.css("background-position", (dx) + "px " + (dy) + "px")
        }

    }).on("mouseleave", function(e) {
        if(mousedown){
            mousedown = false;
            $dragArea.css("cursor", "inherit")
            $.enableSelection();
        }
        /*hover算法*/
        if(e.pageX<=leftmin|| e.pageX>=leftmax||e.pageY<=topmin|| e.pageY>=topmax){
            $reduce.hide();
                $zoom.hide();
            $tip.hide();
        }

    }).on("mouseup", function() {
        if(mousedown){
            mousedown = false;
            $dragArea.css("cursor", "inherit")
            $.enableSelection();
        }
    })
  
    
    /*点击缩小按钮-》缩小图片*/
    $module.find(".J-reduce").click(function(){
        reduceImage();
        return false;
    })
    
    /*点击放大按钮--》放大图片*/
    $module.find(".J-zoom").click(function(){
        zoomImage();
        return false;
    })

    $module.find(".J-upload-submit").click(function(){

        if($filePathIpt.data("upload") == "ready") {

            var uploadURL;
            if(window.PAGE.DEBUG){
                uploadURL = '/pc/public/data/preview.json'
            }else{
                uploadURL = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("preview");
            }

            var imgData = cutImage();

            if(!imgData) {
                $.tips( $.i18n("i18n.upload.no.image") );
            }

            LS.ajaxBtn($(this),{
                url: uploadURL,
                data: {
                    fileData : imgData,
                    fileType : selectImg.type
                },
                success: function(data) {
                    $filePathIpt.data("upload","uploaded");
                    //下一步也会有锁
                    if(!data.url) {
                        $.tips( $.i18n("i18n.upload.fail") );
                        return;
                    }
                    //提供一个外部触发的工具
                    $filePathIpt.val(data.url).trigger("change");

                }
            });

        }

    })

})
