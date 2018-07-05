module.exports = function(cart, stripeToken) {
	// test apis
	const stripe = require('stripe')('your stripe token code here');

	return new Promise((resolve, reject) => {
		stripe.charges.create(
			{
				amount: cart.totalPrice,
				currency: 'usd',
				source: stripeToken, // obtained with Stripe.js
				description: 'Test Charge',
			},
			function(err, charge) {
				if (err) {
					return reject(err.message);
				}
				resolve(charge);
			},
		);
	});
};
