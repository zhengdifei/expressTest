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
