var express = require('express');
var emulator = require('./emulator');
var visUtils = require('../util/visUtils');
//定义log4js的日志对象 
var log = require('../log/log4js').log();

var router = express.Router();

router.get('/start', function(req, res, next) {
	var type = 'new';
	
	if(visUtils.isEmptyObject(emulator.intervals)){
		var paramMap = req.query || req.params;
		//判断是否发送，或者重新创建sensor
		if(emulator.systemMsg['startTime']){
			if(!paramMap['NUM'] || parseInt(paramMap['NUM']) == emulator.config.sensorNum){
				type = 'send';
			}
		}
		//初始化模拟器接收器IP
		if(paramMap['IP']){
			emulator.httpOptions.host = paramMap['IP'];
		}
		//初始化模拟器接收器Port
		if(paramMap['PORT']){
			emulator.httpOptions.port = paramMap['PORT'];
		}
		//初始化模拟器接收器IP
		if(paramMap['NUM']){
			emulator.config.sensorNum = parseInt(paramMap['NUM']);
			emulator.systemMsg['sensorNum'] = parseInt(paramMap['NUM']);
		}
		//初始化模拟器接收器Port
		if(paramMap['INTERVAL']){
			emulator.config.cycleTime = parseInt(paramMap['INTERVAL']);
			emulator.systemMsg['cycleTime'] = parseInt(paramMap['INTERVAL']);
		}
		//初始化系统时间
		if(!emulator.systemMsg['startTime']){
			emulator.systemMsg['startTime'] = new Date().getTime();
			emulator.systemMsg['totalMsg'] = 0;
			emulator.systemMsg['errorMsg'] = 0;	
			emulator.systemMsg['sensorNum'] = emulator.config.sensorNum;
			emulator.systemMsg['cycleTime'] = emulator.config.cycleTime;
		}
		
		emulator.init(type);
	}
	res.send(type);
});

router.get('/start/one', function(req, res, next) {
	var paramMap = req.query || req.params;
	
	emulator.oneSendData(paramMap['SID']);
	
	res.send(200);
});

router.get('/end', function(req, res, next) {
	var paramMap = req.query || req.params;
	
	emulator.closeSendData(paramMap['SID']);
	
	res.send(200);
});
module.exports = router;
