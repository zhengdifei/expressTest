var sio = require('socket.io');

function socketio(httpServer){
	this.io = null;
	this.sockets = [];
	
	this.init =  function(httpServer){
		var me = this;
		me.io = sio.listen(httpServer);
		
		me.io.on('connection',function(socket){
			me.sockets.push(socket);
		});
	}
	
	this.sendMessage = function(topic,msg){
		if(this.sockets.length > 0){
			this.sockets.forEach(function(socket){
				socket.emit(topic,msg);
			});
		}
	}
}

module.exports = new socketio();
