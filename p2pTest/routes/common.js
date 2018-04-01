/**
 * function : 专用于处理common.action的ajax请求，返回json格式字符串
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var express = require('express');
var Engine = require('../service/Engine');
var visUtils = require('../util/visUtils');
//定义log4js的日志对象 
var log = require('../log/log4js').log();

var router = express.Router();

//处理common.ation的get请求
router.get('/', function(req, res, next) {
	handleCommon(req, res, next);
});

//处理common.ation的post请求
router.post('/', function(req, res, next) {
	handleCommon(req, res, next);
});

/*
 * 处理common.action请求通用方法
 */
function handleCommon(req,res,next){
	/*
	 * 输入：request对象
	 * 输出：无异常，输出EngineParameter对象；异常，抛出异常对象。
	 * 处理request传入数据，在回调函数中执行Engine.execute方法。
	 */
	visUtils.handleReq(req,function(err,ep){
		if(err){
			log.error(ep);
			return res.send({success:false,msg:'构建EngineParameter函数出错。'});
		}
		//执行业务方法
		Engine.execute(ep,function(err,errMsg,se){
			if(err){
				if(se != null && typeof se == 'object'){ se['callbackMark'] = true; };
				
				return res.send({success:false,msg:errMsg});
			}
			ep['resultMap']['success'] = true;
			res.send(ep['resultMap']);
		});
	});
}

module.exports = router;