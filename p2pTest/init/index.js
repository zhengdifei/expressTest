const request = require('request')
const config = require('../config/config')


config.p2p.forEach((one) => {
    const options = {
        url : "http://" + one['ip'] + ":" + one['port'] + "/sysc?port=" + config.server.port,
        method : 'POST',
    }

    request(options,(err, res, body) => {
        console.log(err);
        //console.log(res);
        console.log(body);
    })

})