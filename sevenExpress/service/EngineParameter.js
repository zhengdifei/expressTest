/**
 * function : 业务执行中间的共享对象
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var db = require('../db/database');

function EngineParameter(command){
	//主执行标识
	this.command = command || '';
	//输入参数集合
	this.paramMap = {};
	//输出参数集合
	this.resultMap = {};
	/*
	 *下面为了兼容java的编程习惯，添加参数操作方法 
	 */
	this.removeParam = function(key){
		delete this.paramMap[key];
	}
	
	this.putParam = function(key,value){
		this.paramMap[key] = value;
	}
	
	this.getParam = function(key){
		return this.paramMap[key];
	}
	
	this.getParamMap = function(){
		return this.paramMap;
	}
	
	this.setParamMap = function(_paramMap){
		this.paramMap = _paramMap;
	}
	
	this.removeResult = function(key){
		delete this.resultMap[key];
	}
	
	this.putResult = function(key,value){
		this.resultMap[key] = value;
	}
	
	this.getResult = function(key){
		return this.resultMap[key];
	}
	
	this.getResultMap = function(){
		return this.resultMap;
	}
	
	this.setResultMap = function(_resultMap){
		this.resultMap = _resultMap;
	}
	
	/** 初始化操作区 */
	this.Constructor = function() {// 构造方法
		if(this.command == null || this.command == ''){
			throw new Error('EngineParameter have not command parameter!');
		}
	};

	this.Constructor(); // 执行构造方法，初始化对象
}

module.exports = EngineParameter;