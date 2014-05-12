/**
 * 资源访问服务
 * 
 * @author yajiedong
 */

var express = require('express')
  , routes = require('./resource/routes')
  , http = require('http')
  , path = require('path')
  ,$config = require("./cfg")
  ,$reqFilter = require("./filter/jscssfilter");

  var app = express();
  // all environments
  app.set('port', $config.resourceServer.port || 80);
  app.set('views', path.join(__dirname + '/resource/views'));
  app.set('view engine', 'ejs');
  app.use(express.favicon());
//  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  app.use($reqFilter());
  
  app.use(app.router);
  app.use(express.static(path.join(__dirname,"public") ));
  
  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }
  // reload config
  
  // 监听目录
  app.get('/*', routes.index);
  
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
module.exports = function(){
};
