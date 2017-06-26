var db = require('../db/database');

function handle(sql,paramMap){
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
}

exports.execute = function(sql,paramMap,callback){
	var resultMap = {};
	db.pool.getConnection(function(err,connection){
		if(err){
			callback(true);
			return;
		}
		connection.query(handle(sql,paramMap),function(err,result){
			if(err){
				callback(true);
				return;
			}
			console.log(result);
			resultMap['data'] = result;
			callback(false,resultMap)
		});
	});
}