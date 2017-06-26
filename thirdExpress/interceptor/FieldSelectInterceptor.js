var Interceptor = require('./Interceptor');

function FieldSelectInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep){
		console.log('FieldSelectInterceptor execute!');
	};
}

module.exports = FieldSelectInterceptor;