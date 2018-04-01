/**
 *function : visNode主函数
 * express版
 * MongoDB数据库
 * Engine实现
 * 
 * 平台优化版
 * 日志支持
 * 
 * debug morgan差异：
 * 1：morgan打印nodejs服务器接受的请求信息
 * 2：debug打印是开发者自己在控制台打印的信息，它是代替console.log的存在。
 * 3：可以打印信息来自哪个模块，在发布到外网的情况下，用发布模式，debug信息不显示。
 * 4：express默认使用debug模块打印日志信息。
 * 
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var common = require('./routes/common');
var syscRoute = require('./routes/syscRoute');
var config = require('./config/config.js');
var ejs = require('ejs');

const init = require('./init')
//引入express框架
var app = express();

//定义log4js的日志对象 
var log = require('./log/log4js').log();
//express与log4js集成
require('./log/log4js').use(app);

//使用ejs模板，文件后缀是html
app.set('views', path.join(__dirname, 'views'));
app.engine('html',ejs.__express);
app.set('view engine', 'html');

//request请求初始化方法
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//注册common.action路径
app.use('/sysc', syscRoute);

//注册common.action路径
app.use('/common.action', common);

//注册/路径
app.get('/',function(req,res){
	res.render('index', { title: 'Express',message : 'hello world!'});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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