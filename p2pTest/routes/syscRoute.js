/**
 * function : 专用于处理common.action的ajax请求，返回json格式字符串
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var express = require('express');

const config = require('../config/config.js')
const fs = require('fs')
//定义log4js的日志对象 
var log = require('../log/log4js').log();

var router = express.Router();

//处理common.ation的get请求
router.get('/', function(req, res, next) {
	handle(req, res, next);
});

//处理common.ation的post请求
router.post('/', function(req, res, next) {
    handle(req, res, next);
});

/*
 * 处理common.action请求通用方法
 */
function handle(req,res,next){
	let port = req.query['port'] || req.param['port'];
	console.log(port)
	let result = {}
	if(port == null){
		result['success'] = false;
		result['msg'] = '缺少参数';
		res.send(result);
	}else {
		result["success"] = true;
		remoteIp = req.client.remoteAddress;
		mark = true;
		config.p2p.forEach((one) => {
			if(one['ip'] == remoteIp && one['port'] == parseInt(port)){
				mark = false;
			}
		})
		if(mark){
			config.p2p.push({
				ip : remoteIp,
				port : parseInt(port)
			})

            fs.writeFile('../config/config.js', "module.exports = " + JSON.stringify(config), {'encoding': 'utf8','flag':'w'})
		}

		result['data'] = config.p2p;
		res.send(result)
	}

}

module.exports = router;