
/*开发要求路径统一*/

window.require = window.require;
window.requireModule = {};
window.module = {};

;(function(){

//    var catchMoudle = {};

//    var currentModule ="";

//    Object.defineProperty(
//        module,
//        "exports",
//        {
//            get : function(){
//                return null;
//            },
//            set : function(newValue){
//            console.log("currentModule",currentModule,newValue)
//                catchMoudle[currentModule] = newValue;
//            },
//            enumerable : true,
//            configurable : true
//        }
//    );

    var head = document.getElementsByTagName("head")[0];
    require = function(url,id){

        //if( requireModule[url] ){
        //    return requireModule[url];
        //}

        $.ajax({
            url:url,
            async: false,
            success:function(jsString){
                var script = document.createElement("script");
                //返回对象必须是module.exports
                jsString = jsString.replace(/module\.exports/g,"csModule[moduleId]")
                script.innerHTML = ";(function(csModule,moduleId,moduleParam){{3}})({0},'{1}','{2}');".tpl("requireModule",url,id,jsString);
                head.appendChild(script);
                if(!requireModule[url]){
                    requireModule[url]=1;
                }
            },
            error:function(){console.error("require error:",arguments,url)}
        });
        return requireModule[url];
    }

})()