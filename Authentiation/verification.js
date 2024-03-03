const jwt = require('jsonwebtoken');
const UserAccount = require('../Model/UserAccount');

let SECRET_KEY = process.env.SECRET_KEY

function verifyToken(req, res, next) {

    const token = req.cookies.access_token;
    if (!token) {
        return res.render("Login")
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.render("Login")
        }

        next();
    });

}

async function verifiedUserEmail(req, res, next) {

    const UID = req.cookies.UID;

    if (!UID) {
        return res.render("Login")
    }

    let user = await UserAccount.findOne({ "_id": UID })

    if (user.verified) {
        next();
    } else {
        return res.render("VerifyEmail")
    }

}

module.exports = {verifyToken, verifiedUserEmail}