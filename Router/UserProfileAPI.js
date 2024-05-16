const express = require("express");
const router = express.Router();

const UserAccount = require('../Model/UserAccount');
const SongData = require('../Model/SongData');

const {verifyToken, verifiedUserEmail} = require("../Authentiation/verification")

router.post("/change-user-type", verifyToken, verifiedUserEmail, async (req, res) => {

    try {

        let userType = req.body.userType;
        const UID = req.cookies.UID;

        let User = await UserAccount.findOne({ _id: UID })

        User.userType = userType

        await User.save()

        res.send("Updated")

    } catch (error) {
        console.log(error);
        res.send("Error")
    }


})

module.exports = router;