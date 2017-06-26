/**
 * function : visNode工具类集合
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var EngineParameter = require("../service/EngineParameter");
//定义log4js的日志对象 
var log = require('../log/log4js').log();
/*
 * 输入：request对象
 * 输出：无异常，输出EngineParameter对象；异常，抛出异常对象。
 * 处理request传入数据，在回调函数中执行Engine.execute方法。
 */
exports.handleReq = function(req,callback){
	try{
		;
		var command = req.query['command'] || req.param['command'];	//获取command
		log.debug('执行sqlid：'+command);
		var ep = new EngineParameter(command);	//构建EngineParameter对象
		var _paramMap = req.query || req.param;	//构建paramMap对象
		delete _paramMap['command'];	//从paramMap对象中删除command对象
		//处理post请求数据
		if(req['_body'] && req['body']){
			for(var n in req['body']){
				_paramMap[n] = req['body'][n];
			}
		}
		
		ep.setParamMap(_paramMap);
		
		callback(false,ep);
	}catch(err){
		callback(true,err);
	}
	
}

/*
 * utf-8下计算字符串占用字节数
 */
exports.String2byte = function(data){
	//字节总数
	var totalLength = 0; 
	//缓冲值
	var charCode = null; 
	for (var i = 0; i < data.length; i++) { 
		charCode = data.charCodeAt(i); 
		if(charCode < 0x007f){ 
			totalLength += 1; 
		}else if((0x0080 <= charCode) && (charCode <= 0x07ff)) { 
			totalLength += 2; 
		}else if((0x0800 <= charCode) && (charCode <= 0xffff)) { 
			totalLength += 3; 
		} 
	} 
	
	return totalLength; 
}
//author: meizz 
// 对Date的扩展，将 Date 转化为指定格式的String 
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (DateFormat(new Date(),"yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (DateFormat(new Date(),"yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
exports.DateFormat = function(date,fmt) 
{ 
  var o = { 
    "M+" : date.getMonth()+1,                 //月份 
    "d+" : date.getDate(),                    //日 
    "h+" : date.getHours(),                   //小时 
    "m+" : date.getMinutes(),                 //分 
    "s+" : date.getSeconds(),                 //秒 
    "q+" : Math.floor((date.getMonth()+3)/3), //季度 
    "S"  : date.getMilliseconds()             //毫秒 
  }; 
  if(/(y+)/.test(fmt)) 
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  for(var k in o) 
    if(new RegExp("("+ k +")").test(fmt)) 
    	fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
  return fmt; 
}

exports.isEmptyObject = function(obj){
	var mark = true;
	
	if(obj != null && typeof obj == 'object'){
		for(var i in obj){
			mark = false;
			break;
		}
	}
	
	return mark;
}