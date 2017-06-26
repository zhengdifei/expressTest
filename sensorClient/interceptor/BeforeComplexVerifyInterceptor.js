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
var socketio = require('../io/socketio');

function BeforeComplexVerifyInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep,callback){
		//添加时间戳
		ep.putParam('time', new Date().getTime());
		
		var mark = false;
		var msg = '';
		//读取本地config/complexVerifyTemplate.json文件
		var template = fs.readFileSync('config/complexVerifyTemplate.json','utf-8');
		//将文本文件变成JSON对象
		var verifyTemplate = JSON.parse(template);
		
		verifyTemplate.forEach(function(item){
			if(mark) return;
			
			if(ep.getParam(item['name']) == null){
				//是否必填
				if(item['require']){ 
					mark = true;
					msg = item['name'] + '为必填项, 传感器未传递此数据';
				}
			}else{
				//如果有定长限制，长度是否匹配
				if(item['length'] && ep.getParam(item['name']).length != item['length']){
					mark = true;
					msg = item['name'] + '长度应该为：'+ item['length'] +', 实际值为: '+ ep.getParam(item['name']).length ;
				}
				//数字类型，验证是否是数字类型，长度范围是否匹配
				if(item['type'] == 'int' || item['type'] == 'long' || item['type'] == 'float' || item['type'] == 'double'){
					if(/^(-?\d+)(\.\d+)?$/.test(ep.getParam(item['name']))){
						if(item['range'] && !eval(ep.getParam(item['name'])+item['range'])){
							mark = true;
							msg = item['name'] + '数字类型应该'+ item['range'] + ', 实际值为：'+ ep.getParam(item['name']);
						}
					}else{
						mark = true;
						msg = item['name'] + '应该为数字类型, 实际值为：'+ ep.getParam(item['name']);
					}
				}
				//字符类型，如果有正则，进行正则验证
				if(item['type'] == 'string' && item['rege'] != null){
					if(!new RegExp(item['rege']).test(ep.getParam(item['name']))){
						mark = true;
						msg = item['name'] + '正则'+ item['rege']+'验证失败, 实际值为：'+ ep.getParam(item['name']);
					}
				} 
			}
			
			if(mark){
				var selfEp = new EngineParameter('sensorDataException.insert');
				selfEp.setParamMap(ep.getParamMap());
				selfEp.putParam('error', msg);//错误信息
				Engine.execute(selfEp);
				
				sockeio.sendMessage('collectorError',msg);
				return callback(mark, msg);
			}
			
		});
		
		callback(false);
	};
}

module.exports = BeforeComplexVerifyInterceptor;