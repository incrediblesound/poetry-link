
/**
 * Module dependencies.
 */
require('./db');
var express = require( 'express' );
var routes = require( './routes' );
var http = require( 'http' );
var path = require( 'path' );
var passport = require( 'passport' );
var LocalStrategy = require( 'passport-local' ).Strategy
var mongoose = require('mongoose');
var Author = mongoose.model ('Author' );
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

passport.use(new LocalStrategy(
	function(username,password,done) {
		Author.findOne({ username: username }, function(err,user){
			if(err) { return done(err); }
			if(!user) {
				return done(null, false, { message: 'incorrect username' });
			}
			if(password !== user.password) {
				return done(null, false, { message: 'incorrect password' });
			}
			return done(null, user);
		});
	}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Author.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get('/', routes.title);
app.get('/home', routes.index);
app.get('/desk', routes.desk);
app.post('/create', routes.create);
app.post('/search', routes.search);
app.get('/register', routes.register);
app.get('/authors/:usrname', routes.authors);
app.get('/poems/:id', routes.poems);
app.post('/link', routes.linker)
app.post('/savelink', routes.savelink)
app.post('/newauthor', routes.postRegister);
app.get('/logout', routes.logout);
app.post('/login', passport.authenticate('local'),
function(req, res) {
  res.redirect('/desk');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
