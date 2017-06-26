/**
 * function : 所有业务方法的执行入口
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var ServiceEngine = require('./ServiceEngine');
//定义log4js的日志对象 
var log = require('../log/log4js').log();
/*
 *输入：EngineParameter对象
 *由ServiceEngine执行具体的业务方法 
 */
exports.execute = function(ep,callback){
	//当不传递默认处理方法时
	if(callback == null){
		//定义默认回调函数
		var callback = function(err,msg,se){
			if(err){
				if(se != null && typeof se == 'object'){ se['callbackMark'] = true; };
				log.error('执行: ' + ep['command'] + ' 出错 ; 错误信息: ' + msg + '; 参数信息 : ' + ep['paramMap']);
			}
		}
	}
	//执行
	var service = new ServiceEngine(ep,callback);
}