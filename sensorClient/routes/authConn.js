/**
 * function : 用于用户认证
 * author : 郑涤非
 * time : 2016-3-2
 * version : 1.0
 */
var express = require('express');
var Engine = require('../service/Engine');
var visUtils = require('../util/visUtils');
var sensorCollector = require('../config/sensorCollector');
var socketio = require('../io/socketio');

//定义log4js的日志对象 
var log = require('../log/log4js').log();

var router = express.Router();

//处理common.ation请求
router.get('/', function(req, res, next) {
	//定义数据传输template版本
	var version = '1.0';
	var auth = req.headers['authorization'];
	if(auth){
		var clientUuid = new Buffer(auth,'base64').toString().substring(3);
		var mark = false;
		sensorCollector.forEach(function(collector){
			if(mark)return;
			if(collector['CID'] == clientUuid){
				log.debug(collector['NAME'] + '开始访问服务器。');
				mark = true;
				socketio.sendMessage('collectorSenderAuth',collector);
			}
		});
		
		if(mark){
			res.send({'success':true,msg:'鉴权通过',templateVersion:version});
		}else{
			socketio.sendMessage('collectorSenderAuthError',clientUuid);
			log.warn(clientUuid + '是无效ID，无法访问系统信息！');
			res.send({'success':false,msg:clientUuid + '鉴权失败！'});
		}
		
	}else{
		res.send({'success':false,msg:'无鉴权信息！'});
	}
	
});

module.exports = router;
