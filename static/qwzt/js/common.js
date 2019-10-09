/**
 * 
 * @authors Your Name (hechuanhua)
 * @date    2014-11-11 15:32:46
 * @version $Id$
 */
try{
    try {
        if(window.$!=undefined) {
            $(document).ajaxSend(function (event, xhr, options) {
                dqdp_csrf_token_fun(event, xhr, options);
            });
            $(function () {
                $(document).ajaxSend(function (event, xhr, options) {
                    dqdp_csrf_token_fun(event, xhr, options);
                });
            })
        }
    }catch(err){
        $(document).on('ajaxSend', function(e, xhr, options){
            dqdp_csrf_token_fun(e,xhr,options);
        })
        $(function(){
            $(document).on('ajaxSend', function(e, xhr, options){
                dqdp_csrf_token_fun(e,xhr,options);
            })
        })
    }
}catch(err){
    alert(err);
}


function dqdp_csrf_token_fun(event,xhr,options){
    var tmp = true;
    //请求的url
    var dataUrl = options.url;
    var datas;
    if("POST" == options.type) {
        //如果post请求data数据不为空
        if(null != options.data && typeof options.data == 'string') {
            var dataStr = options.data;
            datas = dataStr.split("&");
            $.each(datas, function (index) {
                var keyvalue = datas[index].split("=");
                if (keyvalue[0] == "dqdp_csrf_token") {
                    tmp = false;
                }
            });
            if(dataUrl.indexOf("dqdp_csrf_token")!=-1){
                tmp = false;
            }
        }
        else{
            if(dataUrl.indexOf("dqdp_csrf_token")!=-1){
                tmp = false;
            }
        }
    }
    //如果是get请求
    else{
        if(dataUrl.indexOf("dqdp_csrf_token")!=-1){
            tmp = false;
        }
    }
    if (tmp) {
        //当然这里还要判断url是不是有？了
        var url = options.url;
        if(dataUrl.indexOf("?")!=-1){
            options.url = options.url + "&dqdp_csrf_token=" + dqdp_csrf_token;
        }
        else{
            options.url = options.url + "?dqdp_csrf_token=" + dqdp_csrf_token;
        }
    }
}

$(function(){
       $('#gongzhonghao').mouseover(function(){
            $(this).children('.qr_tooldiv').show();
            $(this).children('.qt_tooldiv').show();
       })
       $('#gongzhonghao_wrap').mouseleave(function(event) {
           $(this).find('.qr_tooldiv').hide();
            $(this).find('.qt_tooldiv').hide();
       });
       $('#gongzhonghao2').mouseover(function(){
            $(this).children('.qr_tooldiv2').show();        
       })
       $('#gongzhonghao2_wrap').mouseleave(function(event) {
           $(this).find('.qr_tooldiv2').hide();        
       });
       // 隐藏百度统计图标
       $('body').children('a').hide();
	     //更多菜单按钮
	   $('#i').mouseover(function(){
		   $(this).children('.more_nav').show();
		   }).mouseout(function(){
			   $(this).children('.more_nav').hide();
			   })
       //导航栏添加active
       var url=document.location.href;
       if(url=='http://wbg.do1.com.cn/'){
        $('#nav').find('li').eq(0).addClass('active')
       }
       for(var i=1;i<$('#nav li').length-1;i++){
          if(url.indexOf($('#nav').find('a').eq(i).attr('href'))>-1){
            $('#nav').find('li').eq(i).addClass('active')
          }
       }


      

})
