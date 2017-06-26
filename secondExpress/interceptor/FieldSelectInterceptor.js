function before(ep){
	console.log('before');
};

function after(ep){
	console.log('after');
};

exports.intercept = function(servcieEngine,ep){
	console.log('5');
	before(ep);
	console.log('6');
	servcieEngine['execute'](ep);
	console.log('7');
	after(ep);
	console.log('8');
}