/**
 * function : 拦截器案例三，在ep中添加数据
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var Interceptor = require('./Interceptor');

function Before1FieldInsertInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep,callback){
		ep.putParam('ZDMC','TEST_ZDF_2016');
		callback(false);
		//callback(true,'传入了异常类型');
	};
}

module.exports = Before1FieldInsertInterceptor;