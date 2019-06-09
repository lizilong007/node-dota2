var https = require('https');
var url = require('url');
var fs = require('fs');



https.get(url.parse("https://api.steampowered.com/ISteamDirectory/GetCMList/v1/?cellid=0"), (res) => {
    // 用响应做些事情。
    console.log('状态码:', res.statusCode);
    console.log('请求头:', res.headers);

    res.on('data', (d) => {
        let data = JSON.parse(d)
        let serverlist = data.response.serverlist.map(uri => {
            let [host, port] = uri.split(':')
            return {host, port}
        })
        
        if (fs.existsSync(__dirname + "/servers")) {
            // 删除
            fs.unlinkSync(__dirname + "/servers")
        }
        let fd = fs.openSync(__dirname + "/servers", "w")
        fs.writeSync(fd, JSON.stringify(serverlist))
    });
});