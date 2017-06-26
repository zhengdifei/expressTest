/**
 * 创建自定义事件,用于文件生成完毕，触发数据发送事件
 */
var EventEmitter = require('events');
var util = require('util');

function MyEvent(){};

util.inherits(MyEvent,EventEmitter);

module.exports = MyEvent;
