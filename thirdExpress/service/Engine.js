var ServiceEngine = require('./ServiceEngine');

exports.execute = function(ep,callback){
	var service = new ServiceEngine(ep,callback);
}