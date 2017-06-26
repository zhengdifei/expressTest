/**
 * function : 业务执行方法，每条业务对应一个ServiceEngine实例
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var db = require('../db/database');
var ModelMap = require('../model/ModelMap');
//定义log4js的日志对象 
var log = require('../log/log4js').log();

function ServiceEngine(ep,callback){
	/*
	 * nodejs中，回调函数+迭代使用，使得程序深度很深。
	 * 当某个深度出现异常时，我需要一个机制让程序跳出所有迭代，到达最上层，余下代码不执行。
	 * 基于这个原理，我设计一个ServiceEngine一个属性，执行操作之前，先判断一下callbackMark=true，
	 * 如果callbackMark为真，说明程序中出现异常，否则顺利执行。
	 * 
	 */
	this.callbackMark = false;
	/*
	 * 输入：order[before|after]
	 * 根据标识，初始化前拦截器，后拦截器
	 */
	this.initInterceptor = function(order){
		try{
			this.interceptorsName = [];
			this.interceptors = [];
			this.offset = -1;	//拦截器执行计数器
			
			//获取拦截器
			var command = ep['command'];
			var _inters = ModelMap[ep['command']][order] || [];
			
			//实例化连接器，放入连接器数值集合
			for(var i = 0;i<_inters.length;i++){
				this.interceptorsName.push(_inters[i]);
				var _interClass = require(_inters[i]);
				this.interceptors.push(new _interClass());
			}
		}catch(err){
			callback(true,err,this);
		}
	};
	/*
	 * mongoDB的数据操作方法集合
	 */
	this.go = function(){
		var me = this;
		var objName = ep['command'].substring(0,ep['command'].indexOf('.'));//mongo操作的对象
		//mongo操作类型（insert,update,delete,findone,find）,根据配置文件进行选择
		var commandType = ModelMap[ep['command']]['etype'] || '';
		if(commandType === 'insert'){//添加
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					return callback(true,'connection error',me);
				}
				//处理json对象，获取field属性
				var execObj = me.analysisParam(ModelMap[ep['command']]['field']);
				if(this.callbackMark) return;
				
				db.collection(objName).insertOne(execObj,function(err,result){
					if(err){
						return callback(true,'insert error',me);
					}
					log.debug(objName + '：添加数据成功');
					ep.putResult('data',result['ops'][0]['_id']);
				});
			});
		}else if(commandType === 'update'){//更新
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					return callback(true,'connection error',me);
				}
				//更新数据
				var execFieldObj = me.analysisParam(ModelMap[ep['command']]['field']);
				if(this.callbackMark) return;
				//更新条件
				var execConditionObj = me.analysisParam(ModelMap[ep['command']]['condition']);
				if(this.callbackMark) return;
				
				db.collection(objName).updateOne(execConditionObj,execFieldObj,function(err,result){
					if(err){
						return callback(true,'update error',me);
					}
					log.debug(objName + '：更新数据成功');
				});
			});
		}else if(commandType === 'delete'){//删除
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					return callback(true,'connection error',me);
				}
				//删除条件
				var execObj = me.analysisParam(ModelMap[ep['command']]['condition']);
				if(this.callbackMark) return;
				
				db.collection(objName).deleteMany(execObj,function(err,result){
					if(err){
						return callback(true,'delete error',me);
					}
					log.debug(objName + '：删除数据成功');
				});
			});
		}else if(commandType === 'object'){
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					return callback(true,'connection error',me);
				}
				//查询条件
				var execObj = me.analysisParam(ModelMap[ep['command']]['condition']);
				if(this.callbackMark) return;
				
				db.collection(objName).findOne(execObj,function(err,doc){
					if(err){
						return callback(true,'findOne error',me);
					}
					log.debug(objName + '：查询单条数据成功');
					ep.putResult('data',doc);
				});
			});
		}else if(commandType === 'list'){
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					return callback(true,'connection error',me);
				}
				//查询条件
				var execObj = me.analysisParam(ModelMap[ep['command']]['condition']);
				if(this.callbackMark) return;
				
				db.collection(objName).find(execObj).toArray(function(err,docs){
					if(err){
						return callback(true,'find error',me);
					}
					log.debug(objName + '：查询多条数据成功');
					ep.putResult('data',docs);
				});
			});
		}else if(commandType === 'map'){
			mongodb.MongoClient.connect(config.dbUrl,function(err,db){
				if(err){
					return callback(true,'connection error',me);
				}
				//查询条件
				var execObj = me.analysisParam(ModelMap[ep['command']]['condition']);
				if(this.callbackMark) return;
				
				db.collection(objName).find(execObj).toArray(function(err,docs){
					if(err){
						return callback(true,'find error',me);
					}
					log.debug(objName + '：查询多条数据成功');
					ep.putResult('data',docs);
				});
			});
		}else if(commandType === 'space'){
			log.error('etype：space');
		}else{
			log.error('etype：为空');
		}
	};
	/*
	 * 输入：order[before|after|string|number],链式标识执行的位置
	 * before：前执行拦截器
	 * after：拦截器
	 * string：异常信息
	 * number:拦截器执行完成，返回拦截器下标
	 * 
	 * 业务主执行函数
	 */
	this.execute = function(order) {
		var me = this;
		//未定义，表示未初始化拦截器
		if(this.interceptors == null && !this.callbackMark){
			this.initInterceptor(order);
		}
		this.offset++;
		//有拦截器对象，则进入拦截器链
		if (this.interceptors != null && this.offset < this.interceptors.length && !this.callbackMark) {
			log.debug('拦截器 ：' + this.interceptorsName[this.offset] + ' 开始执行');
			this.interceptors[this.offset]['intercept'](this,ep);
		}
		//order == 'before',说明前连接器执行完毕，开始执行主执行
		if(order == 'before'){
			//发现回调函数为真，则说明有异常，直接退出函数
			if(this.callbackMark) return;
			log.debug(ep['command'] + ' 主业务开始执行');
			this.go();
		}else if(order == 'after'){
			//发现回调函数为真，则说明有异常，直接退出函数
			if(this.callbackMark) return;
			callback(false,ep);
		}else if( /^[0-9]+$/gi.test(order)){
			log.debug('拦截器 ：' + this.interceptorsName[order] + ' 完成执行');
		}else if(order == null){
			log.error('执行serviceEngine.execute(),参数应该为空 ');
		}else{
			log.error('执行serviceEngine.execute(' + order +'),参数时错误提示信息');
			callback(true,order);
		}
	};
	
	/*
	 * 对传入对象，进行分析
	 * 输入：需要分析的对象（field，condition）
	 * 输出：对象类型
	 */
	this.analysisParam = function(analysisObj){
		var resultObj = {};
		try{
			//处理string对象
			if(typeof analysisObj == 'string'){
				//'_id'：特定字符，mongoDB中主键，需要从ep中获取_id值，构建一个ObjectID对象
				if(analysisObj == '_id'){
					resultObj['_id'] = new mongodb.ObjectID(ep.getParam('_id'));
				}
			//处理object对象
			}else if(typeof analysisObj == 'object'){
				//Array对象，需要将数组变换成{}对象
				if(analysisObj instanceof Array){
					for(var i in analysisObj){
						//字符，说明需要从ep中paramMap获取同名值，构成key-value
						if(typeof analysisObj[i] == 'string'){
							if(ep.getParam(analysisObj[i]) != null){
								resultObj[analysisObj[i]] = ep.getParam(analysisObj[i]);
							}
						//{}对象，进行迭代处理
						}else if(typeof analysisObj[i] == 'object'){
							var otherResultObj = this.analysisParam(analysisObj[i]);
							for(var key in otherResultObj){
								resultObj[key] = otherResultObj[key];
							}
						}
					}
				//{}对象
				}else{
					for(var key in analysisObj){
						//如果value=#，则根据key，从paramMap中，进行替换
						if(analysisObj[key] == '#'){
							if(ep.getParam(key) != null){
								resultObj[key] = ep.getParam(key);
							}
						//{}对象，迭代
						}else if(typeof analysisObj[key] == 'object'){
							var otherResultObj = this.analysisParam(analysisObj[key]);
							if(otherResultObj != null && otherResultObj.toString() != '{}'){
								resultObj[key] = otherResultObj;
							}
						//{}常数对象
						}else{
							resultObj[key] = analysisObj[key];
						}
					}
				}
			}
		}catch(err){
			log.error(err);
			callback(true,err,this);
		}
		
		return resultObj;
	};
	
	/* 构造方法  */
	this.Constructor = function() {// 
		//初始化
		this.execute('before');
	}

	this.Constructor();
}

module.exports = ServiceEngine;