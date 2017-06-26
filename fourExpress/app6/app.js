/**
 * 通过命令行生成express应用
 */
var express = require('express');
var app = express();
console.log(app);
app.get('/',function(req,res){
	res.send('Hello World1');
});  

var server = app.listen(3000,function(){
	console.log(server);
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example listening at http://%s:%s',host,port);
})