var express = require('express');
var router = express.Router();

router.use(function timeLog(req,res,next){
	console.log('Time:',Date.now());
	next();
});

router.get('/',function(req,res){
	res.send('birds home');
});

router.get('/about',function(req,res){
	res.send('birds about');
});

module.exports = router;