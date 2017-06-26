var mysql = require('mysql');
var config = require('../config/config');

var pool = mysql.createPool(config.mysql_dev);

exports.pool = pool;