/**
 * Module dependencies.
 */
const express = require('express');
//, streams = require('./Socket_controller/streams.js')();
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const sass = require('node-sass-middleware');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });
//const streams = require('./Socket_controller/streams.js');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });


/**
 * Create Express server.
 */
const app = express();


/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "192.168.0.6");
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(express.static(__dirname + '/views'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(express.static(__dirname + '/public')); 

/**
 * Primary app routes.
 */


/**
 * Error Handler.
 */
app.use(errorHandler());

/**
FInd the IP address
*/

var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
console.log("address = ");
console.log(addresses);

/**
 WEBSCOKET/SOCKET.IO server link here
*/
var fs = require('fs');
var options = {
    key: fs.readFileSync('privatekey.pem'),
    cert: fs.readFileSync('certificate.pem')
};


/**
 * Start Express server.
 */
 var server =  app.listen(app.get('port'),app.get('ipaddr'), function() {
  console.log('Express server listening on port %d  ipaddress %s in %s mode', app.get('port'),app.get('ipaddr'), app.get('env'));
});


 var io = require('socket.io').listen(server);
/**
 * Socket.io event handling
 */
  
require('./Socket_controller/socketHandler.js')(io);

//app.get('/streams.json', SocketController.displayStreams);

module.exports = app;



