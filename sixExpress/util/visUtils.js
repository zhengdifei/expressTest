var EngineParameter = require("../service/EngineParameter");

exports.handleReq = function(req){
	var command = req.query['command'] || req.param['command'];
	var ep = new EngineParameter(command);
	var _paramMap = req.query || req.param;
	delete _paramMap['command'];
	ep.setParamMap(_paramMap);
	
	return ep;
}
