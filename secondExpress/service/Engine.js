var ServiceEngine = require('./ServiceEngine');

exports.execute = function(ep,callback){
	//��ʼ��
	delete ep['paramMap']['command'];
	ep['resultMap'] = {};

	var service = new ServiceEngine(ep,callback);
}