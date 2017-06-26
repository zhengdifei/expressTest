var Interceptor = require('./Interceptor');

function FieldInsertInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep){
		console.log('FieldInsertInterceptor execute!');
	};
}

module.exports = FieldInsertInterceptor;