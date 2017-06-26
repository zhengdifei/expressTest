/**
 * function : 系统配置信息集合 
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
module.exports = {
	debug : true,		//是否调试模式，调试模型下，log4js日志默认向控制台输出
	server : {			//http服务启动配置
		port : 8080		//启动端口号
	},
	mysql_dev : {		//数据库配置
		host : 'localhost',
		port : 3306,
		user : 'root',
		password : '123456',
		database : 'flying',
		connetionLimit : 10,	
		supportBigNumbers : true
	},
	log4js : {			//log4js配置
		'appenders' : [{
			'type' : 'console','category' : 'console'	//console输出模式
		},{
			'type' : 'dateFile', 		//文件输出模式
			'filename' : 'log/',
			'pattern' : 'debug/yyyyMMddhh.txt', 
			'absolute' : false, 
			'alwaysIncludePattern' : true,
			'category' : 'file'
		}],
		'levels' : {'file' : 'DEBUG'}	//日志输出级别
	}
}