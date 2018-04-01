/**
 * function : 拦截器案例一，在ep中添加数据
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var Interceptor = require('./Interceptor');

function After1FieldInsertInterceptor(){
	Interceptor.call(this);
	//业务方法
	this.execute = function(ep,callback){
		ep.putResult('Tianqi','good');
		callback(false);
		//callback(true,'后拦截器1错误');
	};
}

module.exports = After1FieldInsertInterceptor;