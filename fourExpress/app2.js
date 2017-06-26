/**
 * node网络爬虫
 * superagent,cheerio,eventproxy插件
 */
var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');
var url = require('url');

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
		//使用计数的方式，实现异步输出
		var count = 0;
		items.forEach(function(item){
			superagent.get(item['href']).end(function(err,ssres){
				var $$ = cheerio.load(ssres.text);
				if(ssres.text.length == 221){
					console.log(ssres.text);
				};
				var comment = $$('#reply1 .markdown-text').text().trim();
				console.log(item['href'] + "***********"+comment);
				item['comment'] = comment;
				count++;
				if(count == items.length){
					//console.log(items);
					res.send(items);
				}
			});
		});
		
		//通过eventproxy实现异步输出
		/*
		var ep = new eventproxy();
		
		ep.after('topic_html',items.length,function(itemArr){
			console.log(itemArr);
			res.send(itemArr);
		});
		
		items.forEach(function(item){
			superagent.get(item['href']).end(function(err,sssres){
				var $ = cheerio.load(sssres.text);
				var comment = $('#reply1 .markdown-text').text().trim();
				console.log(item['href'] + "***********"+comment);
				item['comment'] = comment;
				ep.emit('topic_html',item);
			});
		});
		*/
	});
});

var server = app.listen(3000,function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example listening at http://%s:%s',host,port);
})