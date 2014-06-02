/**
 * Module dependencies.
 */

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var flash = require('express-flash');
var less = require('less-middleware');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
// var expressValidator = require('express-validator');

var app = express();

/**
 * Load controllers.
 */

var homeController = require('./controllers/home');
var wishlistController = require('./controllers/wishlist');
var mycomponentsController = require('./controllers/mycomponents');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');
var Component = require('./models/Component');

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Mongoose configuration.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.log('✗ MongoDB Connection Error. Please make sure MongoDB is running.'.red);
});


/**
 * Express configuration.
 */

var hour = 3600000;
var day = (hour * 24);
var week = (day * 7);
var month = (day * 30);

app.locals.cacheBuster = Date.now();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.compress());
app.use(express.favicon('favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
// app.use(expressValidator());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret: 'SECRET GOES HERE XXX',
  store: new MongoStore({
    db: mongoose.connection.db,
    auto_reconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  // Component.acquireWishlist(req, res, next);

  res.locals.suggestions = ['gallery', 'facebook', 'twitter'];
  res.locals.defaultSuggestion = res.locals.suggestions[0];
  res.locals.descriptions = {};
  res.locals.descriptions['gallery'] = "We need a component to let people swipe through a set of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one";
  res.locals.descriptions['facebook'] = "We need a component to let people easily share to facebook  of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one";
  res.locals.descriptions['twitter'] = "We need a component to let people easily share to twitter of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one of images and pick one";
  res.locals.titles = {};
  res.locals.titles['gallery']='Picture Gallery';
  res.locals.titles['facebook']='Facebook Share';
  res.locals.titles['twitter']='Twitter Share';
  next();
});
// app.use(Component.wishlist);
app.use(flash());
app.use(less({ src: __dirname + '/public', compress: true }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: week }));
// app.use(function(req, res) { // would be good to make it avoid /api calls
//   res.render('404', { status: 404 });
// });
app.use(express.errorHandler());

/**
 * Application routes.
 */

app.get('/', homeController.index);
app.get('/wishlist', wishlistController.index);
app.get('/mycomponents', passportConf.isAuthenticated, mycomponentsController.index);
// Simplify all of these as we're just going to do signin/signout
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
app.get('/api', apiController.getApi);
app.get('/api/signAndProxy', apiController.signAndProxy);
app.get('/api/getIssuesForMilestone', apiController.getIssuesForMilestone);
app.post('/api/favorite', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.favorite);
app.post('/api/createRepo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.createRepo);
app.post('/api/addToWishlist', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.addToWishlist);
app.get('/api/github', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getGithub);
app.get('/auth/github', passport.authenticate('github', {scope: 'user,public_repo,repo,gist'}));
app.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/', failureRedirect: '/login' }));

app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
