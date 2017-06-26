/**
 * function : 拦截器案例三，在ep中添加数据
 * author : 郑涤非
 * time : 2016-3-2
 * version : 1.0
 */
var crypto = require('crypto');
var zlib = require('zlib');
var EventEmitter = require('events');
var util = require('util');
var fs = require('fs');
var Interceptor = require('./Interceptor');
var Engine = require("../service/Engine");
var EngineParameter = require("../service/EngineParameter");

//定义log4js的日志对象 
var log = require('../log/log4js').log();
/*
 * 创建自定义事件,用于文件生成完毕，触发数据发送事件
 */
function MyEvent(){};
util.inherits(MyEvent,EventEmitter);
var newEvent = new MyEvent();

newEvent.on('error_sensor_data',function(data){
	fs.writeFile('log/error_sensor_data.txt',JSON.stringify(data),{'flag':'a'},function(err){
		if(err) return log.error('错误传感器数据写入error_sensor_data.txt，失败');
		log.debug('错误传感器数据写入error_sensor_data.txt，成功');
	});
});

function BeforeAllSensorDataInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep,callback){
		//需要解压缩的文件
		var zipSendData = ep.getParam('sensorData');
		if(zipSendData !=null){
			//解压缩
			zlib.unzip(new Buffer(zipSendData,'base64'),function(err,buffer){
				if(err){
					return log.error('解压出错！');
				}
				var sendData = buffer.toString();
				//解密
				var key = 'visenergy';
				var decipher = crypto.createDecipher('aes-256-cbc',key);
				var decSendData = decipher.update(sendData,'hex','utf-8');
				decSendData += decipher.final('utf8');
				//向kafka中传递消息
				//console.log(decSendData);
				
				
				
				//向数据库中传递
				var sendDataObj = JSON.parse(decSendData);
				sendDataObj.forEach(function(data){
					var selfEp = new EngineParameter('allSensorData.insert');
					selfEp.setParamMap(data);
					Engine.execute(selfEp,function(err,msg,se){
						if(err){
							if(se != null && typeof se == 'object'){ se['callbackMark'] = true; };
							log.error('执行: ' + selfEp['command'] + ' 出错 ; 错误信息: ' + msg);
							newEvent.emit('error_sensor_data',data);
						}
					});
				});
			});
		}else{
			return callback(true,'未传递传感器数据！');
		}
		
		callback(false);
	};
}

module.exports = BeforeAllSensorDataInterceptor;