var express = require('express');
var Engine = require('../service/Engine');
var visUtils = require('../util/visUtils');

var router = express.Router();

router.get('/', function(req, res, next) {

	var ep = visUtils.handleReq(req);
	
	Engine.execute(ep,function(err){
		if(err){
			res.send({success:false,msg:'query failed'});
			return;
		}
		ep['resultMap']['success'] = true;
		res.send(ep['resultMap']);
	});
});

module.exports = router;
