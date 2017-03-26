$(function(){
    var $module = $("#countryVue");
    var letterList = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

    /*vue二维数组必须要提前初始化，后面的修改不起作用*/
    var countryVue = new Vue({
        el:"#countryVue",
        data:{
            countryList:parseMap(),
            matchList:[],
            keyword:"",
            letterList:letterList
        },
        filters:{
            lightKeyword:function(val){
                var regStr = this.keyword.replace(/(\.|\*|\?|\+|\\|\(|\)|\{|\}|\[|\]|\^|\$|\/)/g,"\\$1");

                //有括号才可以匹配$1
                var reg = new RegExp("("+regStr+")","gi");

                return val.replace(reg,'<span class="f-primary">$1</span>');
            }
        },
        watch:{
            keyword:function(keyword){
                this.matchList = [];
                if(!keyword){
                    return;
                }
                for(var i=0;i<this.countryList.length;i++){
                   
                        //countryList是断层的二维数组 遍历的时候要加上track-by="$index"
                    if( this.countryList[i] ){
                        for(var j=0;j<this.countryList[i].length;j++){
                            var temp = this.countryList[i][j];
                            if( temp.name && ~temp.name.toUpperCase().indexOf(keyword.toUpperCase()) ){
                                    this.matchList.push(temp);
                            }
                        }

                    }
                }
            }
        }
    });

    /*解析list*/
    function parseMap(){
            var arr = []

            var map = window.PAGE.data.countryMobileMap;
            for(var key in map){

                    var fristLetter = key.toUpperCase();

                    var index = letterList.indexOf(fristLetter);

                    //只要是字母开头，不能匹配特殊字符
                    if( ~index ){
                        //第一次已经赋值空数组
                        arr[index] = map[key];
                    }

            }
            return arr;
    }


    /*选择code*/
    $module.on("click",".J-item",function(){
        var $this = $(this);
        if( $this.data("code").trim() ){
            window.PAGE.data.countryCode = $this.data("code").trim();
             window.PAGE.data.countryName = $this.data("name").trim();
            window.PAGE.data.countrySName = $this.data("sname").trim();
            window.PAGE.loading();
            window.location.hash = "#/mb/cash_out/verify_phone";
        }
    })

})