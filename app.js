
/**
 * Module dependencies.
 */
require('./db');
var express = require( 'express' );
var routes = require( './routes' );
var user = require( './routes/user' );
var http = require( 'http' );
var path = require( 'path' );
var passport = require( 'passport' );
var LocalStrategy = require( 'passport-local' ).Strategy;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.cookieParser('cc potato chips'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// passport config
//var Account = require('./models/account');
//passport.use(new LocalStrategy(Account.authenticate()));
//passport.serializeUser(Account.serializeUser());
//passport.deserializeUser(Account.deserializeUser());

app.get('/', routes.index);
//app.post('/create', routes.create)
app.get('/users', user.list);
app.get('/desk', routes.desk)
app.post('/create', routes.create)
app.post('/search', routes.search)

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
