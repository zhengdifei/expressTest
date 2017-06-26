function Interceptor(){
	this.intercept = function(servcieEngine,ep){
		this.execute(ep);
		servcieEngine['execute']();
	}
}
module.exports = Interceptor;