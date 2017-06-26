/**
 * function : 拦截器父类，限定拦截器格式，将业务代码限制固定的范围，方便调试和维护
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
function Interceptor(){
	//回调函数
	this.intercept = function(serviceEngine,ep){
		//放置某层迭代出现异常
		if(serviceEngine['callbackMark']) return;
		//标记当前执行拦截器下标，为拦截器执行结束时，提供日志信息
		var offset = serviceEngine.offset;
		/*
		 * 业务执行方法
		 * 回调函数作用：未出现异常时，进行迭代运行
		 */
		this.execute(ep,function(err,errMsg){
			if(err){
				serviceEngine['callbackMark'] = true;
				return serviceEngine['execute'](errMsg);
			}
			serviceEngine['execute'](offset);
		});
	}
}
module.exports = Interceptor;