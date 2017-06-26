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
	 * 输入:sqlObj定义主执行对象
	 * paramMap：request传入数据
	 * callback：回调函数
	 */
	this.handle = function(sqlObj,paramMap,callback){
		try{
			var sql = "";
			if(typeof sqlObj == 'string'){	//字符串
				sql = sqlObj;
			}else if(typeof sqlObj == 'object' && typeof sqlObj['sql'] == 'string'){	//对象
				sql = sqlObj['sql'];
			}
			log.debug('执行sql模型：' + sql);
			//#...#正则验证,根据名称，从paramMap中进行参数替换
			var rege = /#[a-zA-Z0-9_]+#/gi;
			var paramArr = sql.match(rege);
			if(paramArr != null && paramArr.length != 0){
				for(var i = 0;i<paramArr.length;i++){
					var paramName = paramArr[i];
					var paramValue = paramMap[paramName.substring(1,paramName.length-1)];
					//如果参数不是数字，则认为是字符串，添加''
					if(/^\d+$/.test(paramValue)){
						sql = sql.replace(paramName,paramValue);
					}else{
						sql = sql.replace(paramName,'\''+paramValue+'\'');
					}
				}
			}
			log.debug('执行实际sql：' + sql);
			callback(false,sql);
		}catch(err){
			callback(true,err);
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
			db.pool.getConnection(function(err,connection){
				if(err){
					return callback(true,'connection error',me);
				}
				//处理执行的sql
				me.handle(ModelMap[ep['command']],ep['paramMap'],function(err,sql){
					if(err){
						return callback(true,err,me);
					}
					connection.beginTransaction(function(err){
						if(err){
							return callback(true,err,me);
						}
						//执行数据库操作
						connection.query(sql,function(err,result){
							if(err){
								return callback(true,'query fail!',me);
							}
							try{
								ep['resultMap']['data'] = result;
								
								me.interceptors = null;
								//执行后拦截器链
								me.execute('after');
								/*
								 * 如果在后拦截器中出现异常，则进行回滚操作；如果没有，则事务提交
								 */
								if(me.callbackMark){
									log.debug(ep['command'] + ' 主业务数据回滚');
									connection.rollback();
								}else{
									log.debug(ep['command'] + ' 主业务数据提交');
									connection.commit(function(err){
										if(err){
											log.error(ep['command'] + ' 主业务数据提交出现异常，执行回滚');
											connection.rollback(function(){
												throw err;
											});
										}
									});
								}
							}catch(err){
								return callback(true,err,me);
							}
							
						});
					});
					
				});
			});
		}else if(order == 'after'){
			//发现回调函数为真，则说明有异常，直接退出函数
			if(this.callbackMark) return;
			callback(false,ep);
		}else if( /^[0-9]+$/gi.test(order)){
			log.debug('拦截器 ：' + this.interceptorsName[order] + ' 完成执行');
		}else if(order == null){
			log.error('执行serviceEngine.execute(),参数是空 ');
		}else{
			log.error('执行serviceEngine.execute(' + order +'),参数是错误提示信息');
			callback(true,order);
		}
	};
	/* 构造方法 */
	this.Constructor = function() {
		//业务执行初始化
		this.execute('before');
	}
	//启动构造方法
	this.Constructor();
}

module.exports = ServiceEngine;