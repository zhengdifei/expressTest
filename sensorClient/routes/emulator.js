/**
 * funciton:模拟传感器，使用http协议想采集器发送信息
 * author : 郑涤非
 * time : 2016-3-1
 * version : 1.0
 */
var fs = require('fs');
var http = require('http');
var UUID = require('../util/UUID');
var visUtils = require('../util/visUtils');
var MyEvent = require('../event/MyEvent');
var socketio = require('../io/socketio');
//定义log4js的日志对象 
var log = require('../log/log4js').log();

function emulator(){
	//传感器集合
	this.sensors = null;
	//循环执行器
	this.intervals = {};
	//每次循环的系统信息
	this.systemMsg = {};
	//当前状态
	this.type = null;
	//系统配置信息
	this.config = {
			sensorFile : 'config/sensor.json',//本地文件路径
			cycleTime : 10000,//每30s,发送一次数据
			sensorNum : 100//初始化传感器数量
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
				'user-agent' : 'nodejs client'
			}
	}
	/*
	 * 生成传感器，存入本地文件
	 * sensorNum:生成传感器数量
	 * sensorArray：虚集合，用于遍历
	 */ 
	this.createSensor = function(){
		var me = this;
		var sensorArray = [];

		for(var i =0;i<me.config.sensorNum-1;i++){
			sensorArray.push(i);
		}
		
		fs.writeFileSync(me.config.sensorFile,'[',{'flag':'w'});
		
		var count = 0;
		sensorArray.forEach(function(i){
			var sensorObj = {'SID' : UUID(),'SNAME' : 'VIS-SENSOR-'+i,'COUNT' : 0};
			fs.writeFile(me.config.sensorFile, JSON.stringify(sensorObj)+',',{'flag':'a'},function(err){
				count++;
				if(count == (me.config.sensorNum-2)){
					var lastSensor = {'SID' : UUID(),'SNAME' : 'VIS-SENSOR-' + (me.config.sensorNum-1),'COUNT' : 0};
					fs.writeFile(me.config.sensorFile,JSON.stringify(lastSensor)+']',{'flag':'a'},function(err){
						log.debug((me.config.sensorNum)+' 个传感器创建完成!');
						//触发下一个事件
						me.readSensor();
					});
				}
			});
		});
	}
	/*
	 * 读取本地传感器数据，发送数据
	 */
	this.readSensor = function(){
		var me = this;
		log.debug('正在打开传感器配置文件【'+me.config.sensorFile+'】');
		//当已经从文件中读取了数据
		if(!me.sensors){
			fs.readFile(me.config.sensorFile,'utf-8',function(err,data){
				if(err){
					return log.error('打开 '+ me.config.sensorFile + ' 出错！');
				}
				me.sensors = JSON.parse(data);
				
				me.sensors.forEach(function(s){
					me.intervals[s['SID']] = setInterval(function(){
						me.sendData(s);
					},Math.round(Math.random()*me.config.cycleTime));
				});
				
			});
		}else{
			me.sensors.forEach(function(s){
				me.intervals[s['SID']] = setInterval(function(){
					me.sendData(s);
				},Math.round(Math.random()*me.config.cycleTime));
			});
		}
		
	}
	/*
	 * 一个传感器发送数据
	 */
	this.oneSendData = function(SID){
		var me = this;
		
		if(me.sensors){
			me.sensors.forEach(function(s){
				if(s['SID'] == SID){
					me.intervals[s['SID']] = setInterval(function(){
						me.sendData(s);
					},Math.round(Math.random()*me.config.cycleTime));
				}
			})
		}
	}
	/*
	 * 遍历传感器，发送数据
	 * sensors:传感器集合
	 */
	this.sendData = function(sensor){
		var me = this;
		var sensorData = {};
		sensorData['SID'] = sensor['SID'];
		sensorData['SNAME'] = sensor['SNAME']; 
		sensorData['UA'] = me.twoDecima(60.00 + Math.random());
		sensorData['UB'] = me.twoDecima(60.00 + Math.random());
		sensorData['UC'] = me.twoDecima(60.00 + Math.random());
		sensorData['IA'] = me.twoDecima(1.00 + Math.random());
		sensorData['IB'] = me.twoDecima(1.00 + Math.random());
		sensorData['IC'] = me.twoDecima(1.00 + Math.random());
		sensorData['JUA'] = me.twoDecima(Math.random());
		sensorData['JUB'] = me.twoDecima(120 + Math.random());
		sensorData['JUC'] = me.twoDecima(240 + Math.random());
		sensorData['JIA'] = me.twoDecima(4 + Math.random());
		sensorData['JIB'] = me.twoDecima(120 + Math.random());
		sensorData['JIC'] = me.twoDecima(120 + Math.random());

		me.httpOptions['path'] = '/common.action?command=sensorData.insert';
		me.httpOptions['method'] = 'POST';
		var sendReq = http.request(me.httpOptions,function(res){
			log.debug('Send data STATUS: ' + res.statusCode);
			
			res.on('data',function(chunk){
				var resultObj = JSON.parse(chunk.toString());
				if(resultObj['success']){
					//系统信息
					me.systemMsg["totalMsg"] += 1;
					me.systemMsg['endTime'] = new Date().getTime();
					//传感器累加
					++sensor['COUNT'];
					sensorData['COUNT'] = sensor['COUNT'];
					//向客户端发送信息
					socketio.sendMessage('emulator',{'sensorData' : sensorData,'systemMsg' : me.systemMsg,'type' : me.type});
				
					log.debug(sensorData['SNAME'] + '传输数据成功！');
				}else{
					log.warn(resultObj['msg']);
				}
			});
		});

		sendReq.on('error',function(e){
			log.error('problem with request: ' + e.message);
			me.systemMsg["errorMsg"] += 1;
			socketio.sendMessage('emulatorError',sensorData['SNAME'] + e.message);
		});
		
		sendReq.write(JSON.stringify(sensorData));

		sendReq.end();
	}
	/*
	 * 用正则的方式，保留小数点后两位
	 */
	this.twoDecima = function(num){
		var rege = /([0-9]+.[0-9]{2})[0-9]*/;
		return num.toString().replace(rege,"$1");
	}
	/*
	 * 关闭数据发送
	 */
	this.closeSendData = function(sid){
		var me = this;
		if(sid){
			clearInterval(me.intervals[sid]);
			delete me.intervals[sid];
		}else{
			if(!visUtils.isEmptyObject(me.intervals)){
				for(var i in me.intervals){
					clearInterval(me.intervals[i]);
				}
				me.intervals = {};
			}
		}
		//将每个传感器传输数量写入文件
		fs.writeFile(me.config.sensorFile,JSON.stringify(me.sensors),{'flag':'w'},function(err){
			if(err) return log.error('回写文件失败！');
			log.debug('传感器信息回写文件成功！');
		});
	}
	/*
	 * 初始化方法
	 * type:类型
	 * num：数量 
	 */
	this.init = function(type){
		var me = this;
		//给类型赋值
		me.type = type;
		
		if(type == 'new'){//根据传入传感器数量，从新生成传感器，发送数据，默认，生成100个传感器，同时传递数据
			//传感器集合初始化
			me.sensors = null;
			//循环执行初始化
			me.intervals = {};
			//创建传感器
			me.createSensor();
		}else if(type == 'send'){//读取本地传感器配置文件，发送数据
			me.readSensor();
		}else{
			log.debug('参数有误！');
		}
	}
	/** 初始化操作区 */
	this.Constructor = function() {// 构造方法
	}
	this.Constructor(); // 执行构造方法，初始化对象
}

module.exports = new emulator();