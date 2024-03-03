const express = require("express");
const router = express.Router();

const UserAccount = require('../Model/UserAccount');
const SongData = require('../Model/SongData');

const {verifyToken, verifiedUserEmail} = require("../Authentiation/verification")

router.get("/my-songs", verifyToken, verifiedUserEmail, async (req, res) => {

    try {

        const UID = req.cookies.UID;

        let MySongs = await SongData.find({ UID })

        let content = "";

        if(MySongs.length==0){
            content = "You don't have any songs yet";
            return res.render("MySongs", {content})
        }

        for (let i = 0; i < MySongs.length; i++) {
            let SongName = MySongs[i].SongName;
            let BPM = MySongs[i].BPM;
            if(!BPM){
                BPM = 70
            }
            content+=`
            <a href="/edit-song/${SongName}" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                <div class="d-flex gap-2 w-100 justify-content-between">
                    <div>
                        <h6 class="mb-0">${SongName}</h6>
                        <p class="mb-0 opacity-75">The ${SongName} has a BPM of ${BPM}.</p>
                    </div>
                </div>
            </a>
            `
            
        }



        res.render("MySongs", {content})

    } catch (error) {
        console.log(error);
        res.send("Error")
    }


})


module.exports = router;