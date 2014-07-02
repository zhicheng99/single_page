//每个页面的配置项

   window.console=(function(){
   	   if(window.console&&window.console.log){
	     return window.console;
	   }else{
	     return function(){};
	   }
	})();


var page_config={

	'#default':{
		'page':'default.html',
		'css_file':['style/default.css'],
		'pre_img':[    //预加载的图片
			'http://grjd.dashilan.cn/images/kfs_pic1.jpg',
			'http://grjd.dashilan.cn/images/kfs_pic2.jpg',
			'http://grjd.dashilan.cn/images/kfs_pic3.jpg',
			'http://grjd.dashilan.cn/images/kfs_pic4.jpg',
			'http://grjd.dashilan.cn/images/kfs_pic5.jpg'

		],
		'is_load_css':false,   //是否加载完css文件
		'init':function(obj){  //初始化页面
			//console.log('init---');
			//obj.is_load_css=true;
			//$("#lay").load(obj.page);
			//console.log('fdfdfs');

			//$('#flash').stop().animate({'height':'300px'});

			//TweenLite( target,1 ,{ left:100 ,top:100, ease:Easing.Expo.easeOut, delay:2, onUpdate:Fun, onComplete:Fun });
			//TweenLite($('#flash')[0], 1.5, {height:300});
			
		var aa=function(){
			//alert('dffd');
		};
		
		TweenLite.to( "#flash", 1.2, { css: {height:200},ease:Expo.easeInOut,onComplete:aa});


			return {     //返回对象（如定时器对象，目的：quit方法调用并清除）
				'default':''

			};	
			

		},
		'quit':function(obj){ //卸载页面
			//console.log('清除default绑定的方法');
			//console.log(obj);
		}
	},

	'#page1':{
		'page':'page1.html',
		'css_file':['style/page1.css'],
		'pre_img':['http://grjd.dashilan.cn/images/kfs_pic1.jpg'],
		'is_load_css':false,   //是否加载完css文件
		'init':function(obj){  //初始化页面
			//console.log('init---');
			//obj.is_load_css=true;
			//$("#lay").load(obj.page);
			//console.log('fdfdfs');

			return {
				'page1':''
			};
			

		},
		'quit':function(obj){ //卸载页面
			//console.log('清除page1绑定的方法');
			//console.log(obj);
		}
	}

	

};