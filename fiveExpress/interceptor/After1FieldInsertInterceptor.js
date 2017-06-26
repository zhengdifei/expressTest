var Interceptor = require('./Interceptor');

function After1FieldInsertInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep){
		ep.putResult('Tianqi','good');
	};
}

module.exports = After1FieldInsertInterceptor;