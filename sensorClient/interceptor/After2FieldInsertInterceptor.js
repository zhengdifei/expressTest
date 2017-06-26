/**
 * function : 拦截器案例二，在ep中添加数据
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var Interceptor = require('./Interceptor');

function After2FieldInsertInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep,callback){
		ep.putResult('Jijie','winner');
		callback(false);
	};
}

module.exports = After2FieldInsertInterceptor;