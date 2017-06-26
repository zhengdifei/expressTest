/**
 * node网络爬虫,并发控制
 * superagent,cheerio,async插件
 */
var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var async = require('async');

var app = express();

app.get('/',function(req,res){
	var cnodeURL = 'http://cnodejs.org/';
	superagent.get(cnodeURL).end(function(err,sres){
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
				href : url.resolve(cnodeURL,$element.attr('href'))
			});
		});
		var concurrencyCount = 0;
		async.mapLimit(items,10,function(item,callback){
			concurrencyCount++;
			console.log('now 并发数：' + concurrencyCount +',现在抓取的是：' + item['href']);
			superagent.get(item['href']).end(function(err,ssres){
				concurrencyCount--;
				var $$ = cheerio.load(ssres.text);
				if(ssres.text.length == 221){
					console.log(ssres.text);
				};
				var comment = $$('#reply1 .markdown-text').text().trim();
				//console.log(item['href'] + "***********"+comment);
				item['comment'] = comment;
				
				callback(null,item);
			});
		},function(err,result){
			console.log('final:');
			res.send(result);
		});
	});
});

var server = app.listen(3000,function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example listening at http://%s:%s',host,port);
})