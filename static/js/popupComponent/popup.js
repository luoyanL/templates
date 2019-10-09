;(function($){
$.alertMsg=function(params){
var defaultOpt={'type':'warning','speed':'fast','time':1000,'content':'请输入消息内容'}
var options=$.extend({},defaultOpt,params)
var html="<div id='alertWindow'>";
if(options.type==="warning"){
    html+="<i class='iconfont icon-warning-shape' style='color:#ecbb49;'></i>";
}
else if(options.type==="danger"){
    html+="<i class='iconfont icon-danger-shape' style='color:red;'></i>";
}
else if(options.type==="success"){
    html+="<i class='iconfont icon-success-shape' style='color:green;'></i>";
}
else if(options.type==="info"){
    html+="<i class='iconfont icon-info-shape' style='color:#3eb9f6;'></i>";
}
html+="<span>"+options.content+"</span></div>";
$("body").append(html);
$('#alertWindow').css({'display':'inline-block','font-size':'14px','padding': '15px 30px','box-shadow':'1px 1px 1px #eae7e7,1px -1px 1px #eae7e7,-1px 1px 1px #eae7e7,-1px -1px 1px #eae7e7','position':'absolute','left':'50%','transform':'translateX(-50%)','background':'#fff'});
$("#alertWindow i").css({'font-size':'22px','vertical-align': 'middle'});
$("#alertWindow span").css({'padding-left':'10px','display':'inline-block','vertical-align':'middle'})

$("#alertWindow").animate({top:'50px'},options.speed);
var timer=setTimeout(function(){
    $("#alertWindow").remove();
},options.time)
}
})(jQuery);