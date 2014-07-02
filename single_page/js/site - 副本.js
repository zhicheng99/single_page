//qq:289530302
/*
	单页面网站框架
	注：IE6 IE7浏览器前进 后退按钮不支持
*/

window.console=(function(){
   	   if(window.console&&window.console.log){
	     return window.console;
	   }else{
	     return {log:function(){}};
	   }
	})();

//逻辑模块
var Site=function(param_obj){

	curHash = '';//记录当前hash
	var unbind_prev=function(obj){};  //清除上一页绑定的方法  （changeHashCallBack方法内重写）
	var obj_init={};				  //配置对象中init方法返回的对象
	
	var load_page=function(sign){
		//console.log(sign);
		//console.log(page_config[sign]);
		if(!page_config[sign]){
			return;
		};

		if(!page_config[sign]['is_load_css']){   //当前页面css没有加载的情况下，先监测css文件加载

			loadcss( page_config[sign]['css_file'], page_config[sign]['init'], sign);

		}else{

			ajax_page( sign, page_config[sign]['init'] );

		};

	};


	var ajax_page=function(sign,callback){  //通过ajax加载页面  callback:加载完成后页面上需要绑定的一些方法

		//$("#lay").load(page_config[sign]['page']);

		$.ajax({
		  type: 'POST',
		  url: page_config[sign]['page'],
		  success: function(data){  //先保证有页面，然后再预加载图片

		  	effect_css(sign);  //启用相应的css文件

		  	var callback1=function(){
		  		unbind_prev(obj_init);    //清除上一页事件
			  	$("#"+param_obj["page_area_id"]).html( data );
			  	obj_init=callback();
			  	param_obj["finish_load_page"]();	
		  	};

		  	pre_img_load(sign,callback1);  //预加载图片

		  }

		});

	};

	//使当前页css文件生效
	var effect_css=function(sign){
		
		for (var i = param_obj["public_css"].length; i < document.styleSheets.length; i++) {
			if(document.styleSheets[i].href.indexOf(page_config[sign]["css_file"]) >-1){

				document.styleSheets[i].disabled=false;
			}else{
				document.styleSheets[i].disabled=true;
			}
		};

		/*for (var i = 0; i < document.styleSheets.length; i++) {
			if(document.styleSheets[i].href.indexOf(page_config[sign]["css_file"]) >-1 || document.styleSheets[i].href.indexOf(param_obj["public_css"])>-1){

				document.styleSheets[i].disabled=false;
			}else{
				document.styleSheets[i].disabled=true;
			}
		};*/

		console.log(document.styleSheets);
	};

	/*if ("onhashchange" in window) {//IE8以下版本的浏览器不支持此属性
		alert(";The browser supports the hashchange event!");
	}*/
		
	var  getHash=function(){//获取hash
		var h = window.location.hash;
		
		if (!h){
			return '';
		}else{
			return window.location.hash;
		};
	};

	var changeHash=function(nextHash){//修改hash 每次点击按钮触发hash变化
		/*	
			发送Ajax请求时，可以修改相应的hash值，
			只要在页面load完之后获取hash值并发送对应的Ajax请求并更新页面，
			这样就可以达到用Ajax也能跟踪浏览历史的目的
		*/
		window.location.hash = '#'+ nextHash;

		
		
	};

	var changeHashCallBack=function(){//hash变化之后，回调函数会被触发
		var hash = getHash();
		
		

		if(hash==''){   //防止浏览器一直后退到没有hash值
			changeHash(param_obj["default_page"]);
		};


		
		if (curHash != hash){

			if(curHash!=''){
				unbind_prev=page_config[curHash]['quit'];
			};

			param_obj["pre_load_page"]();

			curHash = hash;
			//alert("哈希更改 :" + hash);

			load_page(hash);
		
		};
	};


	
	//这个监听方式有问题(360兼容模式下(真是邪恶呀))
	/*if (document.all && !document.documentMode){  ////辨别IE IE8才有documentMode
		
		setInterval(changeHashCallBack, 100);// 低于IE8的IE系列采用定时器监听 

	}else{
		window.onhashchange = changeHashCallBack;
	};*/

   //alert(document.documentMode);

	if( ("onhashchange" in window) && ((typeof document.documentMode==='undefined') || document.documentMode==8)) {
		    // 浏览器支持onhashchange事件
		    window.onhashchange = changeHashCallBack;  // TODO，对应新的hash执行的操作函数

		} else {
		    // 不支持则用定时器检测的办法
		    //alert('ie');
		    setInterval(changeHashCallBack, 100);
		}; 

	
	//图片预加载
	var pre_img_load=function(sign,callback){

		var count=0;   //已加载数量
		var imgNum=0; //图片总数
		var images={}; //图片list 

		var sources=page_config[sign]['pre_img'];

		for(var num in sources){
			imgNum++;
		};



		if(imgNum<=0){
			//ajax_page(sign,callback); 			//开始加载页面	(callback：初始化页面方法)
			callback();
			return;
		};


		for(var src in sources){

			images[src] = new Image();//创建一个Image对象，实现图片的预下载
			images[src].onload=function(){
				if(++count >= imgNum){
	            	//callback.call(images);//执行回调函数
	                //ajax_page(sign,callback); 	//开始加载页面	(callback：初始化页面方法)
	                callback();
					//$(".progress").html('loading...');
	            };
				var pro=Math.floor((100/imgNum*(count)));
				param_obj["img_load_progress"](pro);

			};

	        images[src].src = sources[src];//图片加载路径

		};

		//ajax_page(sign,callback); 	//开始加载页面	(callback：初始化页面方法)
	
	};	



	//css加载的监听
	var loadcss=function(file,callback,sign){
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

	  var node = document.createElement("link");
	  node.setAttribute("rel","stylesheet");
	  node.setAttribute("type","text/css");
	  node.setAttribute("href",file);

	  //$('head').append(node);    //该方法在ie下有问题（样式不起作用）
	  $('head')[0].appendChild(node);

	  styleOnload(node,function(){
	      //alert("css_loaded");
	      page_config[sign]['is_load_css']=true;  //标记css文件已载完成

	      //pre_img_load(sign,callback);  //预加载图片

	      ajax_page(sign,callback); 			//开始加载页面	(callback：初始化页面方法)

	      //callback(obj);                       
	  });

	};


	var modi_curhash=function(hash){

		curhash=hash;
	};


	var init=function(){
		var currhash=getHash();

		if(currhash==''){
			changeHash(param_obj["default_page"]);  //直接转到首页
		}else{
			load_page(currhash);
		};
	};

	init();

};

$(function(){
	new Site({
		"default_page":"default",  		  	//默认加载的页面
		"public_css":["style/public.css"],  //公用css文件地址
		"page_area_id":"lay",			 	//页面加载区ID
		"pre_load_page":function(){$('#load').show();}, //页面加载之前调用
		"finish_load_page":function(){$('#load').hide();},			//页面加载完成后调用
		"img_load_progress":function(n){$('#load span').html('loading '+n+'%');}			//图片加载进度 返回百分比
	});
})


/*$(function(){
	var site=new Site();
	var currhash=site.getHash();

	if(currhash==''){
		site.changeHash('default');  //直接转到首页
	}else{

		site.load_page(currhash);
		site.modi_curhash(currhash);
	};
});*/

