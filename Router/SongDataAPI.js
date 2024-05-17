const express = require("express");
const router = express.Router();

const UserAccount = require('../Model/UserAccount');
const SongData = require('../Model/SongData');

const { verifyToken, verifiedUserEmail } = require("../Authentiation/verification")

router.post("/new-song-data", verifyToken, verifiedUserEmail, async (req, res) => {

    try {

        const UID = req.cookies.UID;

        let { SongName } = req.body;

        let CheckIfSongFound = await CheckIfSongAlreadyFound(UID, SongName)

        if (CheckIfSongFound) {
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
        let { SongName, BPM, MainValue, DefaultTimeSign, TransposeKey, Metronome, TimeSignatureTopValue, TimeSignatureBottomValue, StrummingPatterns, ModeArr, BeatArr, IntensityArr, AdvancedMode, SectionNames, SectionNamesValue } = req.body;

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

        if (!SongName) {
            return res.render("Dashboard")
        }

        let CurrentSongData = await SongData.findOne({ UID, SongName })

        let User = await UserAccount.findOne({ _id: UID })
        let UserType = User.userType;

        if (UserType == "premium") {
            return res.render("EditSongPanel", { SongName, CurrentSongData })
        }

        // Check whether this user previouly ever used any premium chords

        let Patterns = CurrentSongData.StrummingPatterns
        if(!Patterns){
            return res.render("EditSongPanelFreemium", { SongName, CurrentSongData })
        }
        Patterns = JSON.parse(Patterns);

        let AllowedChords = [  "Empty",  "A",    "Am",    "A7",    "Am7",    "B",    "Bm",    "B7",    "Bm7",    "Bb",    "Bbm",    "Bb7",    "Bbm7",    "C",    "Cm",    "C7",    "Cm7",    "D",    "Dm",    "D7",    "Dm7",    "Db",    "Dbm",    "Db7",    "Dbm7",    "E",    "Em",    "E7",    "Em7",    "Eb",    "Ebm",    "Eb7",    "Ebm7",    "F",    "Fm",    "F7",    "Fm7",    "G",    "Gm",    "G7",    "Gm7",    "Gb",    "Gbm",    "Gb7",    "Gbm7",    "Ab",    "Abm",    "Ab7",    "Abm7",]
        
        let HasSongPremiumChords = false

        Patterns.map((SingleBox) => {
            let chord = SingleBox[1]

            if(AllowedChords.includes(chord)){
            }else{
                HasSongPremiumChords = true
                return
            }
        })

        if(HasSongPremiumChords){
            return res.send("This Song contains some premium chords, please upgrade your plan to edit/play this song.")
        }

        res.render("EditSongPanelFreemium", { SongName, CurrentSongData })

    } catch (error) {
        console.log(error);

        res.send("Error")
    }


})

// Save New Song

async function SaveNewSong(UID, SongName) {

    let data = new SongData({
        UID, SongName
    })

    let save = await data.save()

}

async function CheckIfSongAlreadyFound(UID, SongName) {

    try {

        let AllSongsbyThisUID = await SongData.find({ UID })

        if (AllSongsbyThisUID.length == 0) {
            return false
        }
        for (let i = 0; i < AllSongsbyThisUID.length; i++) {
            let Song = AllSongsbyThisUID[i]

            if (Song.SongName == SongName) {
                return true
            }

        }

        return false

    } catch (error) {
        return
    }

}

// Update Song

async function UpdateSongData(UID, SongName, BPM, MainValue, DefaultTimeSign, TransposeKey, Metronome, TimeSignatureTopValue, TimeSignatureBottomValue, StrummingPatterns, ModeArr, BeatArr, IntensityArr, AdvancedMode, SectionNames, SectionNamesValue) {

    await SongData.updateOne({ UID, SongName }, { BPM, MainValue, DefaultTimeSign, TransposeKey, Metronome, TimeSignatureTopValue, TimeSignatureBottomValue, StrummingPatterns, ModeArr, BeatArr, IntensityArr, AdvancedMode, SectionNames, SectionNamesValue });

}

module.exports = router;