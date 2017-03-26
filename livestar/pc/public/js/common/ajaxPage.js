;(function(){

    //全局使用方法
    window.LS = window.LS || {};

    //缓存50个查询结果,一个页面尽量只使用一次
    var searchCach = {};

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

    function clearPageAjaxCach(){
        searchCach = {};
    }

    window.PAGE.destroy.push(clearPageAjaxCach);

    LS.pageAjax = function(opt){

        //当前页
       var pageNo = Math.max(opt.pageNo||1,1);

        var url;

       var vue = opt.vue||{};

        if(opt.data&&opt.url){
            if( ~opt.url.indexOf("?") ){
                url =  opt.url+"&"+$.param(opt.data);
            }else{
                url =  opt.url+"?&"+$.param(opt.data);
            }
        }else{
           url = opt.url;
        }

        if(searchCach[url]&&searchCach[url][pageNo]&&opt.cache){
            if(typeof opt.success=="function"){
                opt.success(
                    mergeObject( searchCach[url] ),
                    searchCach[url][pageNo],
                    searchCach[url].limit,
                    searchCach[url].totalpage,
                    searchCach[url].total);
            }
            return;
        }


        vue.status = "loadding";

        LS.ajax({
            url:url,
            limitTime:1,
            success: function(ret) {

            	var data =ret.info || ret.list || ret || [];

                searchCach[url] = searchCach[url]||{};
                searchCach[url][pageNo] = data;
                searchCach[url].limit = ret.limit||20;
                searchCach[url].totalpage = ret.totalpage||ret.totalPage||1;
                searchCach[url].total = ret.total;

                if(typeof opt.success=="function"){
                    opt.success(
                        mergeObject( searchCach[url] ),
                        searchCach[url][pageNo],
                        searchCach[url].limit,
                        searchCach[url].totalpage,
                        searchCach[url].total
                    );
                }


            },
            error: opt.error,
            complete: function() {
                vue.status = "loaded";
                if(typeof opt.complete=="function"){
                    opt.complete();
                }
            }
        })
    }

})();