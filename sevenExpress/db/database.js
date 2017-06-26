/**
 * function : 构建mysql数据库连接池
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
var mysql = require('mysql');
var config = require('../config/config');
//创建mysql数据库连接池
var pool = mysql.createPool(config.mysql_dev);

exports.pool = pool;