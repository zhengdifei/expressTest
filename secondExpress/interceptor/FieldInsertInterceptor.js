function before(ep){
	console.log('before');
};

function after(ep){
	console.log('after');
};

exports.intercept = function(servcieEngine,ep){
	console.log('1');
	before(ep);
	console.log('2');
	servcieEngine['execute'](ep);
	console.log('3');
	after(ep);
	console.log('4');
}