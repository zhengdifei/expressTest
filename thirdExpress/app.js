/**
 * express版
 * mongodb数据库
 * Engine实现
 * 
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');

var routes = require('./routes/index');
var users = require('./routes/users');
var birds = require('./routes/birds');

var T_BASE_FIELD = require('./model/T_BASE_FIELD.js');
var dao = require('./dao/BaseDao.js');

var Engine = require('./service/Engine');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.engine('ntl',function(filePath,options,callback){
	fs.readFile(filePath,function(err,content){
		if(err) return callback(new Error(err));

		var rendered = content.toString().replace('#title#','<title>'+options.title+'</title>')
			.replace('#message#','<h1>'+options.message+'</h1>');
		return callback(null,rendered);
	});
});
app.set('view engine','ntl');
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('css'));
//app.use('/static',express.static('public'));
//app.use('/static',express.static('css'));

app.all('/',function(req,res,next){
	console.log('Access this method!');
	next();
});

app.get('/abc',function(req,res){
	res.send('/abc');
});

app.get('/abc.html',function(req,res){
	res.send('/abc.html');
});


app.get('/ab?cd',function(req,res){
	res.send('/ab?cd');
});

app.get('/ab+cd',function(req,res){
	res.send('/ab+cd');
});

app.get('/ab*cd',function(req,res){
	res.send('/ab*cd');
});

app.get(/common.action$/,function(req,res){
	res.send('/common.action$/');
});

app.get('/zdf',function(req,res,next){
	//res.send('first step');
	if(req.query.id == 1)next('route');
	
	else {
		console.log('first step')
		next();
	};
},function(req,res,next){
	console.log('second step');
	//res.send('second step');
	next();
});

app.get('/zdf',function(req,res,next){
	console.log('third step');
	res.send('third step')
});

var cb0 = function(req,res,next){
	console.log('CB0');
	//next(new Error('my error'));
	next('route');
}
var cb1 = function(req,res,next){
	console.log('CB1');
	next();
}
var cb2 = function(req,res,next){
	console.log('CB2');
	res.send('hello cb2');
	//next();
}

app.get('/zdf1',[cb0,cb1,cb2]);

app.get('/zdf2',function(req,res,next){
	var sql = T_BASE_FIELD[req.query['command']];
	var paramMap = req.query || req.param;
	dao.execute(sql,paramMap,function(err,resultMap){
		if(err){
			res.send({success:false,msg:'query failed'});
			return;
		}
		res.send(resultMap);
	});
});

app.get('/zdf3',function(req,res,next){
	var ep = {};
	ep['command'] = req.query['command'];
	ep['paramMap'] = req.query || req.param;
	Engine.execute(ep,function(err){
		if(err){
			res.send({success:false,msg:'query failed'});
			return;
		}
		res.send(ep['resultMap']);
	});
});

app.use('/', routes);
app.use('/users', users);
app.use('/birds',birds);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
function logErrors(err,req,res,next){
	console.log(err.stack);
	console.log('logErrors');
	req.status(404).send("couldn't find the page!");
}

function clientErrorHandler(err,req,res,next){
	if(req.xhr){
		res.status(500).send({error:'something blew up!'});
	}else{
		console.log('clientErrorHandler');
		next(err);
	}
}

app.use(logErrors);
app.use(clientErrorHandler);

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;