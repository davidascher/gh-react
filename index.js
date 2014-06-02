var http = require('http'),
    fs = require('fs'),
    httpProxy = require('http-proxy');
//
// Create your proxy server and set the target in the options.
//
httpProxy.createProxyServer({target:'https://api.github.com',
                               headers : { 
                                  host : 'api.github.com'
                                },
                               ssl: {
                                key: fs.readFileSync('key.pem', 'utf8'),
                                cert: fs.readFileSync('cert.pem', 'utf8')
                              },
                             secure: true
                            }).listen(process.env.PORT || 5000);
