var Interceptor = require('./Interceptor');

function Before1FieldInsertInterceptor(){
	Interceptor.call(this);

	this.execute = function(ep){
		ep.putParam('ZDMC','TEST_ZDF_2016');
	};
}

module.exports = Before1FieldInsertInterceptor;