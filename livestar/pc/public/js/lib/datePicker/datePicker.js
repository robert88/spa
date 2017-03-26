
//日期选择控件
;(function($){

        var template = [
            '<div class="datePicker">',
                '<table class="tableMini">',
                    '<caption>',
                        '<a class="lastYear" href="#"><<</a>',
                        '<a class="lastMonth" href="#"><</a>',
                        '<span class="showMonth" data="4">四月</span>',
                        '<span class="showYear">2015</span>',
                        '<a class="nextMonth" href="#">></a>',
                        '<a class="nextYear" href="#">>></a>',
                    '</caption>',
                    '<thead>',
                        '<tr>',
                            '<th class="t-danger">日</th>',
                            '<th>一</th>',
                            '<th>二</th>',
                            '<th>三</th>',
                            '<th>四</th>',
                            '<th>五</th>',
                            '<th class="t-danger">六</th>',
                        '</tr>',
                    '</thead>',
                    '<tbody></tbody>',
                '</table>',
            '</div>'
        ].join("");

        var settings = {
            $picker:null,
            $input:null,
            $showDate:null,
            inputTrager:false,
            $lastYear:null,
            $lastMonth:null,
            $nextYear:null,
            $nextMonth:null,
            $showYear:null,
            $showMonth:null,
            $target:null
        }

        var getMonthDay = function(year, month){
            return new Date(year, parseInt(month) + 1, 0).getDate();
        }

        //格式化日期
        function formatDate(date, spa){

            var monthArray = ["一月", "二月",  "三月",  "四月",  "五月",  "六月",  "七月", "八月", "九月", "十月", "十一月", "十二月"];
            var weeks = ["日", "一", "二", "三", "四", "五", "六"];
            spa = spa || "-";
			var tempDate = date;

            if(typeof date == "string" || typeof date == "number" ){
				tempDate = new Date(date);
            }

			//ie8不支持"-"分割号
			if(isNaN(tempDate)&& (typeof date == "string" )){
				date = new Date(date.replace("-","/"));
			}else{
				date = tempDate;
			}

          	//console.log(date, typeof date)
            if(isNaN(date)|| !date || (date == "Invalid Date") ){
                date = new Date();
            }

            var d = date.getDate(),
                m = date.getMonth(),
                y = date.getFullYear(),
                week = date.getDay();

            var fm,fd;

            var chinaMonth =  monthArray[m];

            if( d<10){
                fd = "0" + d;
            }else{
                fd = d;
            }
 

            if( m < 9 ){
                fm = "0" + (m+1);
            }else{
                fm = m;
            }

            return {
                toString : function(){
                    return y + spa + fm + spa + fd;
                },
                year : y,
                month : m,
                chinaMonth:chinaMonth,
                day : d,
                date : date,
                week:week,
                chinaWeek:weeks[week]
            }
        }

        //设置参数
        function initOptions(opts, $target){

            opts = $.extend({}, settings, opts);

            if($target[0].nodeName.toLowerCase() == "input"){
                opts.inputTrager = true;
                opts.$input = $target;
                opts.$picker = $(template).appendTo( $target.parent() );
            }else{
                opts.$picker = $target;
            }
            opts.$target = $target;
            opts.$lastYear = opts.$picker.find(".lastYear");
            opts.$lastMonth = opts.$picker.find(".lastMonth");
            opts.$nextYear = opts.$picker.find(".nextYear");
            opts.$nextMonth = opts.$picker.find(".nextMonth");
            opts.$showYear = opts.$picker.find(".showYear");
            opts.$showMonth = opts.$picker.find(".showMonth");
            return opts;
        }

        //设置picker样式和显示
        function initContent(opts){

			var $picker = opts.$picker,
				$input = opts.$input,
				$inputParent = $input.parent(),
				parentLeft = $inputParent.offset().left,
				parentTop = $inputParent.offset().top,
				parentPosition = $inputParent.css( "position"),
				inputLeft = $input.offset().left,
				inputTop = $input.offset().top,
				inputWidth = $input.width(),
				inputHeight = $input.height();

            //input点击出来的picker picker 是插入在input的父类中
            if(opts.inputTrager){

				if( ( parentPosition != "absolute" ) && ( parentPosition != "relative" ) ){
					$inputParent.css("position","relative");
				}

                $picker.css({
                    position:"absolute",
                    top : ( ( inputTop - parentTop + inputHeight) + 10 ) + 'px',
                    left :( ( inputLeft - parentLeft ) ) + 'px'
                }).hide();

            //默认显示出来的picker
            }else{
                opts.$picker.show();
            }
        }

        //初始化picker
        function initDateTable(opts, date){

            var max = opts.$target.data( "max" )||Infinity;//如果没有设置表示无穷大
            var min = opts.$target.data( "min" )||-1;

            //当前选中的日期
            var setDate = formatDate( opts.$target.data("date") );

            //指定当月的1号
            date.setDate(1)
            var formate = formatDate(date);

            //设置年月
            opts.$showYear.html(formate.year);
            opts.$showMonth.html(formate.chinaMonth);
            opts.$picker.data("year",formate.year);
            opts.$picker.data("month",formate.month);

            var week = formate.week;
            var dayNumber = getMonthDay(formate.year, formate.month);

            var html = "<tr>";

            //设置没有的日期
            for(var i = 0; i < week; i++){
                html += '<td class="muted"></td>';
            }

            for(var j=1; j<dayNumber+1; j++,i++){

				date.setDate(j);
				formate = formatDate(date);

				//设置当前时间
                var classes = "";
                if((formate.year == setDate.year )&& (formate.month == setDate.month )&&(formate.day == setDate.day ) ){
                    classes += ' hover';
                }

                //换行
                if(i==7){
                    i=0;
                    html += "</tr><tr>";
                }

                //设置日期范围

                    if(date.getTime() > max || date.getTime() < min){
                        classes += ' muted';
                    }


                //每个日期都存储时间点
                html += '<td class="' + classes + '" data-date="'+date.getTime()+'">' + j + '</td>';
                
            }
            html +="</tr>";
            opts.$picker.find('tbody').html(html);

        }

        //设置picker 时间
        function bindSetDate(opts){
  
                 opts.$picker.delegate('tbody td:not(:empty)', 'click', function(event) {
                  
                    var $this = $(this);

                    if( $this.hasClass( "muted" ) ){
                        return;
                    }

                    var dateFmt = formatDate( $(this).data( "date" ) );

					 //存储当前时间
					 opts.$target.data( "date", $(this).data( "date" ) );

                    //设置选择状态
                    opts.$picker.find("tbody td").removeClass( "hover" );
                    $this.addClass( "hover" );

                    opts.$input.val(dateFmt.toString());

                    if(opts.$showDate){
                        opts.$showDate.html(dateFmt.toString());
                    }
                    
                    if(opts.inputTrager){
                        opts.$picker.show();
                    }

            });
        }

        //点击body隐藏picker
        function bindBodyclickHidePicker(opts){
            $("html body").on('click', function(e){
                  if(e.target!==opts.$target[0]){
                    opts.$picker.hide();
                  }
            })
        }

        //点击input显示picker
        function bindInputShowPicker(opts){
            opts.$input.click(function(e){
                opts.$picker.show();
            });
        }



        function bindclickShowPicker(opts){

            if(opts.inputTrager){
                //点击body隐藏picker
                bindBodyclickHidePicker(opts);
                //点击input显示picker
                bindInputShowPicker(opts);
            }
        }



        //阻止事件冒泡和传播
        function stopEvent(e){

            e.stopPropagation();
            e.preventDefault();
            return false;
        }

        //设置年份
       function setYear(opts, num){

            var year = opts.$picker.data("year");

            year += num;

            opts.$picker.data("year", year);
        }

        //设置月份
        function setMonth(opts, num){

            var month =  opts.$picker.data("month");
            var year = opts.$picker.data("year");

            month += num;
            if(month > 11){
                month = 0;
                year += 1;
            }else if(month < 0){
                month = 11;
                year -= 1;
            }

            opts.$picker.data("month", month);
            opts.$picker.data("year", year);
        }

        //根据年月获取第一天时间
        function getDateByYearOrMonth(opts){

            var month =  opts.$picker.data("month");

            var year = opts.$picker.data("year");

            return formatDate( year + "/" + (month+1) + "/" + 1 );

        }

        //绑定改变年
        function bindClickSetYear(opts){

            //下翻
            opts.$lastYear.click(function(e){

                stopEvent(e);

                setYear( opts, -1);

                var dateFmt = getDateByYearOrMonth(opts);

                initDateTable(opts, dateFmt.date);

            })

            //上翻
            opts.$nextYear.click(function(e){

                stopEvent(e);

                setYear( opts, 1);

                var dateFmt = getDateByYearOrMonth(opts);

                initDateTable(opts, dateFmt.date);
                
            })
        }

        //绑定改变月
        function bindClickSetMonth(opts){

            //下翻
            opts.$lastMonth.click(function(e){

                stopEvent(e);

                setMonth( opts, -1);

                var dateFmt = getDateByYearOrMonth(opts);

                initDateTable(opts, dateFmt.date);

                return false;
            })

            //上翻
            opts.$nextMonth.click(function(e){

                stopEvent(e);

                setMonth( opts, 1 );

                var dateFmt = getDateByYearOrMonth(opts);

                initDateTable(opts, dateFmt.date);

                return false;
            })
        };

        datePicker = function(opts, $target){
            // 初始化容器
            //console.log("start opts",opts)
            var opts = initOptions(opts, $target);
            //console.log("get opts",opts)

            // 初始化日期
            //console.log("start date",$target.data("date")-(new Date()).getTime()/60/60 )
			var initDate;
			if( !$target.data("date") && opts.inputTrager){
				initDate = formatDate( $target.val() );
			}else{
				initDate = formatDate( $target.data("date") );
			}
            //console.log("get date",initDate )

			if(opts.$showDate){
				opts.$showDate.html(initDate.toString());
			}

			if(opts.$input && opts.$input.data("init-input")!==false ){
				opts.$input.val(initDate.toString());
			}

            //初始化当前时间
            initDateTable(opts, initDate.date);

            //显示或者隐藏picker
            initContent(opts);

            //绑定点击弹出时间控件
            bindclickShowPicker(opts);

            //绑定点击设置时间
            bindSetDate(opts);

            //绑定点击设置月份
            bindClickSetMonth(opts);

            //绑定点击设置年份
            bindClickSetYear(opts);
    }

    //jquery 对外接口
   $.fn.extend({
        datePicker: function(opts) {
            return this.each(function(){
                datePicker(opts, $(this));
            })
        }
    })
})(jQuery);
