const campgroundRoutes = require('./routes/campgrounds'),
		methodOverride   = require('method-override'),
		commentRoutes 	  = require('./routes/comments'),
		localStrategy 	  = require('passport-local'),
		reviewRoutes     = require("./routes/reviews"),
		indexRoutes	  	  = require('./routes/index'),
		bodyParser 	  	  = require('body-parser'),
		Campground 	  	  = require('./models/campground'),
		mongoose   	  	  = require('mongoose'),
		passport	  	  	  = require('passport'),
		express    	  	  = require('express'),
		Comment    	  	  = require('./models/comment'),
		seedDB     	  	  = require('./seeds'),
		flash				  = require('connect-flash'),
		User			  	  = require('./models/user'),
		app        	  	  = express();

// seedDB();
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true })
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.locals.moment = require('moment');
app.set("view engine", "ejs");

app.use(require("express-session")({
	secret: "Once again Rusty wins cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.success 	  = req.flash("success");
	res.locals.error	 	  = req.flash("error");
	next();
});

app.use(methodOverride('_method'));

app.use(indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use("/campgrounds/:slug/reviews", reviewRoutes);
app.use('/campgrounds/:slug/comments', commentRoutes);

app.listen(3000, function(){
	console.log("YelpCamp Server Activated");
})