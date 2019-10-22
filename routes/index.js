const middleware = require('../middleware'),
		passport   = require("passport"),
		express    = require('express'),
	   router     = express.Router(),
		User	     = require("../models/user");

// ROOT ROUTE
router.get("/", function(req, res){
	res.render("landing");
});

// AUTH ROUTES
router.get('/register', function(req, res){
	res.render('register');
});

router.post('/register', function(req, res){
	let newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			req.flash('error', err.message);
			return res.redirect("/register");
		}
		passport.authenticate('local')(req, res, function(){
			req.flash('success', 'You have successfully registered with YelpCamp. Welcome ' + user.username);
			res.redirect('/campgrounds');
		});
	});
});

// LOGIN ROUTES
router.get('/login', function(req, res){
	res.render('login');
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
		 req.flash('error', err);
		 return next(err); 
	 }
    if (!user) { 
		 req.flash('error', 'Please enter a valid username and password to login.')
		 return res.redirect('/login'); 
	 }
    req.logIn(user, function(err) {
      if (err) { 
			return next(err); 
		}
      let redirectTo = req.session.redirectTo ? req.session.redirectTo : '/campgrounds';
      delete req.session.redirectTo;
      res.redirect(redirectTo);
    });
  })(req, res, next);
});

// LOGOUT ROUTE
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You have been successfully logged out.');
	res.redirect('/campgrounds');
});

module.exports = router;