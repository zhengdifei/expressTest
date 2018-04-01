module.exports = {
    "debug": true,
    "server": {"port": 8081},
    "dbUrl": "mongodb://localhost:27017/mydb1",
    "log4js": {
        "appenders": [{"type": "console", "category": "console", "makers": {}}, {
            "type": "dateFile",
            "filename": "log/",
            "pattern": "debug/yyyyMMddhh.txt",
            "absolute": false,
            "alwaysIncludePattern": true,
            "category": "file",
            "makers": {}
        }], "levels": {"file": "DEBUG"}
    },
    "p2p": [{"ip": "127.0.0.1", "port": 8083}]
}