/**
 * funciton:模拟传感器，使用http协议想采集器发送信息
 * author : 郑涤非
 * time : 2016-3-1
 * version : 1.0
 */
var fs = require('fs');
var http = require('http');
var UUID = require('./util/UUID');
var EventEmitter = require('events');
var util = require('util');
//定义log4js的日志对象 
var log = require('./log/log4js').log();

//系统配置信息
var config = {
		sensorFile : 'config/sensor.json',//本地文件路径
		cycleTime : 10000//每30s,发送一次数据
}
//服务器配置
var httpOptions = {
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
 * 创建自定义事件,用于文件生成完毕，触发数据发送事件
 */
function MyEvent(){};

util.inherits(MyEvent,EventEmitter);

var newEvent = new MyEvent();

//根据启动时，传入参数进行初始化
var isNew = process.argv[2];
//默认，生成100个传感器，同时传递数据
if(!isNew){
	var sensorNum = 99;
	var sensorArray = [];

	for(var i =0;i<sensorNum;i++){
		sensorArray.push(i);
	}
	createSensor(sensorNum,sensorArray);
//读取本地传感器配置文件，发送数据
}else if(isNew == 'send'){
	readSensor();
//根据传入传感器数量，从新生成传感器，发送数据
}else if(isNew == 'new'){
	var sensorNum = 99;
	var sensorArray = [];
	//根据系统参数初始化
	if(process.argv[3]){
		sensorNum = process.argv[3] - 1;
	}
	
	for(var i =0;i<sensorNum;i++){
		sensorArray.push(i);
	}
	
	createSensor(sensorNum,sensorArray);
}else{
	log.debug('参数有误！');
}

//传感器创建完成开始传递数据
newEvent.on('create_sensor_complete',function(){
	readSensor();
});

/*
 * 生成传感器，存入本地文件
 * sensorNum:生成传感器数量
 * sensorArray：虚集合，用于遍历
 */ 
function createSensor(sensorNum,sensorArray){
	fs.writeFileSync(config.sensorFile,'[',{'flag':'w'});
	
	var count = 0;
	sensorArray.forEach(function(i){
		var sensorObj = {'SID' : UUID(),'SNAME' : 'VIS-SENSOR-'+i};
		fs.writeFile(config.sensorFile, JSON.stringify(sensorObj)+',',{'flag':'a'},function(err){
			count++;
			if(count == (sensorNum-1)){
				var lastSensor = {'SID' : UUID(),'SNAME' : 'VIS-SENSOR-'+ sensorNum};
				fs.writeFile(config.sensorFile,JSON.stringify(lastSensor)+']',{'flag':'a'},function(err){
					log.debug((sensorNum + 1)+' 个传感器创建完成!');
					//触发下一个事件
					newEvent.emit('create_sensor_complete');
				});
			}
		});
	});
}
/*
 * 读取本地传感器数据，发送数据
 */
function readSensor(){
	log.debug('正在打开传感器配置文件【'+config.sensorFile+'】');
	fs.readFile(config.sensorFile,'utf-8',function(err,data){
		if(err){
			return log.error('打开 '+ config.sensorFile + ' 出错！');
		}
		var sensors = JSON.parse(data);
		
		setInterval(function(){
			sendData(sensors);
		},config.cycleTime);
	});
}

/*
 * 遍历传感器，发送数据
 * sensors:传感器集合
 */
function sendData(sensors){
	
	sensors.forEach(function(s){
		var electricDate = s;
		electricDate['UA'] = twoDecima(60.00 + Math.random());
		electricDate['UB'] = twoDecima(60.00 + Math.random());
		electricDate['UC'] = twoDecima(60.00 + Math.random());
		electricDate['IA'] = twoDecima(1.00 + Math.random());
		electricDate['IB'] = twoDecima(1.00 + Math.random());
		electricDate['IC'] = twoDecima(1.00 + Math.random());
		electricDate['JUA'] = twoDecima(Math.random());
		electricDate['JUB'] = twoDecima(120 + Math.random());
		electricDate['JUC'] = twoDecima(240 + Math.random());
		electricDate['JIA'] = twoDecima(4 + Math.random());
		electricDate['JIB'] = twoDecima(120 + Math.random());
		electricDate['JIC'] = twoDecima(120 + Math.random());


		httpOptions['path'] = '/common.action?command=sensorData.insert';
		httpOptions['method'] = 'POST';
		var sendReq = http.request(httpOptions,function(res){
			log.debug('Send data STATUS: ' + res.statusCode);
			
			res.on('data',function(chunk){
				var resultObj = JSON.parse(chunk.toString());
				if(resultObj['success']){
					log.debug(s['SNAME'] + '传输数据成功！');
				}else{
					log.warn(resultObj['msg']);
				}
			});
		});

		sendReq.on('error',function(e){
			log.error('problem with request: ' + e.message);
		});

		sendReq.write(JSON.stringify(electricDate));

		sendReq.end();
	});
}
/*
 * 用正则的方式，保留小数点后两位
 */
function twoDecima(num){
	var rege = /([0-9]+.[0-9]{2})[0-9]*/;
	return num.toString().replace(rege,"$1");
}