
	//设置分页的页面--
    LS.setpageFooter = function($pageFooter, totalPage, pageNo, refreshData, num_display_entries, items_per_page){

        function f(num){
            return Math.floor(num)||0;
        }
        function c(num){
            return Math.ceil(num)||0;
        }
        function p(num, defaultVal){
            defaultVal = parseInt(defaultVal, 10) || 0;
            return parseInt(num, 10)||defaultVal;
        }

        //统一格式化数字处理
        for(var i=1; i<arguments.length; i++){
            if(i!=3){
                arguments[i] = p( arguments[i], 1 );
            }
        }

        //只有一页的情况下不显示分页
        if(totalPage < 2){
            return $pageFooter.html('');
        }

        //溢出
        if(pageNo>totalPage){
            pageNo = totalPage;
        }

        //两侧个数
        var num = num_display_entries||2;

        //显示最大个数
        var maxLen = items_per_page||10;

        //长度一半
        var len = f( maxLen / 2 );

        //两侧个数一定必须小于最大个数的一半
        (num > len) && (num = len);

        //中间最左边的值
        var t2 = num + 1;

        //中间可连续的长度，可变
        var len3 = maxLen - num*2;

        //存放显示值
        var showPage = [];

        //不够分页
        if(totalPage <= maxLen){
            maxLen = totalPage;
            for(var i=0; i<maxLen; i++){
                showPage.push( i+1 );
            }
        }else{

            //左显示溢出
            if( pageNo > len ){
                showPage[num] = "...";
                len3--;
                t2 = pageNo - f(len3/2);
            }

            //右显示溢出
            if( (totalPage - pageNo) > len ){
                showPage[ maxLen-num-1 ] = "...";
            }else{
                t2 = totalPage - len3 - num + 1;
            }

            //左溢出
            if( t2 < num+1 ){
                t2 = num + 1;
            }
            //计算显示值
            for(var i=0,j=0; i<maxLen; i++){
                //过滤掉"..."
                if( !showPage[i] ){
                    if( i < num ){
                        showPage[i] =  i+1 ;
                    }else if(i < maxLen-num ){
                        //中间连续位置以pageNo为中心
                        showPage[i] = t2 + j;
                        j++;
                    }else{
                        showPage[i] = totalPage + 1 + i - maxLen ;
                    }
                }
            }
        }

        //上下索引页
        var prev = pageNo - 1;
        var next = pageNo + 1;
        prev = prev>0?prev:1;
        next =next<totalPage?next:totalPage;

        var pageHTML = [];
        //上一页已经到头了
        if(pageNo == 1){
            pageHTML.push( '<a href="' + prev + '" class="pageMove disabled" style="cursor:not-allow">Back</a>' );
        }else{
            pageHTML.push( '<a href="' + prev + '" class="pageMove">Back</a>' );
        }

        for(var i=0; i<showPage.length; i++){
            if(showPage[i]=="..."){
                pageHTML.push( '<span >' + showPage[i] + '</span>' );
            }else if(showPage[i] == pageNo){
                pageHTML.push( '<a class="current" href="' + showPage[i] + '">' + showPage[i] + '</a>' );
            }else{
                pageHTML.push( '<a href="' + showPage[i] + '">' + showPage[i] + '</a>' );
            }
        }

        //下一页已经到头了
        if(pageNo == totalPage){
            pageHTML.push( '<a href="' + next + '" class="pageMove disabled" style="cursor:not-allow">Next</a>' );
        }else{
            pageHTML.push( '<a href="' + next + '" class="pageMove">Next</a>' );
        }



        $pageFooter.html(pageHTML.join(""));

        /*分页*/
        $pageFooter.off('click','a').on( 'click','a', function (e) {


            var $this = $(this);
            if ($this.hasClass('current') || $this.hasClass('disabled')) {
                return false;
            }

            $this.html('<div class="loader"><div class="loader-inner line-scale-pulse-out"><div></div><div></div><div></div></div></div>');
            if(typeof refreshData =="function"){
                refreshData($this.attr("href"))
            }
            return false
        });

    };
