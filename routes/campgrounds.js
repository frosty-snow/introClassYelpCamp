const expressSanitizer = require('express-sanitizer'),
		middleware		  = require('../middleware/index'),
		Campground 	  	  = require('../models/campground'),
		Comment    	  	  = require('../models/comment'),
		express 			  = require('express'),
		Review 			  = require("../models/review"),
	   router  			  = express.Router();

router.use(expressSanitizer());

// CAMPGROUND INDEX ROUTE
router.get('/', function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			req.flash('error', 'Unable to find campgrounds');
			console.log(err);
			res.redirect('/');
		} else {
			res.render('campgrounds/index', {campgrounds: allCampgrounds});
		}
	});
});

// CREATE CAMPGROUND ROUTE
router.post('/', middleware.isLoggedIn, function(req, res){
	req.body.description = req.sanitize(req.body.description);
	let name = req.body.name;
	let image = req.body.image;
	let description = req.body.description;
	let price = req.body.price;
	let author = {
			id: req.user._id,
			username: req.user.username
	};
	let newCampground = {name: name, image: image, description: description, author: author, price: price};
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			req.flash('error', 'Unable to create campground.');
			console.log(err);
		} else {
			req.flash('success', 'New campground successfully added.');
			res.redirect('/campgrounds/' + newlyCreated.slug);
		}
	});
});

// NEW CAMPGROUND ROUTE
router.get('/new', middleware.isLoggedIn, function(req, res){
	res.render('campgrounds/new');
});

// SHOW CAMPGROUND ROUTE
router.get('/:slug', function(req, res){
	Campground.findOne({slug: req.params.slug}).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', 'Campground not found!');
			console.log(err);
			return res.redirect('/campgrounds');
		} else {
			res.render('campgrounds/show', {campground: foundCampground});
		}
	});
});

// EDIT CAMPGROUND ROUTE
router.get('/:slug/edit', middleware.isLoggedIn, middleware.checkCampgroundOwnership, function(req, res){
	Campground.findOne({slug: req.params.slug}, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', 'Unable to find the campground to edit.');
			console.log(err);
			res.redirect('/campgrounds')
		}
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put('/:slug', middleware.isLoggedIn, middleware.checkCampgroundOwnership, function(req, res){
	delete req.body.campground.rating;
	req.body.campground.description = req.sanitize(req.body.campground.description);
	Campground.findOne({slug: req.params.slug}, function(err, updatedCampground){
		if(err){
			req.flash('error', 'Unable to find the campground.');
			console.log(err);
			res.redirect('/campgrounds/:slug');
		} else {
			  updatedCampground.name = req.body.campground.name;
           updatedCampground.description = req.body.campground.description;
           updatedCampground.image = req.body.campground.image;
           updatedCampground.save(function (err) {
             if(err){
               console.log(err);
               res.redirect("/campgrounds");
             } else {
					 req.flash('success', 'Campground updated successfully.')
               res.redirect("/campgrounds/" + updatedCampground.slug);
             }
         });
      }
	});
});

// DELETE CAMPGROUND ROUTE
router.delete('/:slug', middleware.isLoggedIn, middleware.checkCampgroundOwnership, function(req, res){
	Campground.findOneAndRemove({slug: req.params.slug}, (err, campgroundRemoved) => {
        if (err) {
			   req.flash('error', 'Unable to find the campground to remove.');
            console.log(err);
        }
        Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
            if (err) {
					 req.flash('error', 'Unable to delete the comments from the campground just deleted.');
                console.log(err);
            }
			   req.flash('success', 'Campground has been successfully removed.');
            res.redirect("/campgrounds");
        });
    })
});

module.exports = router;