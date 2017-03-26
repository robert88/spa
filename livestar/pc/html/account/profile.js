
$(function(){

    /*日期选择-年*/
    function initYear(year,$yearOption) {

        var str = [];

        for(var i = year; i > year - 150; i--) {
            str.push('<li data-value="{0}"><a>{0}</a></li>'.tpl(i));
        }

        $yearOption.html("<li data-value=''><a>&nbsp;</a></li>" + str.join(""));

    }
    /*日期选择-月*/
    function initMonth($monthOption) {

        var str = [];

        for(var i = 1; i < 13; i++) {
            str.push('<li data-value="{0}"><a>{0}</a></li>'.tpl(i.toString().fill("00")));
        }

        $monthOption.html("<li data-value=''><a>&nbsp;</a></li>" + str.join(""));

    }
    /*日期选择-日*/
    function initDate(year, month, d,$dateOption) {
        var str = [];
        month = parseInt(month, 10);
        var max = new Date(year, month, 0).getDate() + 1;

        for(var i = 1; i < max; i++) {
            str.push('<li data-value="{0}"><a>{0}</a></li>'.tpl(i.toString().fill("00")));
        }
        $dateOption.html("<li data-value=''><a>&nbsp;</a></li>" + str.join(""));

        if(d) {
            var checkDate = parseInt(d, 10) || 1;
            return checkDate < max ? d : "";
        }

    }
    /*日期选择-交互*/
    function bindDateChange(  $module ,checkChange ) {

        //必须在13岁以上
        var curYear = new Date().getFullYear();
        var curMonth = new Date().getMonth()+1;
        var curDay = new Date().getDate();
        var $yearSelect = $module.find(".J-year");
        var $monthSelect = $module.find(".J-month");
        var $dateSelect = $module.find(".J-date");
        var $yearIpt = $yearSelect.find("input");
        var $monthIpt = $monthSelect.find("input");
        var $dateIpt = $dateSelect.find("input");
        var $dataBirthday =  $module.find(".J-birthdayIpt");

        $yearIpt.data("maxvalue",curYear-13);
        initYear(curYear, $yearSelect.find(".J-option"));
        initMonth($monthSelect.find(".J-option"));
        initDate(curYear, 1, null, $dateSelect.find(".J-option"));

        function showDateErr(msg){
            $yearSelect.parents(".J-tip-contain").addClass("input-box-error").find(".J-tip-msg").html($.i18n(msg))
        }
        function hideDateErr(){
            $yearSelect.parents(".J-tip-contain").removeClass("input-box-error")
        }

        $module.find(".J-select-birthday").on("change", ".J-date-item", function () {
            var $this = $(this);
            var year = $yearIpt.val().trim();
            var month = $monthIpt.val().trim();
            var d = $dateIpt.val().trim();

            var dYear = curYear-year;

            $monthIpt.data("maxvalue",12);
            $dateIpt.data("maxvalue",31);

            if(dYear<13){
                showDateErr("i18n.profile.birthdayError");
            }else if(dYear==13&&month>curMonth){
                showDateErr("i18n.profile.birthdayError");
                $monthIpt.data("maxvalue",curMonth);
            }else if(dYear==13&&month==curMonth&&d>curDay){
                showDateErr("i18n.profile.birthdayError");
                $dateIpt.data("maxvalue",curDay);
            }else{
                hideDateErr()
            }


            if (!$this.hasClass("select-date")) {
                d = initDate(year, month, d, $dateSelect.find(".J-option"));
                $dateIpt.val(d);
            }

            if (year && month && d) {
                $dataBirthday.val([year.toString().fill("0000"), month.toString().fill("00"), d.toString().fill("00")].join("/"));
                checkChange();
            } else {
                $dataBirthday.val("");
                checkChange();
            }

        }).on("click", ".J-select-item", function () {
            var $this = $(this);
            var $parent = $this.parent();
            var $optionWarp = $this.find(".J-option");
            $module.find(".J-option").hide();
            $optionWarp.show();
        }).on("click", "li", function () {

            var $this = $(this);
            var $parent = $this.parent().parent()
            $parent.find("li").removeClass("current");
            $this.addClass("current");
            var value = $this.data("value") || "";
            $parent.find("input").val(value).trigger("change");
            $module.find(".J-option").hide();
            return false;
        })

        function setBirthday(year,month,date){
            if(year!=null){
                $yearIpt.val(year).trigger("change")
            }
            if(month!=null){
                $monthIpt.val(month).trigger("change")
            }
            if(date!=null){
                $dateIpt.val(date)
            }
            if (year && month && date) {
                $dataBirthday.val([year.toString().fill("0000"), month.toString().fill("00"), date.toString().fill("00")].join("/"));
            }
        }
        return setBirthday;
    }

    /*点击其他地方，隐藏显示*/
    function hideSelectOption(e,$module){
        if( $(e.target).hasClass("J-select-item") || $(e.target).parents(".J-select-item").length ){
            return
        }
        $module.find(".J-option").hide();
    }

    function bindDOCEvent($module){

        function bindDoc(e){
          hideSelectOption(e,$module)
        }

        function unbindDOC(){
            $(document).off("click",bindDoc);
            return true;
        }

        $(document).on("click",bindDoc);

        window.PAGE.destroy.push(unbindDOC)
    }

    function triggerUpload($module,profileVue){
        var $btn =$module.find(".J-upload");
        $btn.click(function(){
            $.dialog("url:/pc/html/upload.html",{
            close:".close",
            maskClose:false,
            ready:function($dialog){
                $dialog.off("change",".J-upload-file-path").on("change",".J-upload-file-path",function(){
                    var $this = $(this);
                    var url;
                    if(window.PAGE.DEBUG){
                        url = '/pc/public/data/search.json';
                    }else{
                        if(window.PAGE.checkLogin()) {
                            return;
                        }
                        url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("editUser");
                    }

                    var userimg = $this.val();

                    if(!userimg){
                        return;
                    }

                    LS.ajax({
                        url:url,
                        data:{
                            userimg:userimg
                        },
                        success:function(){
                            profileVue.uInfo.userimg = userimg;
                            $.dialog.close($dialog);
                        }
                    })
                });
            }});
        });

    }

    function initSubmitVaild(formID, checkSuccess) {
        LS.validForm({
            form: formID,
            validSuccess: function($form) {
                $form.removeClass("input-box-error");
                checkSuccess($form);
            },
            validError: function($target, msg) {
                var $parent = $target.parents(".J-tip-contain");
                $parent.addClass("input-box-error");
                $parent.find(".J-tip-msg").html(msg);
            },
            successList: function($target) {
                var $parent = $target.parents(".J-tip-contain");
                $parent.addClass("input-box-success");
            },
            focusCallback: function($target) {
                var $parent = $target.parents(".J-tip-contain");
                $parent.removeClass("input-box-error").removeClass("input-box-success");
            }
        });

    }


    /*登陆，注册请求服务公共模块*/
    function doAjax($form, url, checkSuccess,error) {
        var loginData = $form.serialize();

        var $btn = $form.find(".J-submitBtn");

        LS.ajaxBtn($btn,{
            url: url,
            data: loginData,
            success: function(data) {
                checkSuccess(data);
            },error:error
        });
    }

    function init(){

        if(window.PAGE.checkLogin()) {
            return;
        }

        var  $module = $("#profileVue");



        var $btn = $module.find(".J-submitBtn");
        var $sex = $module.find(".J-radio-sex");

        bindDOCEvent($module);

        /*监听改变变化按钮*/
        $sex.change(function(){
            if($(this).prop("checked")){
                var val = $(this).val();
                profileVue.input.sex = val;
            }
        })
        /*监听改变变化按钮*/


        function checkChange(){
            var isChange = false
            if(profileVue.input.sex!=window.PAGE.UserInfo.sex){
                $btn.removeClass("btn-disable").addClass("btn-primary");
                isChange =true
            }
            var $dataBirthday =  $module.find(".J-birthdayIpt");
            var newDate = ($dataBirthday.val()||"").toString().toDate().format("yyMMdd");
            var oldDate = (window.PAGE.UserInfo.birthday||"").toString().toDate().format("yyMMdd");
            if(newDate!=oldDate){
                $btn.removeClass("btn-disable").addClass("btn-primary");
                isChange =true
            }
            if(profileVue.input.base_name!=window.PAGE.UserInfo.base_name){
                $btn.removeClass("btn-disable").addClass("btn-primary")
                isChange =true
            }
            if(profileVue.input.base_signature!=window.PAGE.UserInfo.base_signature){
                $btn.removeClass("btn-disable").addClass("btn-primary")
                isChange =true
            }
            if(!isChange ){
                $btn.removeClass("btn-primary").addClass("btn-disable")
            }
        }

        var setBirthday = bindDateChange( $module ,checkChange);

        var profileVue = new Vue({
            el:"#profileVue",
            data:{
                input:{
                    name:"",
                    base_name:"",
                    base_signature:"",
                    sex:1,
                    birthday:"",
                    signatureLength:32
                },
                uInfo:{}
            },
            watch:{
                "input.sex":function(val){

                    var $radioGroup = $module.find(".J-label-radio-group");

                    var $li = $radioGroup.find(".J-label-box");

                    var $checked = $radioGroup.find("input").filter(function(){
                        if( val == $(this).val() ){
                            return true;
                        }
                        return false;
                    });

                    if($checked.length==0){
                        console.error("cant find radio group!");
                    }

                    $li.removeClass("checked");

                    $checked.prop("checked",true);
                    $checked.parents(".J-label-box").addClass("checked");
                    checkChange();

                },
                "input.birthday":function(val){

                    var newDate = (val||"").toString().toDate();
                    setBirthday(newDate.getFullYear(),newDate.getMonth()+1,newDate.getDate())
                    checkChange();
                },
                "input.base_name":function(val){
                    val = val&&val.replace(/<|>/g,"");
                    profileVue.input.base_name = val
                    checkChange();
                },
                "input.base_signature":function(val){
                    val = (val==null)?"":val;
                    //文字字数限制
                    val = val&&val.replace(/<|>/g,"");
                    profileVue.input.base_signature = val;
                    if(val.length>32){
                        val = val.slice(0,32);
                        profileVue.input.base_signature = val;
                    }
                    profileVue.input.signatureLength = 32-val.length;
                    checkChange();
                }
            },
            filters: {
                getULevelClass: function(val) {
                    var level = val||"01"
                    return "i-userLevel i-userLevel{0}".tpl(level.trim().fill("00", 2));
                },
                getDefImg:function(val){
                    return val||'/pc/public/images/df.jpg';
                },
                formatNum:function(val){
                    var str = (val||"").format("###,###,###,###");
                    return str;
                }
            }
        });

        profileVue.uInfo = $.extend({},window.PAGE.UserInfo);
        profileVue.input =  $.extend({signatureLength:32},window.PAGE.UserInfo);

        triggerUpload($module,profileVue)

        $module.find(".J-signature-base-input").keyup(function(){
            var $this = $(this);
            var val = $this.val();

            if(val.length>32){
                $this.val(val.slice(0,32))
            }
        });

        /*提交校验*/
        initSubmitVaild("#profileForm", function($form){
            var url;
            if(window.PAGE.DEBUG){
                url = '/pc/public/data/search.json';
            }else{
                url = '/api/?ct=api&ac=web&platform=livestar&method={0}'.tpl("editUser");
            }

            doAjax($form, url,function(){
                $.dialog.closeAll();
                $("#profileDialog").find(".J-dialog-msg").html($.i18n("i18n.profile.savingSucceed"));
                $.dialog($("#profileDialog"),{
                    animateType:"null",
                    dialogStyle:"background-color:transparent;",
                    bodyStyle:"padding:0;",close:".close",maskClose:false,
                    ready:function($dialog){
                    },
                    closeBefore:function(){
                        window.PAGE.loginSuccess()
                        window.PAGE.reload();
                    }
                });
            },function(msg,tipType,msgType,data){
                if(data.code==312){
                    msg = "i18n.profile.signatureError"
                }else if(data.code==311){
                    msg = "i18n.profile.nicknameError01"
                }else{
                    msg = "i18n.profile.savingFail"
                }
                $("#profileDialog").find(".J-dialog-msg").html($.i18n(msg));
                $.dialog.closeAll();
                $.dialog($("#profileDialog"),{
                    animateType:"null",
                    dialogStyle:"background-color:transparent;",bodyStyle:"padding:0;",close:".close",maskClose:false,
                    ready:function($dialog){
                    }
                });
            });

        });

    }
    init();
})
