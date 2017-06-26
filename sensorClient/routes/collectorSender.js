/**
 * funciton:模拟传感器采集器，向服务器发送采集数据
 * author : 郑涤非
 * time : 2016-3-1
 * version : 1.0
 */
var fs = require('fs');
var http = require('http');
var UUID = require('../util/UUID');
var visUtils = require('../util/visUtils');
var EventEmitter = require('events');
var util = require('util');
var mongodb = require('mongodb');
var crypto = require('crypto');
var zlib = require('zlib');
var socketio = require('../io/socketio');
//定义log4js的日志对象 
var log = require('../log/log4js').log();

function collectorSender(){
	this.sensorColl = [{
		CID : 'C6F9ED246BB000017FE52A9A7400AD50',
		NAME : 'collector-1'
	},{
		CID : 'C6F9ED6F280000016B26A06015501D1A',
		NAME : 'collector-2'
	},{
		CID : 'C6F9ED79A78000017C1490581870115A',
		NAME : 'collector-3'
	},{
		CID : 'C6F9ED7E8F9000019EF212F219761C8D',
		NAME : 'collector-4'
	}];
	//删除的传感器信息
	this.deleteSensors = {};
	//随机取一个收集器
	this.randomNum = Math.round(Math.random()*3);
	//定义数据传输template版本
	this.version = '1.0';
	//循环执行器
	this.sendDataClock = null;
	//系统配置信息
	this.config = {
			templateFile : 'config/template.json',//本地文件路径
			sensorDelFile : 'config/collectorDelSensor.js',//删除传感器数据文件
			dbUrl:'mongodb://localhost:27017/mydb1',//mongoDB连接字符串
			sendNum : 100,
			cycleTime : 10000,//每30s,发送一次数据
			secretkey : 'visenergy'
	}
	
	//服务器配置
	this.httpOptions = {
			host : '127.0.0.1',
			port : 8080,
			method : 'GET',
			headers : {
				'accept' : '*/*',
				'Content-Type': 'application/json',
				'accept-encoding' : 'gzip,deflate',
				'accept-language' : 'en-US,en;q=0.9',
				'authorization' : new Buffer('vis' + this.sensorColl[this.randomNum]['CID']).toString('base64'),
				'user-agent' : 'nodejs client'
			}
	}
	/*
	 * 连接验证，验证通过返回最新模板文件模板，如果跟本地相同，不更新；如果不同，则进行下载最新文件
	 */
	this.collectorAuth = function(){
		var me = this;
		
		me.httpOptions['path'] = '/authConn';
		me.httpOptions['method'] = 'GET';

		var authReq = http.request(me.httpOptions,function(res){
			log.debug('Auth STATUS: ' + res.statusCode);
			res.on('data',function(chunk){
				var resultObj = JSON.parse(chunk.toString());
				if(resultObj['success']){
					
					if(resultObj['templateVersion'] && resultObj['templateVersion'] != me.version){
						log.debug('本地数据验证版本：' + version + '   服务器端数据版本是：' + resultObj['templateVersion']);
						//触发更新模板
						me.updateTemplate(resultObj['templateVersion']);
					}
					//触发发送数据
					socketio.sendMessage('collectorAuth');
				}else{
					log.error(resultObj['msg']);
					//触发关闭数据
					//me.newEvent.emit('close_send_data');
					socketio.sendMessage('collectorAuthError',resultObj['msg']);
				}
			});
		});

		authReq.on('error',function(e){
			log.error('problem with request: ' + e.message);
			socketio.sendMessage('collectorAuthError',e.message);
		});

		authReq.end();
	}
	
	//开始发送数据
	this.startSendData = function(){
		var me = this;
		log.debug('开始发送数据');
		//循环发送数据
		me.sendDataClock = setInterval(function(){
			//查询本地需要发送数据
			mongodb.MongoClient.connect(me.config.dbUrl,function(err,db){
				db.collection('sensorData').count(function(err,num){
					socketio.sendMessage('collecterDataNum',{'NAME': me.sensorColl[me.randomNum]['NAME'],'NUM':num});
					if(num > 0){
						db.collection('sensorData').find().limit(me.config.sendNum).toArray(function(err,data){
							//有数据，才进行数据发送
							if(data.length > 0){
								me.sendData(data);
							}
						});
					}
				});
				
			})
		},me.config.cycleTime);
	}
	
	this.sendData = function(data){
		var me = this;
		//返回消息对象
		var collectorDataMsg = {
				startTime : new Date().getTime()
		};
		//将发送数据编程变成字符串数据
		var sendData = JSON.stringify(data);
		//原始消息大小
		collectorDataMsg['fsize'] = visUtils.String2byte(sendData);
		collectorDataMsg['num'] = data.length;
		//进行AES-256加密
		var cipher = crypto.createCipher('aes-256-cbc',me.config.secretkey);
		var crypted = cipher.update(sendData,'utf-8','hex');
		crypted += cipher.final('hex');
		collectorDataMsg['csize'] = visUtils.String2byte(crypted);
		
		//将加密数据进行压缩传输
		zlib.deflate(crypted,function(err,buffer){
			if(err){
				return log.error('压缩出错');
			}
			var senderSensorData = buffer.toString('base64');
			var dataByte = visUtils.String2byte(senderSensorData);
			collectorDataMsg['zsize'] = dataByte;
			//系统能够接受post最大的阈值10000kb
			if(dataByte/1024 > 10000){
				socketio.sendMessage('collecterDataError',"每次发送数量:" + me.config.sendNum + "产生的数据超过系统阈值。");
				me.closeSendData();
				return;
			}
			//将压缩数据通过http进行web传输
			var sensorData = {'sensorData' : senderSensorData};

			me.httpOptions['path'] = '/common.action?command=allSensorData.send';
			me.httpOptions['method'] = 'POST';
			var sendReq = http.request(me.httpOptions,function(res){
				log.debug('Send data STATUS: ' + res.statusCode);
				
				res.on('data',function(chunk){
					var resultObj = JSON.parse(chunk.toString());
					if(resultObj['success']){
						if(resultObj['templateVersion'] && resultObj['templateVersion'] != version){
							me.updateTemplate(resultObj['templateVersion']);
						}
						collectorDataMsg['endTime'] = new Date().getTime();
						socketio.sendMessage('collecterData',collectorDataMsg);
						me.deleteSensorData(data);
					}else{
						socketio.sendMessage('collecterDataError',resultObj['msg']);
					}
				});
			});

			sendReq.on('error',function(e){
				log.error('problem with request: ' + e.message);
				socketio.sendMessage('collecterDataError',e.message);
			});

			sendReq.write(JSON.stringify(sensorData));

			sendReq.end();
		})
	}
	//删除发送成功的数据
	this.deleteSensorData = function(data){
		log.debug('删除已发送到服务器端数据');
		var me = this;
		data.forEach(function(item){
			//查询本地需要发送数据
			mongodb.MongoClient.connect(me.config.dbUrl,function(err,db){
				db.collection('sensorData').deleteMany({'_id':new mongodb.ObjectID(item['_id'])},function(err,result){
					if(err){
						return log.error(item['_id'] + '删除失败！');
						socketio.sendMessage('deleteCollectorDataError',item);
					}
					if(!me.deleteSensors[item['SID']]){
						me.deleteSensors[item['SID']] = {
								SID : item['SID'],
								SNAME : item['SNAME'],
								thisTime : new Date().getTime(),
								num : 1,
								data : [item]
						};
					}else{
						me.deleteSensors[item['SID']]['thisTime'] = new Date().getTime();
						me.deleteSensors[item['SID']]['num'] += 1;
						me.deleteSensors[item['SID']]['data'].push(item);
					}
					
					socketio.sendMessage('deleteCollectorData',me.deleteSensors[item['SID']]);
					log.debug(item['_id'] + '删除成功！');
				})
			})
		})
	}
	
	this.updateTemplate = function(serverVersion){
		log.debug('更新数据验证模板');
		var me = this;
		//触发关闭数据
		me.closeSendData();
		
		me.httpOptions['path'] = '/dataTemplate.js';
		me.httpOptions['method'] = 'GET';
		var templateReq = http.request(me.httpOptions,function(res){
			log.debug('Update Template STATUS: ' + res.statusCode);
			
			res.on('data',function(chunk){
				var resultStr = chunk.toString();
				fs.writeFile('config/complexVerifyTemplate.json',resultStr,{'flag':'w'},function(err){
					if(err){
						log.error('更新本地模板失败！');
						return;
					}
					me.version = serverVersion;
					socketio.sendMessage("updateTemplateVersion",serverVersion);
				});
			});
		});

		templateReq.on('error',function(e){
			log.error('problem with request: ' + e.message);
			socketio.sendMessage("updateTemplateVersionErr",e.message);
		});

		templateReq.end();
	}
	//关闭数据发送
	this.closeSendData = function(){
		log.debug('关闭循环发送数据');
		var me = this;
		if(me.sendDataClock){
			clearInterval(me.sendDataClock);
			me.sendDataClock = null;
		}
		
		//将每个传感器传输数量写入文件
		fs.writeFile(me.config.sensorDelFile,JSON.stringify(me.deleteSensors),{'flag':'w'},function(err){
			if(err) return log.error('回写文件失败！');
			log.debug('删除传感器信息回写文件成功！');
		});
	}
	
	/** 初始化操作区 */
	this.Constructor = function() {// 构造方法

	}
	this.Constructor(); // 执行构造方法，初始化对象
}

module.exports = new collectorSender();