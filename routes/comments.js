const expressSanitizer = require('express-sanitizer'),
		middleware 		  = require('../middleware'),
		Campground 	  	  = require('../models/campground'),
		Comment    	  	  = require('../models/comment'),
		express 			  = require('express'),
	   router  			  = express.Router({mergeParams: true});

router.use(expressSanitizer());

// CREATE COMMENTS ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
	req.body.comment.text = req.sanitize(req.body.comment.text);
	Campground.findOne({slug: req.params.slug}, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', 'Unable to find the campground.');
			console.log(err);
		} else {
			Comment.create(req.body.comment, function(err, newComment){
				if(err || !newComment){
					req.flash('error', 'Unable to create the comment.');
					console.log(err);
				} else {
					newComment.author.id = req.user._id;
					newComment.author.username = req.user.username;
					newComment.save();
					foundCampground.comments.push(newComment);
					foundCampground.save();
					req.flash('success', 'Comment successfully added.');
					res.redirect("/campgrounds/" + foundCampground.slug);
				}
			})
		}
	});
});

// NEW COMMENTS ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res){
	Campground.findOne({slug: req.params.slug}, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', 'Unable to find the campground.');
			console.log(err);
		} else {
			res.render("comments/new", {campground: foundCampground});
		}
	});
});

// EDIT COMMENTS ROUTE
router.get('/:comment_id/edit', middleware.isLoggedIn, middleware.checkCommentOwnership, function(req, res){
	Campground.findOne({slug: req.params.slug}, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', 'Unable to find the campground.');
			return res.redirect('/campgrounds/' + req.params.slug + '/'+ req.params.comment_id + '/edit');
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash('error', 'Unable to find the reivew.');
				return res.redirect('/campgrounds/' + req.params.slug + '/'+ req.params.comment_id + '/edit');
			}
        res.render('comments/edit', {comment: foundComment, campground: foundCampground});
    	});
	});
});

// UPDATE COMMENTS ROUTE
router.put('/:comment_id', middleware.isLoggedIn, middleware.checkCommentOwnership, function(req, res){
	req.body.comment.text = req.sanitize(req.body.comment.text);
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err || !updatedComment){
			req.flash('error', 'Unable to update the review.');
			console.log(err);
			res.redirect('/campgrounds/' + req.params.slug + '/'+ req.params.comment_id + '/edit');
		} else {
			req.flash('success', 'Review updated successfully.')
			res.redirect('/campgrounds/' + req.params.slug);
		}
	})
});

// DELETE COMMENT ROUTE
router.delete('/:comment_id', middleware.isLoggedIn, middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
			   req.flash('error', 'Unable to delete the review.');
            console.log(err);
        }
				req.flash('success', 'Review successfully removed.')
            res.redirect("/campgrounds/" + req.params.slug);
    })
});

module.exports = router;