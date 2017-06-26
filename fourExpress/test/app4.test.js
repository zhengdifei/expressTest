/**
 * 测试方法一：mocha
 * 测试方法二：D:\project_room\nodeWorkspace\expressTest\fourExpress>istanbul cover C:/nodejs/u
 *			ser_module/node_modules/mocha/bin/_mocha
 */
var app4 = require('../app4');
var should = require('should');

describe('test/app4.test.js',function(){
	
	
	it('should equal 0 when n === 0',function(){
		app4.fibonacci(0).should.equal(0);
	});
	
	it('should equal 1 when n === 1',function(){
		app4.fibonacci(1).should.equal(1);
	});
	
	it('should equal 55 when n === 10',function(){
		app4.fibonacci(10).should.equal(55);
	});
	
	it('should throw when n > 10',function(){
		(function(){app4.fibonacci(11);}).should.throw('n should <= 10');
	});
	
	it('should throw when n < 0',function(){
		(function(){app4.fibonacci(-1);}).should.throw('n should >= 0');
	});
	
	it('should throw when isnt Number',function(){
		(function(){app4.fibonacci('zdf');}).should.throw('n should be a Number');
	});
});