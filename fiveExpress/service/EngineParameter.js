function EngineParameter(command){
	this.command = command || '';
	
	this.paramMap = {};
	
	this.resultMap = {};
	
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