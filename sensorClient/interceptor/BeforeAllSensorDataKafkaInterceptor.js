/**
 * function : 拦截器案例三，在ep中添加数据
 * author : 郑涤非
 * time : 2016-3-2
 * version : 1.0
 */
var Interceptor = require('./Interceptor');
var Engine = require("../service/Engine");
var EngineParameter = require("../service/EngineParameter");
var kafka = require('kafka-node');
var crypto = require('crypto');
var zlib = require('zlib');
var Producer = kafka.Producer;
var Client = kafka.Client;
var client = new Client('localhost:2181');
var producer = new Producer(client,{requireAcks : 1});
//准备向kafka发送消息
producer.on('ready',function(){
	
});
//kafka发送消息出错
producer.on('error',function(err){
	log.error('producer 出错！' + err);
});

//定义log4js的日志对象 
var log = require('../log/log4js').log();

function BeforeAllSensorDataInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep,callback){
		//需要解压缩的文件
		var zipSendData = ep.getParam('sensorData');
		if(zipSendData !=null){	
			log.info('kafka发送器初始化完成！');
			producer.send([{'topic' : 'sensorData','partition' : 0,'messages' : [zipSendData],'attributes':0}],function(err,result){
				if(err) return callback(true,'向kafka中传递消息失败');
				log.info('向kafka中传递消息成功！');
			});
		}else{
			return callback(true,'未传递传感器数据！');
		}
		callback(false);
	};
}

module.exports = BeforeAllSensorDataInterceptor;