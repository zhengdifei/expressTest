/**
 * funciton:模拟传感器采集器，向服务器发送采集数据
 * author : 郑涤非
 * time : 2016-3-1
 * version : 1.0
 */
var fs = require('fs');
var http = require('http');
var UUID = require('./util/UUID');
var EventEmitter = require('events');
var util = require('util');
var mongodb = require('mongodb');
var crypto = require('crypto');
var zlib = require('zlib');

//定义log4js的日志对象 
var log = require('./log/log4js').log();

//系统配置信息
var config = {
		templateFile : 'config/template.json',//本地文件路径
		dbUrl:'mongodb://localhost:27017/mydb1',//mongoDB连接字符串
		cycleTime : 10000//每30s,发送一次数据
}

/*
 * 创建自定义事件,用于文件生成完毕，触发数据发送事件
 */
function MyEvent(){};

util.inherits(MyEvent,EventEmitter);

var newEvent = new MyEvent();

var sensorColl = ['C6F9ED246BB000017FE52A9A7400AD50','C6F9ED6F280000016B26A06015501D1A','C6F9ED79A78000017C1490581870115A','C6F9ED7E8F9000019EF212F219761C8D'];
//随机取一个收集器
var collectorId = sensorColl[Math.round(Math.random()*3)];//UUID();
//定义数据传输template版本
var version = '1.0';

var httpOptions = {
		host : '127.0.0.1',
		port : 8080,
		method : 'GET',
		headers : {
			'accept' : '*/*',
			'Content-Type': 'application/json',
			'accept-encoding' : 'gzip,deflate',
			'accept-language' : 'en-US,en;q=0.9',
			'authorization' : new Buffer('vis' + collectorId).toString('base64'),
			'user-agent' : 'nodejs client'
		}
}
/*
 * 连接验证，验证通过返回最新模板文件模板，如果跟本地相同，不更新；如果不同，则进行下载最新文件
 */
httpOptions['path'] = '/authConn';
var authReq = http.request(httpOptions,function(res){
	log.debug('Auth STATUS: ' + res.statusCode);
	
	res.on('data',function(chunk){
		var resultObj = JSON.parse(chunk.toString());
		if(resultObj['success']){
			if(resultObj['templateVersion'] && resultObj['templateVersion'] != version){
				log.debug('本地数据验证版本：' + version + '   服务器端数据版本是：' + resultObj['templateVersion']);
				//触发更新模板
				newEvent.emit('update_tempate',resultObj['templateVersion']);
			}else{
				//触发发送数据
				newEvent.emit('start_send_data');
			}
		}else{
			log.error(resultObj['msg']);
			//触发关闭数据
			newEvent.emit('close_send_data');
		}
	});
});

authReq.on('error',function(e){
	log.error('problem with request: ' + e.message);
});

authReq.end();

var sendDataClock = null;

//开始发送数据
newEvent.on('start_send_data',function(){
	log.debug('开始发送数据');
	//循环发送数据
	sendDataClock = setInterval(function(){
		//查询本地需要发送数据
		mongodb.MongoClient.connect(config.dbUrl,function(err,db){
			db.collection('sensorData').find().limit(100).toArray(function(err,data){
				//有数据，才进行数据发送
				if(data.length > 0){
					sendData(data);
				}
			});
		})
	},config.cycleTime);
});

function sendData(data){
	var sendData = JSON.stringify(data);
	//密钥
	var key = 'visenergy';
	//进行AES-256加密
	var cipher = crypto.createCipher('aes-256-cbc',key);
	var crypted = cipher.update(sendData,'utf-8','hex');
	crypted += cipher.final('hex');
	
	//将加密数据进行压缩传输
	zlib.deflate(crypted,function(err,buffer){
		if(err){
			return log.error('压缩出错');
		}
		//将压缩数据通过http进行web传输
		var sensorData = {'sensorData' : buffer.toString('base64')};

		httpOptions['path'] = '/common.action?command=allSensorData.send';
		httpOptions['method'] = 'POST';
		var sendReq = http.request(httpOptions,function(res){
			log.debug('Send data STATUS: ' + res.statusCode);
			
			res.on('data',function(chunk){
				var resultObj = JSON.parse(chunk.toString());
				if(resultObj['success']){
					newEvent.emit('delete_sensor_data',data);
					
					if(resultObj['templateVersion'] && resultObj['templateVersion'] != version){
						newEvent.emit('update_tempate');
					}
				}else{
					newEvent.emit('start_send_data');
				}
			});
		});

		sendReq.on('error',function(e){
			log.error('problem with request: ' + e.message);
		});

		sendReq.write(JSON.stringify(sensorData));

		sendReq.end();
	})
}

//删除发送成功的数据
newEvent.on('delete_sensor_data',function(data){
	log.debug('删除已发送到服务器端数据');
	data.forEach(function(item){
		//查询本地需要发送数据
		mongodb.MongoClient.connect(config.dbUrl,function(err,db){
			db.collection('sensorData').deleteMany({'_id':new mongodb.ObjectID(item['_id'])},function(err,result){
				if(err){
					return log.error(item['_id'] + '删除失败！');
				}
				log.debug(item['_id'] + '删除成功！');
			})
		})
	})
});

//更新模板
newEvent.on('update_tempate',function(serverVersion){
	log.debug('更新数据验证模板');
	//触发关闭数据
	newEvent.emit('close_send_data');
	
	httpOptions['path'] = '/dataTemplate.js';
	httpOptions['method'] = 'GET';
	var templateReq = http.request(httpOptions,function(res){
		log.debug('Update Template STATUS: ' + res.statusCode);
		
		res.on('data',function(chunk){
			var resultStr = chunk.toString();
			fs.writeFile('config/complexVerifyTemplate.json',resultStr,{'flag':'w'},function(err){
				if(err){
					log.error('更新本地模板失败！');
					return;
				}
				
				version = serverVersion;
				newEvent.emit('start_send_data');
			});
		});
	});

	templateReq.on('error',function(e){
		log.error('problem with request: ' + e.message);
	});

	templateReq.end();
});

//关闭数据发送
newEvent.on('close_send_data',function(){
	log.debug('关闭循环发送数据');
	if(sendDataClock){
		clearInterval(sendDataClock);
	}
});