const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const SendEmail = require("../Messages/SendEmail")

const UserAccount = require('../Model/UserAccount');
const SongData = require('../Model/SongData');

let SECRET_KEY = process.env.SECRET_KEY

const {verifyToken, verifiedUserEmail} = require("../Authentiation/verification")

// Featured APIs

router.post("/signup", async (req, res) => {

    try {
        let { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(401).json({ message: 'Please Enter the required Data' });
        }

        let CheckUser = await CheckIfUserFound(email)

        if (CheckUser) {
            return res.status(401).json({ message: "Already have account, try to login instead of Signup" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let UID = await SaveUser(name, email, hashedPassword)

        res.cookie("UID", UID, {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true
        })

        const token = jwt.sign({ userId: UID }, SECRET_KEY);
        res.cookie("access_token", token, {
            secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS
            httpOnly: true
        }).status(200).json({ message: "SignUp Successfully" });

    } catch (error) {
        console.log(error);
        res.send("Error")
    }


})

router.post("/login", async (req, res) => {

    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ message: 'Please Enter the required Data' });
        }

        let user = await UserAccount.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {


            res.cookie("UID", user._id, {
                secure: process.env.NODE_ENV === "production",
                httpOnly: true
            })

            const token = jwt.sign({ userId: user._id }, SECRET_KEY);
            res.cookie("access_token", token, {
                secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS
                httpOnly: true
            }).status(200).json({ message: "Login Successfully" });

        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        res.send("Error")
    }


})

router.post("/resend-email", verifyToken, async (req, res) => {

    try {

        let UID = req.cookies.UID;
        let user = await UserAccount.findOne({ "_id": UID })

        await SendVerificationEmail(user.email, user.verificationToken)

        res.send("Email ReSend")


    } catch (error) {
        console.log(error);
        res.send("Error")
    }


})

router.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(404).render('Login');
        }
        const user = await UserAccount.findOneAndUpdate({ verificationToken: token }, { $set: { verified: true, verificationToken: null } });

        if (user) {
            res.status(200).render("Dashboard");
        } else {
            res.status(404).render('Login');
        }
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).send('Error during email verification');
    }
});

// Routes

router.get("/signup", async (req, res) => {

    try {
        res.render("SignUp")
    } catch (error) {
        res.send("Error")
    }

})

router.get("/login", async (req, res) => {

    try {
        res.render("Login")
    } catch (error) {
        res.send("Error")
    }

})

router.get("/dashboard", verifyToken, verifiedUserEmail, async (req, res) => {

    try {
        res.render("Dashboard")
    } catch (error) {
        res.send("Error")
    }

})


// SignUp Functions

async function SaveUser(name, email, password) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verified = false
    const userType = "freemium" //"premium"

    let data = new UserAccount({
        name, email, password, verificationToken, verified, userType
    })

    let save = await data.save()

    SendVerificationEmail(email, verificationToken)

    return save._id;

}

async function CheckIfUserFound(email) {

    try {
        let Result = await UserAccount.findOne({ email })

        if (Result) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return
    }

}

// Verification Email

async function SendVerificationEmail(email, verificationToken) {

    const sender = {
        email: 'rastogi.rahul.21600@gmail.com',
        name: `Strumming Magician`,
    }

    let content = `http://localhost:3000/verify?token=${verificationToken}`
    if(process.env.NODE_ENV == "production"){
        content = `https://strummingmagician.com/verify?token=${verificationToken}`
    }

    await SendEmail(sender, email, `Verify Your Account`, content)

}

module.exports = router;