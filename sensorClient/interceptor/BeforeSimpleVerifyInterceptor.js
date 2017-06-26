/**
 * function : 数据简单校验，只进行空判断
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var Interceptor = require('./Interceptor');
var fs = require('fs');
var Engine = require("../service/Engine");
var EngineParameter = require("../service/EngineParameter");

function BeforeSimpleVerifyInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep,callback){
		//添加时间戳
		ep.putParam('time', new Date().getTime());
		
		//读取本地config/complexVerifyTemplate.json文件
		var template = fs.readFileSync('config/simpleVerifyTemplate.json','utf-8');
		//将文本文件变成JSON对象
		var verifyTemplate = JSON.parse(template);
		
		var mark = false;
		verifyTemplate.forEach(function(name){
			if(mark) return;
			
			if(ep.getParam(name) == null){
				mark = true;
				var selfEp = new EngineParameter('sensorDataException.insert');
				selfEp.setParamMap(ep.getParamMap());
				selfEp.putParam('error', name + ' is empty');//错误信息
				Engine.execute(selfEp);
				
				return callback(mark, name + ' is empty');
			}
		});
		callback(false);
	};
}

module.exports = BeforeSimpleVerifyInterceptor;