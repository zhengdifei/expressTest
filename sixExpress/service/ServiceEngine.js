var mongodb = require('mongodb');
var config = require('../config/config');
var ModelMap = require('../model/ModelMap');

function ServiceEngine(ep,callback){

	this.initInterceptor = function(order){
		this.interceptors = [];
		this.offset = -1;

		var command = ep['command'];
		var _inters = ModelMap[ep['command']][order] || [];

		for(var i = 0;i<_inters.length;i++){
			var _interClass = require(_inters[i]);
			this.interceptors.push(new _interClass());
		}
	};

	this.handle = function(sql,paramMap){
		var rege = /#[a-zA-Z0-9_]+#/gi;
		var paramArr = sql.match(rege);
		if(paramArr != null && paramArr.length != 0){
			for(var i = 0;i<paramArr.length;i++){
				var paramName = paramArr[i];
				var paramValue = paramMap[paramName.substring(1,paramName.length-1)];
				if(/^\d+$/.test(paramValue)){
					sql = sql.replace(paramName,paramValue);
				}else{
					sql = sql.replace(paramName,'\''+paramValue+'\'');
				}
			}
		}
		console.log(sql);
		return sql;
	};
	
	this.go = function(ep){
		var me = this;
		var objName = ep['command'].substring(0,ep['command'].indexOf('.'));
		var commandType = ep['commandType'];
		if(commandType === 'insert'){
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					me.errorResult(err);
					return;
				}

				var execObj = me.analysisParam(ModelMap[ep['command']]['field']);
				
				db.collection(objName).insertOne(execObj,function(err,result){
					if(err){
						me.errorResult(err);
						return;
					}
					ep.putResult('success',true);
					ep.putResult('data',result['ops'][0]['_id']);
					callback();
				});
			});
		}else if(commandType === 'update'){
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					me.errorResult(err);
					return;
				}

				var execFieldObj = me.analysisParam(ModelMap[ep['command']]['field']);
				
				var execConditionObj = me.analysisParam(ModelMap[ep['command']]['condition']);
				
				db.collection(objName).updateOne(execConditionObj,execFieldObj,function(err,result){
					if(err){
						me.errorResult(err);
						return;
					}
					ep.putResult('success','true');
					callback();
				});
			});
		}else if(commandType === 'delete'){
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					me.errorResult(err);
					return;
				}
				var execObj = me.analysisParam(ModelMap[ep['command']]['condition']);;

				db.collection(objName).deleteMany(execObj,function(err,result){
					if(err){
						me.errorResult(err);
						return;
					}
					ep.putResult('success',true);
					callback();
				});
			});
		}else if(commandType === 'object'){
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					me.errorResult(err);
					return;
				}
				var execObj = me.analysisParam(ModelMap[ep['command']]['condition']);
				
				db.collection(objName).findOne(execObj,function(err,doc){
					if(err){
						me.errorResult(err);
						return;
					}
					ep.putResult('success',true);
					ep.putResult('data',doc);
					callback();
				});
			});
		}else if(commandType === 'list'){
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					me.errorResult(err);
					return;
				}
				
				db.collection(objName).find().toArray(function(err,docs){
					if(err){
						me.errorResult(err);
						return;
					}
					ep.putResult('success',true);
					ep.putResult('data',docs);
					callback();
				});
			});
		}else if(commandType === 'map'){
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					me.errorResult(err);
					return;
				}
				
				db.collection(objName).find().toArray(function(err,docs){
					if(err){
						me.errorResult(err);
						return;
					}
					ep.putResult('success',true);
					ep.putResult('data',docs);
					callback();
				});
			});
		}else if(commandType === 'space'){
			
		}else{
			
		}
	};
	
	this.execute = function(order) {
		var me = this;
		console.log('execute start');
		if(this.interceptors == null){
			this.initInterceptor(order);
		}
		this.offset++;

		if (this.interceptors != null && this.offset < this.interceptors.length) {
			this.interceptors[this.offset]['intercept'](this,ep);
		}

		if(order == 'before'){
			console.log('serviceEngine execute');
			var command = ep['command'];
			ep['commandType'] = ModelMap[ep['command']]['etype'] || '';
			this.go(ep);
			console.log('serviceEngine execute end');
		}else if(order == 'after'){
			callback(false,ep);
		}
	};
	
	this.analysisParam = function(analysisObj){
		var resultObj = {};
		if(typeof analysisObj == 'string'){
			if(analysisObj == '_id'){
				resultObj['_id'] = new mongodb.ObjectID(ep.getParam('_id'));
			}
		}else if(typeof analysisObj == 'object'){
			if(analysisObj instanceof Array){
				for(var i in analysisObj){
					if(typeof analysisObj[i] == 'string'){
						if(ep.getParam(analysisObj[i]) != null){
							resultObj[analysisObj[i]] = ep.getParam(analysisObj[i]);
						}
					}else if(typeof analysisObj[i] == 'object'){
						var otherResultObj = this.analysisParam(analysisObj[i]);
						for(var key in otherResultObj){
							resultObj[key] = otherResultObj[key];
						}
					}
				}
			}else{
				for(var key in analysisObj){
					if(analysisObj[key] == '#'){
						if(ep.getParam(key) != null){
							resultObj[key] = ep.getParam(key);
						}
					}else if(typeof analysisObj[key] == 'object'){
						var otherResultObj = this.analysisParam(analysisObj[key]);
						if(otherResultObj != null && otherResultObj.toString() != '{}'){
							resultObj[key] = otherResultObj;
						}
					}else{
						resultObj[key] = analysisObj[key];
					}
				}
			}
		}
		
		return resultObj;
	};
	
	this.errorResult = function(err){
		ep.putResult('success',false);
		ep.putResult('msg',err);
		callback();
	};
	
	/** 初始化操作区 */
	this.Constructor = function() {// 构造方法
		//初始化
		this.execute('before');
	}

	this.Constructor();
}

module.exports = ServiceEngine;