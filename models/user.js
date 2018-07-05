const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: { type: String, required: true },
	password: { type: String, required: true },
});

userSchema.pre('save', function(next) {
	try {
		this.password = this.encryptPassword(this.password);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods = {
	encryptPassword: function(password) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
	},
	validPassword: function(password) {
		return bcrypt.compareSync(password, this.password);
	},
};

module.exports = mongoose.model('User', userSchema)
