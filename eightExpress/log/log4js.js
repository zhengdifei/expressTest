/**
 * function : log4js初始化类
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var log4js = require('log4js');
var config = require('../config/config');

log4js.configure(config.log4js);
//统一模式
var selfCategory = null;
//调试模式开启，默认在控制台输出消息
if(config.debug){
	selfCategory = 'console';
}
/*
 * log日志对象有：info，warn，debug，error等方法，输出不同级别的日志
 * category : 日志输出模式，默认有两种【console,file】
 */
exports.log  = function(category){
	//以用户输出模式优先
	if(category) selfCategory = category;
	//用户传递空，则系统默认模式优先
	return log4js.getLogger(category || selfCategory);
};

/*
 * log4js与express集成，输出请求日志
 */
exports.use = function(app,category){
	//以用户输出模式优先
	if(!category && selfCategory) category = selfCategory;
	//页面请求日志, level用auto时,默认级别是WARN，默认level是debug
	app.use(log4js.connectLogger(log4js.getLogger(category),{level:'debug',format:':method :url'}));
}
