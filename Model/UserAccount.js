const mongoose = require('mongoose');

const UserAccount = mongoose.model('UserAccount', {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    verificationToken: { type: String },
    verified: { type: Boolean },
    userType: { type: String },
});

module.exports = UserAccount