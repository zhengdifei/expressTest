var Interceptor = require('./Interceptor');
var socketio = require('../io/socketio');
var systemObj = {
		startTime : new Date().getTime(),//系统启动时间
		totalMsg : 0,//系统接收总消息数
		cycleTime : 10000//系统循环读取时间
}

var intervalMark = null;

function startReceiveData(){
	intervalMark = setInterval(function(){
		systemObj['receiveTime'] = new Date().getTime();
		socketio.sendMessage('collectorSystemMsg',systemObj);
	},10000);
}

function After1FieldInsertInterceptor(){
	Interceptor.call(this);
	//业务方法
	this.execute = function(ep,callback){
		if(!intervalMark){
			startReceiveData();
		}
		systemObj['totalMsg'] += 1;
		socketio.sendMessage('collector',ep.getParamMap());
		callback(false);
	};
}

module.exports = After1FieldInsertInterceptor;