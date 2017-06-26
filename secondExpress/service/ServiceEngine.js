var db = require('../db/database');
var ModelMap = require('../model/ModelMap');
var interceptor1 = require('../interceptor/FieldInsertInterceptor');
var interceptor2 = require('../interceptor/FieldSelectInterceptor');

function ServiceEngine(ep,callback){
	this.interceptors = null;
	this.offset = -1;

	this.initInterceptor = function(){
		var command = ep['command'];
		
		console.log(ModelMap[ep['command']]['interceptors']);
		this.interceptors = [];

		this.interceptors.push(interceptor1);
		this.interceptors.push(interceptor2);
	};

	this.handle = function(sql,paramMap){
		var rege = /#[a-zA-Z0-9_]+#/gi;
		var paramArr = sql.match(rege);
		if(paramArr != null && paramArr.length != 0){
			for(var i = 0;i<paramArr.length;i++){
				var paramName = paramArr[i];
				sql = sql.replace(paramName,paramMap[paramName.substring(1,paramName.length-1)])
			}

		}
		console.log(sql);
		return sql;
	};

	this.execute = function() {
		var me = this;
		console.log('execute start');
		if(this.interceptors == null){
			this.initInterceptor();
		}
		this.offset++;

		if (this.interceptors != null && this.offset < this.interceptors.length) {
			this.interceptors[this.offset]['intercept'](this,ep);
		}else{
			console.log('serviceEngine execute');
			db.pool.getConnection(function(err,connection){
				if(err){
					callback(true,ep);
					return;
				}
				
				connection.query(me.handle(ModelMap[ep['command']]['sql'],ep['paramMap']),function(err,result){
					if(err){
						callback(true,ep);
						return;
					}
					ep['resultMap']['data'] = result;
					callback(false,ep);
				});
			});
			console.log('serviceEngine execute end');
		}
		
	};

	this.execute();
}

module.exports = ServiceEngine;