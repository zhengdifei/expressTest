var Interceptor = require('./Interceptor');

function After2FieldInsertInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep){
		ep.putResult('Jijie','winner');
	};
}

module.exports = After2FieldInsertInterceptor;