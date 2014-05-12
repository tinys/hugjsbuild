/**
 * 资源访问服务
 * 
 * @author yajiedong
 */

var express = require('express')
  , routes = require('./pub/routes')
  , http = require('http')
  , path = require('path')
  ,$config = require("./cfg")
  ;
  var app = express();
  // all environments
  app.set('port', $config.pubServer.port || 3000);
  app.set('views', path.join(__dirname + '/pub/views'));
  app.set('view engine', 'ejs');
  app.use(express.favicon());
//  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  
  app.use(app.router);
  app.use(express.static(path.join(__dirname,"public") ));
  
  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }
  // reload config
  
  // 发布首页
  app.get('/', routes.index);
  app.post('/pub', routes.pub);
  app.get('/zipFoloder', routes.zipFoloder);
  app.get('/zipPro', routes.zipPro);
  
  
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
module.exports = function(){
};
