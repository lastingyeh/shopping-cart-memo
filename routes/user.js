const express = require('express');
const passport = require('passport');
const csrf = require('csurf');
const Cart = require('../models/cart');
const Order = require('../models/order');
// const { validateBody, schemas } = require('../config/validator');

const router = express.Router();
const csrfProtection = csrf();

router.use(csrfProtection);

router.get('/profile', isLoggedIn, async function(req, res, next) {
	try {
		const findOrders = await Order.find({ user: req.user });

		// const orders = findOrders.map(order => {
		// 	const items = new Cart(order.cart).generateArray();
		// 	// console.log(items)
		// 	return { ...order, items };
		// });

		// console.log(orders);

		// res.render('user/profile', { orders });
		const orders = findOrders.map(function(order) {
			order.items = new Cart(order.cart).generateArray();
			return order;
		});

		res.render('user/profile', { orders });
	} catch (error) {
		next(error);
	}
});

router.get('/logout', isLoggedIn, function(req, res, next) {
	req.logout();
	res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next) {
	next();
});

router.get('/signup', function(req, res, next) {
	const messages = req.flash('error');

	res.render('user/signup', {
		csrfToken: req.csrfToken(),
		messages,
		hasErrors: messages.length > 0,
	});
});

router.post(
	'/signup',
	passport.authenticate('local.signup', {
		// successRedirect: '/user/profile',
		failureRedirect: '/user/signup',
		failureFlash: true,
	}),
	function(req, res, next) {
		if (req.session.oldUrl) {
			const oldUrl = req.session.oldUrl;
			req.session.oldUrl = null;
			res.redirect(oldUrl);
		} else {
			res.redirect('/user/profile');
		}
	},
);

router.get('/signin', function(req, res, next) {
	const messages = req.flash('error');

	res.render('user/signin', {
		csrfToken: req.csrfToken(),
		messages,
		hasErrors: messages.length > 0,
	});
});

router.post(
	'/signin',
	passport.authenticate('local.signin', {
		// successRedirect: '/user/profile',
		failureRedirect: '/user/signin',
		failureFlash: true,
	}),
	function(req, res, next) {
		if (req.session.oldUrl) {
			const oldUrl = req.session.oldUrl;
			req.session.oldUrl = null;
			res.redirect(oldUrl);
		} else {
			res.redirect('/user/profile');
		}
	},
);

module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

function notLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}
