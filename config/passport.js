const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const { userValidator } = require('../config/validator');

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
	try {
		const findUser = await User.findById(id);
		done(null, findUser);
	} catch (error) {
		done(error);
	}
});

passport.use(
	'local.signup',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true,
		},
		async function(req, email, password, done) {
			try {
				// get errors
				const errors = userValidator(req);

				if (errors) {
					return done(
						null,
						false,
						req.flash('error', errors.map(error => error.msg)),
					);
				}

				const findUser = await User.findOne({ email });

				if (findUser) {
					return done(null, false, {
						message: 'Email is already in use.',
					});
				}

				const newUser = await new User({ email, password }).save();

				return done(null, newUser);
			} catch (error) {
				return done(error);
			}
		},
	),
);

passport.use(
	'local.signin',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true,
		},
		async function(req, email, password, done) {
			try {
				// get errors
				const errors = userValidator(req);

				if (errors) {
					return done(
						null,
						false,
						req.flash('error', errors.map(error => error.msg)),
					);
				}

				const findUser = await User.findOne({ email });

				if (!findUser) {
					return done(null, false, { message: 'No user found.' });
				}

				if (!findUser.validPassword(password)) {
					return done(null, false, { message: 'Wrong password.' });
				}

				return done(null, findUser);
			} catch (error) {
				return done(error);
			}
		},
	),
);
