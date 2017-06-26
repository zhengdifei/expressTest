var kafka = require('kafka-node');
var crypto = require('crypto');
var zlib = require('zlib');
var mongodb = require('mongodb');

var Consumer = kafka.HighLevelConsumer;
var Offset = kafka.Offset;
var client = new kafka.Client('localhost:2181');

//系统配置信息
var config = {
		dbUrl:'mongodb://localhost:27017/mydb1'//mongoDB连接字符串
}

var topics = [{topic:'sensorData',partition:0}];
var options = {autoCommit:true,fetchMaxWaitMs:1000,fetchMaxBytes:1024*1024};
var consumer = new Consumer(client,topics,options);
var offset = new Offset(client);
//定义log4js的日志对象 
var log = require('./log/log4js').log();

consumer.on('message',function(message){
	//需要解压缩的文件
	var zipSendData = message.value;
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
			var sendDataArray = JSON.parse(decSendData);
			sendDataArray.forEach(function(sendDataItem){
				//查询本地需要发送数据
				mongodb.MongoClient.connect(config.dbUrl,function(err,db){
					db.collection('allSensorData').insertOne(sendDataItem,function(err,result){
						if(err){							
							return log.error(sendDataItem['_id'] + "存入数据库失败！");
						}
						log.info(sendDataItem['_id'] + '添加数据成功');
					});
				})
			});
		})
	}
});

consumer.on('error',function(err){
	log.error('consumer 出错！' + err);
});

consumer.on('offsetOutRange',function(topic){
	topic.maxNum = 2;
	offset.fetch([topic],function(err,offsets){
		var min = Math.min.apply(null,offsets[topic.topic][topic.partition]);
		consumer.setOffset(topic.topic,topic.partition, min);
	});
});