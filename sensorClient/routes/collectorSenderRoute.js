var express = require('express');
var collectorSender = require('./collectorSender');

//定义log4js的日志对象 
var log = require('../log/log4js').log();

var router = express.Router();

router.get('/auth', function(req, res, next) {
	if(!collectorSender.sendDataClock){
		var paramMap = req.query || req.params;
		//初始化模拟器接收器IP
		if(paramMap['IP']){
			collectorSender.httpOptions.host = paramMap['IP'];
		}
		//初始化模拟器接收器Port
		if(paramMap['PORT']){
			collectorSender.httpOptions.port = paramMap['PORT'];
		}
		//身份验证
		collectorSender.collectorAuth();
	}

	res.send(200);
});

router.get('/start', function(req, res, next) {
	if(!collectorSender.sendDataClock){
		var paramMap = req.query || req.params;
		
		//初始化模拟器接收器IP
		if(paramMap['IP']){
			collectorSender.httpOptions.host = paramMap['IP'];
		}
		//初始化模拟器接收器Port
		if(paramMap['PORT']){
			collectorSender.httpOptions.port = paramMap['PORT'];
		}
		//每次发送个数
		if(paramMap['NUM']){
			collectorSender.config.sendNum = parseInt(paramMap['NUM']);
		}
		//发送间隔数
		if(paramMap['INTERVAL']){
			collectorSender.config.cycleTime = parseInt(paramMap['INTERVAL']);
		}
		
		collectorSender.startSendData();
	}
	
	res.send(200);
});

router.get('/end', function(req, res, next) {
	collectorSender.closeSendData();
	res.send(200);
});

module.exports = router;
