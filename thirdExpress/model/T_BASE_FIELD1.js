var db = require('../db/database');

var Field = function(){};

Field.prototype.find = function(id,callback){
	var sql = "select * from t_base_field where zdid = ?";

	db.pool.getConnection(function(err,connection){
		if(err){
			callback(true);
			return;
		}

		connection.query(sql,[id],function(err,result){
			if(err){
				callback(err);
				return;
			}

			callback(false,result);
		});
	});
}

module.exports = Field;