/**
 * node网络爬虫
 * superagent，cheerio插件
 */
var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');

var app = express();

app.get('/',function(req,res){
	superagent.get('http://cnodejs.org/').end(function(err,sres){
		if(err){
			res.send('error');
			return;
		}
		
		var $ = cheerio.load(sres.text);
		var items = [];
		$('#topic_list .topic_title').each(function(idx,element){
			var $element = $(element);
			items.push({
				title : $element.attr('title'),
				href : $element.attr('href')
			});
		});
		
		res.send(items);
	});
});

var server = app.listen(3000,function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example listening at http://%s:%s',host,port);
})