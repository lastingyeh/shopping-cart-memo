const express = require('express');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const paycheck = require('../config/paycheck');
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
	try {
		const successMsg = req.flash('success')[0];

		const products = await Product.find();

		const productChunks = [];
		const chunkSize = 3;

		for (let i = 0; i < products.length; i += chunkSize) {
			productChunks.push(products.slice(i, i + chunkSize));
		}

		res.render('shop/index', {
			title: 'Shopping Cart',
			products: productChunks,
			successMsg,
			noMessages: !successMsg,
		});
	} catch (error) {
		next(error);
	}
});

router.get('/add-to-cart/:id', async function(req, res, next) {
	try {
		const productId = req.params.id;
		const cart = new Cart(req.session.cart ? req.session.cart : {});

		const findProduct = await Product.findById(productId);

		if (!findProduct) {
			return res.render('error');
		}

		cart.add(findProduct, findProduct.id);
		req.session.cart = cart;
		res.redirect('/');
	} catch (error) {
		next(error);
	}
});

router.get('/reduce/:id', function(req, res, next) {
	const productId = req.params.id;
	const cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.reduceByOne(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
	const productId = req.params.id;
	const cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.removeItem(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
	if (!req.session.cart) {
		return res.render('shop/shopping-cart', { products: null });
	}

	const cart = new Cart(req.session.cart);
	res.render('shop/shopping-cart', {
		products: cart.generateArray(),
		totalPrice: cart.totalPrice,
	});
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	const cart = new Cart(req.session.cart);
	const errMsg = req.flash('error')[0];

	res.render('shop/checkout', {
		total: cart.totalPrice,
		errMsg,
		noError: !errMsg,
	});
});

router.post('/checkout', isLoggedIn, async function(req, res, next) {
	try {
		if (!req.session.cart) {
			return res.redirect('/shopping-cart');
		}
		var cart = new Cart(req.session.cart);

		const charge = await paycheck(cart, req.body.stripeToken);

		await new Order({
			user: req.user,
			cart,
			address: req.body.address,
			name: req.body.name,
			paymentId: charge.id,
		}).save();

		req.flash('success', 'Successfully bought product!');
		req.session.cart = null;
		res.redirect('/');
	} catch (error) {
		req.flash('error', err.message);
		return res.redirect('/checkout');
	}
});

module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.session.oldUrl = req.url;
	res.redirect('/user/signin');
}
