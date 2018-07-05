const Joi = require('joi');

module.exports = {
	userValidator: function(req) {
		// check email
		req.checkBody('email', 'Invalid email')
			.notEmpty()
			.isEmail();

		switch (req.url) {
			case '/signin':
				// check password
				req.checkBody('password', 'Invalid password').notEmpty();
				break;
			case '/signup':
				// check password
				req.checkBody('password', 'Invalid password')
					.notEmpty()
					.isLength({ min: 4 });
				break;
		}

		// get errors
		return req.validationErrors();
	},
	// no use
	validateBody: function(schema) {
		return (req, res, next) => {
			const result = Joi.validate(req.body, schema);

			if (result.error) {
				const messages = result.error.details.map(
					error => error.message,
				);

				return res.render('user/signin', {
					messages,
					hasErrors: messages.length > 0,
				});
			}

			if (!req.value) {
				req.value = {};
			}
			req.value.body = result.value;
			next();
		};
	},
	schemas: {
		user: {
			signup: Joi.object().keys({
				email: Joi.string()
					.email()
					.required(),
				password: Joi.string()
					.min(4)
					.required(),
				_csrf: Joi.string().required(),
			}),
			signin: Joi.object().keys({
				email: Joi.string()
					.email()
					.required(),
				password: Joi.string().required(),
				_csrf: Joi.string().required(),
			}),
		},
	},
};
