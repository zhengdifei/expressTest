ModelMap = {
    "T_BASE_FIELD.selectAll":{
    	'etype' : 'list',
        "field":[
            "name",
            "age",
            "sex"
        ],
        'before' : ['../interceptor/Before1FieldInsertInterceptor','../interceptor/Before2FieldInsertInterceptor'],
		'after' : ['../interceptor/After1FieldInsertInterceptor','../interceptor/After2FieldInsertInterceptor']
    },
    "T_BASE_FIELD.selectAllByNameDistinct":{
    	 'etype' : 'object',
         "distinct" : "age"
    },
     "T_BASE_FIELD.selectAllByName":{
    	'etype' : 'list',
        "field":[
            "name",
            "age",
            "sex"
        ],
        "condition":{"name":"#"},
        "sort": {"huji" :1}
    },
    "T_BASE_FIELD.selectById" : {
    	'etype' : 'object',
    	"condition" : "_id"
    },
    "T_BASE_FIELD.selectByName":{
    	'etype' : 'list',
        "condition":{
        	"name" : "#"
        }
    },
    "T_BASE_FIELD.updateById":{
    	'etype' : 'update',
        "field":{"$set":{"name":"#","age":"#"}},
        "condition":"_id"
    },
    "T_BASE_FIELD.updateByName":{
    	'etype' : 'update',
        "field":{"name" : "#","age":"#","address":"#"},
        "condition":{"name":"#"}
    },
    "T_BASE_FIELD.insertArray":{
    	'etype' : 'insert',
        "field":["uuid","name","age","sex","abc","address","huji"]
    },
    "T_BASE_FIELD.insertJson":{
    	'etype' : 'insert',
        "field":{"uuid":"#","name":"#","age":"#","sex":"#","address":"hubei"}
    },
    "T_BASE_FIELD.deleteById":{
    	'etype' : 'delete',
        "condition":"_id",
    },
    "T_BASE_FIELD.deleteByName":{
    	'etype' : 'delete',
        "condition":{
            "name":"#",
            "age" : "#"
        }
    }
}

module.exports = ModelMap;