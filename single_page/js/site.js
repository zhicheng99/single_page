//qq:289530302
/*
	单页面网站框架
*/

//逻辑模块
var Site = function(param_obj){
	_this = this;

	var default_setting = {
		"default_page" : "", 				//默认加载的页面
		"page_area_id" : "",				//页面加载区ID
		"page_data" : {},					//页面数据对象
		"pre_load_page" : function(){},     //页面数据对象
		"finish_load_page" : function(){},  //页面加载完成后调用
		"img_load_progress" : function(){}	//图片加载进度 返回百分比
	};

	_this.setting = $.extend({},default_setting,param_obj);

	_this.public_css_length = document.styleSheets.length;    //公用css文件个数

	_this.get_url = "";  //保存hash里的数据参数

	_this.curHash = '';	//记录当前hash
	_this.unbind_prev = function(obj){};  //清除上一页绑定的方法  （changeHashCallBack方法内重写）
	_this.obj_init = {};				  //配置对象中init方法返回的对象


	/*if ("onhashchange" in window) {//IE8以下版本的浏览器不支持此属性
		alert(";The browser supports the hashchange event!");
	}*/
		
	
	//这个监听方式有问题(360兼容模式下(真是邪恶呀))
	/*if (document.all && !document.documentMode){  ////辨别IE IE8才有documentMode
		
		setInterval(changeHashCallBack, 100);// 低于IE8的IE系列采用定时器监听 

	}else{
		window.onhashchange = changeHashCallBack;
	};*/

   //alert(document.documentMode);

	_this.init();

};

Site.prototype.init=function(){

		console.log("onhashchange" in window);
		console.log(document.documentMode);

		if( ("onhashchange" in window) && ((typeof document.documentMode==='undefined') || document.documentMode==8)) {
		//if( ("onhashchange" in window)) {	
		    // 浏览器支持onhashchange事件
		    window.onhashchange = function(){_this.changeHashCallBack.apply(_this)};  // TODO，对应新的hash执行的操作函数

		} else {
		    // 不支持则用定时器检测的办法
		    //alert('ie');
		    setInterval(function(){_this.changeHashCallBack.apply(_this)}, 100);
		}; 


		var currhash = _this.getHash();

		if(currhash == ''){
			_this.changeHash(_this.setting.default_page);  //直接转到首页
		}else{
			_this.load_page(currhash);
		};
};

Site.prototype.getHash = function(){//获取hash
		var h = window.location.hash;
		
		if (!h){
			return '';
		}else{
			return window.location.hash;
		};
	};

Site.prototype.changeHash = function(nextHash){//修改hash 每次点击按钮触发hash变化
		/*	
			发送Ajax请求时，可以修改相应的hash值，
			只要在页面load完之后获取hash值并发送对应的Ajax请求并更新页面，
			这样就可以达到用Ajax也能跟踪浏览历史的目的
		*/
		window.location.hash = '#'+ nextHash;

	};
Site.prototype.changeHashCallBack = function(){//hash变化之后，回调函数会被触发
		
		var hash = _this.getHash();
		
		if(hash == ''){      //防止浏览器一直后退到没有hash值
			_this.changeHash(_this.setting.default_page);
		};

		if (_this.curHash != hash){

			if(_this.curHash !=''){
				_this.unbind_prev = _this.setting.page_data[_this.return_sign(_this.curHash)]['quit'];
			};

			_this.setting.pre_load_page();
			_this.curHash = hash;
			//alert("哈希更改 :" + hash);

			//_this.load_page(_this.curHash);
			_this.load_page(_this.return_sign(_this.curHash));
		
		};
	};


Site.prototype.return_sign = function(hash){

     if(hash.indexOf("?") > -1){
     	_this.get_url = hash.split("?")[1];  //保存hash里的数据参数
     	return hash.split("?")[0];
     }else{
     	_this.get_url = "";
     	return hash;
     }
};	

Site.prototype.load_page = function(sign){
		//console.log(_this.setting.page_data[sign]);
		if(!_this.setting.page_data[sign]){
			return;
		};

		if(!_this.setting.page_data[sign]['is_load_css']){   //当前页面css没有加载的情况下，先监测css文件加载

			_this.loadcss( _this.setting.page_data[sign]['css_file'], _this.setting.page_data[sign]['init'], sign );

		}else{

			_this.ajax_page( sign, _this.setting.page_data[sign]['init'] );

		};
	};

