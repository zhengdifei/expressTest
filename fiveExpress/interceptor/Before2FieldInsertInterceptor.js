var Interceptor = require('./Interceptor');

function Before2FieldInsertInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep){
		ep.putParam('ZDLX','varchar');
	};
}

module.exports = Before2FieldInsertInterceptor;