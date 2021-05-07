module.exports = function(app, passport, core) {
	app.get('/', function(req, res) {
		res.render('index');
	});

	app.get('/login', function(req, res) {
		res.render('login', { message: req.flash('loginMessage') });
	});

	app.post('/login', passport.authenticate('local-login', {
              successRedirect 	: '/profile'
			, failureRedirect 	: '/login'
			, failureFlash 		: true
		}),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        	res.redirect('/');
	    }
	);

	app.get('/signup', function(req, res) {
		res.render('signup', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		  successRedirect : '/profile'
		, failureRedirect : '/signup'
		, failureFlash : true
	}));

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile', {
			username : req.user.username
		});
	});

	app.get('/logout', function(req, res) {
		core.accounts.remove(req.user.id);
		req.logout();
		res.redirect('/');
	});

	app.get('/loner', function(req, res) {
		res.render('loner');
	});

	app.get('/:name', function(req, res) {
		var roomName = req.params.name;
		res.render('room', {
			ROOM: roomName
		});
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/');
}