//css加载的监听
Site.prototype.loadcss = function(file,callback,sign){	

		  function styleOnload(node, callback) {
		    if (node.attachEvent) {
		      node.attachEvent('onload', callback);
		    } else {
		      setTimeout(function() {
		        poll(node, callback);
		      }, 0);
		    }
		};

		function poll(node, callback) {
		  if (callback.isCalled) {
		    return;
		  };

		  var isLoaded = false;

		  if (/webkit/i.test(navigator.userAgent)) {//webkit
		    if (node['sheet']) {
		      isLoaded = true;
		    };
		  }else if (node['sheet']) {
		    try {
		      if (node['sheet'].cssRules) {
		        isLoaded = true;
		      };
		    } catch (ex) {
		      if (ex.code === 1000) {
		        isLoaded = true;
		      };
		    };
		  }

		  if (isLoaded) {
		    setTimeout(function() {
		      callback();
		    }, 1);
		  }else {
		    setTimeout(function() {
		      poll(node, callback);
		    }, 1);
		  }
		};		


	  var total = file.length;
	  var load_num = 0;
	  var link_node = {};


	  for (var i in file) {

	  	link_node[i] = document.createElement("link");
	  	link_node[i].setAttribute("rel","stylesheet");
	  	link_node[i].setAttribute("type","text/css");
	  	link_node[i].setAttribute("href",file[i]);

	  	$('head')[0].appendChild(link_node[i]);

	  	styleOnload(link_node[i],function(){
		      //alert("css_loaded");
		      if( ++load_num >= total ){
		      	_this.setting.page_data[sign]['is_load_css']=true;  //标记css文件已载完成
		      	_this.ajax_page(sign,callback); 			//开始加载页面	(callback：初始化页面方法)
		      }
		  });

	  };
	};

Site.prototype.ajax_page=function(sign,callback){  //通过ajax加载页面  callback:加载完成后页面上需要绑定的一些方法
		
		//$("#lay").load(_this.setting.page_data[sign]['page']);

		//生成带参数的请求
		var ajax_url = _this.setting.page_data[sign]['page'] + (_this.get_url != ""?("?"+_this.get_url) : "");

		$.ajax({
		  type: 'POST',
		  //url: _this.setting.page_data[sign]['page'],
		  url: ajax_url,
		  success: function(data){  //先保证有页面，然后再预加载图片

		  	_this.effect_css(sign);  //启用相应的css文件

		  	var callback1=function(){
		  		_this.unbind_prev(_this.obj_init);    //清除上一页事件
			  	$( "#"+_this.setting.page_area_id ).html( data );
			  	_this.obj_init = callback();
			  	_this.setting.finish_load_page();	
		  	};

		  	_this.pre_img_load( sign,callback1 );  //预加载图片

		  }

		});
	};

//图片预加载
Site.prototype.pre_img_load=function(sign,callback){
		var count = 0;   //已加载数量
		var imgNum = 0; //图片总数
		var images = {}; //图片list 

		var sources = _this.setting.page_data[sign]['pre_img'];

		imgNum = sources.length;

		if(imgNum <= 0){
			//ajax_page(sign,callback); 			//开始加载页面	(callback：初始化页面方法)
			callback();
			return;
		};


		for(var src in sources){

			images[src] = new Image();//创建一个Image对象，实现图片的预下载
			images[src].onload=function(){
				if( ++count >= imgNum){
	            	//callback.call(images);//执行回调函数
	                //ajax_page(sign,callback); 	//开始加载页面	(callback：初始化页面方法)
	                callback();
					//$(".progress").html('loading...');
	            };
				var pro = Math.floor((100/imgNum*(count)));
				_this.setting.img_load_progress(pro);

			};

	        images[src].src = sources[src];  //图片加载路径

		};

	};

Site.prototype.modi_curhash = function(hash){

		_this.curhash = hash;
	};

//使当前页css文件生效
Site.prototype.effect_css = function(sign){
		
		var o_css = _this.setting.page_data[sign]["css_file"];
		for (var i = _this.public_css_length; i < document.styleSheets.length; i++) {	

			for(var j in o_css){

				if(document.styleSheets[i].href.indexOf(o_css[j]) >-1){

					document.styleSheets[i].disabled = false;
				}else{
					document.styleSheets[i].disabled = true;
				}
			}
		};
		console.log(document.styleSheets);
	};


$(function(){
	new Site({
		"default_page" : "default",  		  	//默认加载的页面
		"page_area_id" : "lay",			 		//页面加载区ID
		"page_data" : page_config,						//页面数据对象		
		"pre_load_page" : function(){ $('#load').show(); }, //页面加载之前调用
		"finish_load_page" : function(){ $('#load').hide(); },			//页面加载完成后调用
		"img_load_progress" : function(n){ $('#load span').html('loading '+n+'%'); }			//图片加载进度 返回百分比
	});
});



