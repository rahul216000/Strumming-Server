const express = require("express");
const router = express.Router();

const UserAccount = require('../Model/UserAccount');
const SongData = require('../Model/SongData');

const {verifyToken, verifiedUserEmail} = require("../Authentiation/verification")

router.post("/new-song-data", verifyToken, verifiedUserEmail, async (req, res) => {

    try {

        const UID = req.cookies.UID;

        let {SongName} = req.body;

        let CheckIfSongFound = await CheckIfSongAlreadyFound(UID, SongName)

        if(CheckIfSongFound){
            return res.status(401).json({ message: "Every Song must have a specific name" })
        }

        await SaveNewSong(UID, SongName)

        res.status(200).json({ message: "Song Created Successfully" })

    } catch (error) {
        res.send("Error")
    }


})

router.post("/update-song-data", verifyToken, verifiedUserEmail, async (req, res) => {

    try {

        const UID = req.cookies.UID;
        let {SongName, BPM, MainValue, DefaultTimeSign, TransposeKey, Metronome, TimeSignatureTopValue, TimeSignatureBottomValue, StrummingPatterns, ModeArr, BeatArr, IntensityArr, AdvancedMode, SectionNames, SectionNamesValue} = req.body;

        await UpdateSongData(UID, SongName, BPM, MainValue, DefaultTimeSign, TransposeKey, Metronome, TimeSignatureTopValue, TimeSignatureBottomValue, StrummingPatterns, ModeArr, BeatArr, IntensityArr, AdvancedMode, SectionNames, SectionNamesValue);

        res.status(200).json({ message: "Song Updated Successfully" })

    } catch (error) {
        console.log(error);
        res.send("Error")
    }


})

router.get("/edit-song/:SongName", verifyToken, verifiedUserEmail, async (req, res) => {

    try {

        const UID = req.cookies.UID;
        let SongName = req.params.SongName;

        if(!SongName){
            return res.render("Dashboard")
        }

        let CurrentSongData = await SongData.findOne({ UID, SongName })

        res.render("EditSongPanel", { SongName, CurrentSongData})

    } catch (error) {
        console.log(error);

        res.send("Error")
    }


})



// Save New Song

async function SaveNewSong(UID, SongName){

    let data = new SongData({
        UID, SongName
    })

    let save = await data.save()
    
}

async function CheckIfSongAlreadyFound(UID, SongName) {

    try {

        let AllSongsbyThisUID = await SongData.find({ UID })
        
        if(AllSongsbyThisUID.length==0){
            return false
        }
        for (let i = 0; i < AllSongsbyThisUID.length; i++) {
            let Song = AllSongsbyThisUID[i]

            if(Song.SongName == SongName){
                return true
            }
            
        }

        return false

    } catch (error) {
        return
    }

}

// Update Song

async function UpdateSongData(UID, SongName, BPM, MainValue, DefaultTimeSign, TransposeKey, Metronome, TimeSignatureTopValue, TimeSignatureBottomValue, StrummingPatterns, ModeArr, BeatArr, IntensityArr, AdvancedMode, SectionNames, SectionNamesValue){

    await SongData.updateOne({ UID, SongName }, { BPM, MainValue, DefaultTimeSign, TransposeKey, Metronome, TimeSignatureTopValue, TimeSignatureBottomValue, StrummingPatterns, ModeArr, BeatArr, IntensityArr, AdvancedMode, SectionNames, SectionNamesValue});

}

module.exports = router;