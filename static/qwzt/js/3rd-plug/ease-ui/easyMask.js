//EasyUI遮罩类EasyMask.js（继承自弹出层基类EasyLayer）
var easyMask = function(olayer,width,height,zindex,scolor,opacity,hs){
	width = (!width||isNaN(width))?'100%':width;
	height = (!height||isNaN(height))?'100%':height;
	this.scolor = scolor||'#000';
	this.opacity = isNaN(opacity)?30:opacity;//透明度
	easyLayer.call(this,olayer,zindex,width,height);//继承弹出层
	var count = 0;//引用计数
	this.oncountchange = null;//事件：引用计数改变
	this.getcount = function(){return count;};
	this.clearcount = function(){count = 0;if(this.oncountchange&&this.oncountchange.constructor==Function){this.oncountchange();}};
	this.addcount = function(){count++;if(this.oncountchange&&this.oncountchange.constructor==Function){this.oncountchange();}};
	this.subcount = function(){count--;if(count<0){count = 0;}if(this.oncountchange&&this.oncountchange.constructor==Function){this.oncountchange();}};
	this.init(hs);
};
easyMask.prototype = {
	init:function(hs){
		var dlayer = this.layer,xdde = document.documentElement,xdb = document.body,width = this.width,height = this.height;
		dlayer.innerHTML = '<div style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;background:'+this.scolor+';-moz-opacity:'+(this.opacity/100)+';opacity:'+(this.opacity/100)+';filter:alpha(opacity='+this.opacity+');z-index:2;border:none;">&nbsp;</div><iframe src="" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;background:#fff;-moz-opacity:0;opacity:0;filter:alpha(opacity=0);z-index:1;border:none;"></iframe>';
		dlayer.oncontextmenu = function(){return false;};//屏蔽遮罩层右键
		dlayer.onselectstart = function(){return false;};//屏蔽遮罩层选择
		dlayer.onmousedown = function(){return false;};//屏蔽遮罩层鼠标按键
		var resize = function(){//重绘遮罩大小
			if(width!='100%'||height!='100%'){return;}//如果指定大小则不重绘
			var rs = easyUI.getWindowSize();
			var iwidth = Math.max(rs.width,rs.scrollWidth);
			var iheight = Math.max(rs.height,rs.scrollHeight);
			dlayer.style.width = iwidth+'px';
			dlayer.style.height = iheight+'px';
		};
		if(document.attachEvent){window.attachEvent('onresize',resize);}else{window.addEventListener('resize',resize,false);}//窗体大小更改后重绘遮罩大小
		//重写继承自easyLayer的open方法
		var fooopold = this.open;
		this.open = function(x,y){
			this.addcount();//引用计数加1
			if(this.getcount()>1){return false;}//如果已有其他元素引用了遮罩，则不再重新开启遮罩
			if(hs){//开启时隐藏窗体滚动条
				var msie = /msie/i.test(navigator.appVersion);
				ist = Math.max(xdb.scrollTop,xdde.scrollTop);
				document.documentElement.style.overflow = 'hidden';
				if(msie){document.body.style.overflow = 'hidden';}
				document.body.scrollTop = ist+1;
			}
			if(!x){x=0;}
			if(!y){y=0;}
			fooopold.call(this,x,y);
			resize();
		};
		//重写继承自easyLayer的close方法
		var fooclold = this.close;
		this.close = function(){
			this.subcount();//引用计数减1
			if(this.getcount()>0){return false;}//如果还有其他元素引用了遮罩，则不关闭遮罩
			if(hs){//开启时隐藏窗体滚动条
				var msie = /msie/i.test(navigator.appVersion);
				ist = Math.max(xdb.scrollTop,xdde.scrollTop);
				document.documentElement.style.overflow = 'auto';
				if(msie){document.body.style.overflow = 'auto';}
				document.body.scrollTop = ist-1;
			}
			fooclold.call(this);
		};
	}
};