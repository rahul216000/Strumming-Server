const express = require("express");
const router = express.Router();
var path = require('path');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const Downloader = require("nodejs-file-downloader");


var dir = 'public'
var subdirectory = 'public/downloads'

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
    fs.mkdirSync(subdirectory)
}


router.get("/", (req, res) => {
    res.send("Allowed")
})

router.get('/files/:ID/:FileName', async (req, res) => {
    let FileName = req.params["FileName"]
    let ID = req.params["ID"]

    let DirToSave = path.join(`${__dirname}/../public/downloads/`, `${ID}Downloads`);
    if (!fs.existsSync(DirToSave)) {
        fs.mkdirSync(`${__dirname}/../public/downloads/${ID}Downloads`)
    }

    await DownloadFiles(FileName, DirToSave)

    res.send("Files Downloaded")
});



router.get('/DownloadFiles/:ID/:FileName', (req, res) => {
    let FileName = req.params["FileName"]
    let ID = req.params["ID"]
    let filePath = path.join(`${__dirname}/../public/downloads/${ID}Downloads`, `${FileName}`);
    if (!fs.existsSync(filePath)) {
        res.send("Error")
        return
    }

    res.sendFile(filePath, (err) => {
        if (!err) {
            console.log(`Sended`);
        } else {
            console.log(err);
        }
    })


});

router.get(`/delete/:ID`, (req, res) => {
    let ID = req.params["ID"]
    let filePath = path.join(`${__dirname}/../public/downloads/${ID}Downloads`);
    if (!fs.existsSync(filePath)) {
        res.send("Error")
        return
    }
    try {

        fs.rmSync(path.join(`${__dirname}/../public/downloads/${ID}Downloads`), { recursive: true, force: true });
    } catch (error) {

    }

    // fs.rmSync(filePath, { recursive: true, force: true });
    res.send("Deleted")

})

router.post('/generate-video', async (req, res) => {
    var { StrumminPatternArr, SingleBeatArr, IntensityArr, MetronomeClicksArr, Id, Time, BPM, MetronomeOnOff, TimeSignature } = req.body;

    // StrumminPatternArr = [  [    "D",    "Am"  ],  [    "E",    "Empty"  ],  [    "D",    "Empty"  ],  [    "U",    "Empty"  ],  [    "D",    "Empty"  ],  [    "E",    "Empty"  ],  [    "D",    "Empty"  ],  [    "U",    "Empty"  ],  [    "E",    "Empty"  ],  [    "U",    "Empty"  ],  [    "E",    "Empty"  ],  [    "U",    "Empty"  ],  [    "D",    "Empty"  ],  [    "U",    "Empty"  ],  [    "E",    "Empty"  ],  [    "U",    "Empty"  ],  [    "D",    "F"  ],  [    "E",    "Empty"  ],  [    "D",    "Empty"  ],  [    "U",    "Empty"  ],  [    "D",    "Empty"  ],  [    "E",    "Empty"  ],  [    "D",    "Empty"  ],  [    "U",    "Empty"  ],  [    "E",    "Empty"  ],  [    "U",    "Empty"  ],  [    "E",    "Empty"  ],  [    "U",    "Empty"  ],  [    "D",    "G7"  ],  [    "U",    "Empty"  ],  [    "E",    "Empty"  ],  [    "U",    "Empty"  ]]
    // SingleBeatArr = [  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default",  "Default"]
    // IntensityArr = []
    // MetronomeClicksArr = [  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0,  "Beat",  0]
    // Id = "ID",
    // Time = "16.37",
    // BPM = "130",
    // MetronomeOnOff = true,
    // TimeSignature = [4, 4]

    Id = Id + Time
    let DirToSave = path.join(`${__dirname}/../public/downloads/`, `${Id}/${Time}`);
    if (!fs.existsSync(DirToSave)) {
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}`)
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}/${Time}`)
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}/${Time}/ChordsAudios`)
    }

    let ChordVideoArr = await CreateChordVideoTextFile(StrumminPatternArr, BPM, DirToSave, SingleBeatArr, TimeSignature, "handmade")
    let UpDownVideoArr = await CreateUpDownVideoTextFile(StrumminPatternArr, BPM, DirToSave, SingleBeatArr, TimeSignature, "handmade")
    let AudioArr = await CreateChordAudioTextFile(StrumminPatternArr, BPM, DirToSave, SingleBeatArr, TimeSignature, IntensityArr)
    let AudioDataArr = [];

    // return res.send("ok")

    for (let i = 0; i < AudioArr.length; i++) {
        AudioDataArr.push(AudioArr[i][0])
    }
    AudioDataArr = removeDuplicates(AudioDataArr)

    // Download Required Files

    for (let i = 0; i < ChordVideoArr.length; i++) {
        await DownloadFiles(ChordVideoArr[i], DirToSave)
    }

    for (let i = 0; i < UpDownVideoArr.length; i++) {
        await DownloadFiles(UpDownVideoArr[i], DirToSave)
    }

    for (let i = 0; i < AudioDataArr.length; i++) {
        await DownloadAudios(AudioDataArr[i], DirToSave)
    }

    // Check If Audio Length Short or not(arr, dirToFetchFiles)
    await CheckAudioLengthShort(AudioArr, `./public/downloads/${Id}/${Time}`)

    // Moving audios to ChordAudios Folder
    for (let i = 0; i < AudioDataArr.length; i++) {
        let FilesAvailable = path.join(`${__dirname}/../public/downloads/${Id}/${Time}/ChordsAudios`, `${AudioDataArr[i]}`);
        if (!fs.existsSync(FilesAvailable)) {
            fs.renameSync(path.join(`${__dirname}/../public/downloads/${Id}/${Time}/`, `${AudioDataArr[i]}`), FilesAvailable, function (err) {
                if (err) throw err
                console.log('Successfully moved')

            })
        } else {
            // fs.unlinkSync(path.join(`${__dirname}/../public/downloads/${Id}/${Time}/`, `${AudioDataArr[i]}`))
        }

    }

    let ConcatAudiosFiles = ""
    for (let i = 0; i < AudioArr.length; i++) {

        await TrimAudioLength(`./public/downloads/${Id}/${Time}/ChordsAudios/${AudioArr[i][0]}`, AudioArr[i][1], `./public/downloads/${Id}/${Time}/ChordsAudios/Audio${i}`)
        ConcatAudiosFiles += `-i ./public/downloads/${Id}/${Time}/ChordsAudios/Audio${i}.wav `

    }


    if (MetronomeOnOff) {
        let afterHowmayBoxes = await CreateMetronomeAudioTextFile(StrumminPatternArr, BPM, DirToSave, MetronomeClicksArr, TimeSignature)
        await DownloadFiles("Click1.wav", DirToSave)
        await DownloadFiles("Click2.wav", DirToSave)

        let IncreaseMetronomeSound = afterHowmayBoxes + 4

        await CreatSilentSound(IncreaseMetronomeSound, `./public/downloads/${Id}/${Time}/`)

        let FilesPaths1 = `-i ./public/downloads/${Id}/${Time}/Click1.wav -i ./public/downloads/${Id}/${Time}/silence.wav`
        let FilesPaths2 = `-i ./public/downloads/${Id}/${Time}/Click2.wav -i ./public/downloads/${Id}/${Time}/silence.wav`

        await ConcatAudios(FilesPaths1, "2", `./public/downloads/${Id}/${Time}/ChordsAudios/Click1`)
        await ConcatAudios(FilesPaths2, "2", `./public/downloads/${Id}/${Time}/ChordsAudios/Click2`)

        fs.unlinkSync(`./public/downloads/${Id}/${Time}/silence.wav`)

        fs.renameSync(path.join(`${__dirname}/../public/downloads/${Id}/${Time}/`, `Metronome.txt`), path.join(`${__dirname}/../public/downloads/${Id}/${Time}/ChordsAudios/`, `Metronome.txt`), function (err) {
            if (err) throw err
            console.log('Successfully moved')

        })
    }

    let Video1 = await ConcatVideos(`./public/downloads/${Id}/${Time}/ChordsVideo.txt`, `./public/downloads/${Id}/${Time}/ConcatChordsVideo`)
    let Video2 = await ConcatVideos(`./public/downloads/${Id}/${Time}/UpDown.txt`, `./public/downloads/${Id}/${Time}/ConcatUpDownVideo`)

    let Audio1 = await ConcatAudios(ConcatAudiosFiles, AudioArr.length, `./public/downloads/${Id}/${Time}/ConcatChordAudio`)

    let Audio2, MergedAudio

    if (MetronomeOnOff) {

        Audio2 = await ConcatAudiosForMetronome(`./public/downloads/${Id}/${Time}/ChordsAudios/Metronome.txt`, `./public/downloads/${Id}/${Time}/ConcatMetronomeAudio`)
        MergedAudio = await MergeAudios(`./public/downloads/${Id}/${Time}/ConcatMetronomeAudio.wav`, `./public/downloads/${Id}/${Time}/ConcatChordAudio.wav`, `./public/downloads/${Id}/${Time}/MergedAudio`)
    }

    let MeregdVideo = await VideoLeftRightMerge(`./public/downloads/${Id}/${Time}/ConcatUpDownVideo.mp4`, `./public/downloads/${Id}/${Time}/ConcatChordsVideo.mp4`, `./public/downloads/${Id}/${Time}/MergedVideo`)

    if (MeregdVideo) {
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}Output`)
    }

    let output;
    if (MetronomeOnOff) {

        output = await AddAudioToVideo(`./public/downloads/${Id}/${Time}/MergedAudio.wav`, `./public/downloads/${Id}/${Time}/MergedVideo.mp4`, `./public/downloads/${Id}Output/output`)
    } else {

        output = await AddAudioToVideo(`./public/downloads/${Id}/${Time}/ConcatChordAudio.wav`, `./public/downloads/${Id}/${Time}/MergedVideo.mp4`, `./public/downloads/${Id}Output/output`)
    }


    if (output) {
        fs.rmSync(path.join(`${__dirname}/../public/downloads/${Id}`), { recursive: true, force: true });
    }


    return res.send("Generated")

})

router.post('/generate-video-old', async (req, res) => {
    var { MainArray, Id, Time, BPM, MetronomeOnOff, TimeSignature, DefaultTimeSign } = req.body;
    console.log(TimeSignature);
    // var MainArray = [["D", "Am"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"],["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"],["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["D", "G"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["E", "Empty"], ["U", "Empty"], ["E", "Empty"], ["E", "Empty"], ["D", "Am"], ["E", "Empty"], ["D", "G"], ["E", "Empty"], ["D", "G"], ["E", "Empty"], ["D", "Am"], ["E", "Empty"], ["E", "Empty"], ["U", "G"]]
    // var Id = "ID"
    // var Time = "16.21"
    // var BPM = "70"

    Id = Id + Time
    BPM = ((60000 / (BPM * 2)) / 1000).toFixed(3)
    if (MetronomeOnOff == "true") {
        MetronomeOnOff = true
    } else {
        MetronomeOnOff = false

    }

    console.log(BPM);

    let DirToSave = path.join(`${__dirname}/../public/downloads/`, `${Id}/${Time}`);
    if (!fs.existsSync(DirToSave)) {
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}`)
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}/${Time}`)
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}/${Time}/ChordsAudios`)

    }

    let ChordVideoArr = await CreateChordVideoTextFile(MainArray, BPM, DirToSave)
    let UpDownVideoArr = await CreateUpDownVideoTextFile(MainArray, BPM, DirToSave)
    let AudioArr = await CreateChordAudioTextFile(MainArray, BPM, DirToSave)
    let AudioDataArr = [];


    for (let i = 0; i < AudioArr.length; i++) {
        AudioDataArr.push(AudioArr[i][0])
    }
    AudioDataArr = removeDuplicates(AudioDataArr)

    // Download Required Files

    for (let i = 0; i < ChordVideoArr.length; i++) {
        await DownloadFiles(ChordVideoArr[i], DirToSave)
    }

    for (let i = 0; i < UpDownVideoArr.length; i++) {
        await DownloadFiles(UpDownVideoArr[i], DirToSave)
    }

    for (let i = 0; i < AudioDataArr.length; i++) {
        await DownloadFiles(AudioDataArr[i], DirToSave)
    }

    // Check If Audio Length Short or not(arr, dirToFetchFiles)
    await CheckAudioLengthShort(AudioArr, `./public/downloads/${Id}/${Time}`)

    // Moving audios to ChordAudios Folder
    for (let i = 0; i < AudioDataArr.length; i++) {
        let FilesAvailable = path.join(`${__dirname}/../public/downloads/${Id}/${Time}/ChordsAudios`, `${AudioDataArr[i]}`);
        if (!fs.existsSync(FilesAvailable)) {
            fs.renameSync(path.join(`${__dirname}/../public/downloads/${Id}/${Time}/`, `${AudioDataArr[i]}`), FilesAvailable, function (err) {
                if (err) throw err
                console.log('Successfully moved')

            })
        } else {
            // fs.unlinkSync(path.join(`${__dirname}/../public/downloads/${Id}/${Time}/`, `${AudioDataArr[i]}`))
        }

    }

    let ConcatAudiosFiles = ""
    for (let i = 0; i < AudioArr.length; i++) {

        await TrimAudioLength(`./public/downloads/${Id}/${Time}/ChordsAudios/${AudioArr[i][0]}`, AudioArr[i][1], `./public/downloads/${Id}/${Time}/ChordsAudios/Audio${i}`)
        ConcatAudiosFiles += `-i ./public/downloads/${Id}/${Time}/ChordsAudios/Audio${i}.wav `

    }

    if (MetronomeOnOff) {
        let afterHowmayBoxes = await CreateMetronomeAudioTextFile(MainArray, BPM, DirToSave, TimeSignature, DefaultTimeSign)
        await DownloadFiles("Click1.wav", DirToSave)
        await DownloadFiles("Click2.wav", DirToSave)

        let IncreaseMetronomeSound = (BPM * afterHowmayBoxes) + 4

        await CreatSilentSound(IncreaseMetronomeSound, `./public/downloads/${Id}/${Time}/`)

        let FilesPaths1 = `-i ./public/downloads/${Id}/${Time}/Click1.wav -i ./public/downloads/${Id}/${Time}/silence.wav`
        let FilesPaths2 = `-i ./public/downloads/${Id}/${Time}/Click2.wav -i ./public/downloads/${Id}/${Time}/silence.wav`

        await ConcatAudios(FilesPaths1, "2", `./public/downloads/${Id}/${Time}/ChordsAudios/Click1`)
        await ConcatAudios(FilesPaths2, "2", `./public/downloads/${Id}/${Time}/ChordsAudios/Click2`)

        fs.unlinkSync(`./public/downloads/${Id}/${Time}/silence.wav`)

        fs.renameSync(path.join(`${__dirname}/../public/downloads/${Id}/${Time}/`, `Metronome.txt`), path.join(`${__dirname}/../public/downloads/${Id}/${Time}/ChordsAudios/`, `Metronome.txt`), function (err) {
            if (err) throw err
            console.log('Successfully moved')

        })

    }

    let Video1 = await ConcatVideos(`./public/downloads/${Id}/${Time}/ChordsVideo.txt`, `./public/downloads/${Id}/${Time}/ConcatChordsVideo`)
    let Video2 = await ConcatVideos(`./public/downloads/${Id}/${Time}/UpDown.txt`, `./public/downloads/${Id}/${Time}/ConcatUpDownVideo`)

    let Audio1 = await ConcatAudios(ConcatAudiosFiles, AudioArr.length, `./public/downloads/${Id}/${Time}/ConcatChordAudio`)

    let Audio2, MergedAudio

    if (MetronomeOnOff) {

        Audio2 = await ConcatAudiosForMetronome(`./public/downloads/${Id}/${Time}/ChordsAudios/Metronome.txt`, `./public/downloads/${Id}/${Time}/ConcatMetronomeAudio`)
        MergedAudio = await MergeAudios(`./public/downloads/${Id}/${Time}/ConcatChordAudio.wav`, `./public/downloads/${Id}/${Time}/ConcatMetronomeAudio.wav`, `./public/downloads/${Id}/${Time}/MergedAudio`)
    }


    let MeregdVideo = await VideoLeftRightMerge(`./public/downloads/${Id}/${Time}/ConcatUpDownVideo.mp4`, `./public/downloads/${Id}/${Time}/ConcatChordsVideo.mp4`, `./public/downloads/${Id}/${Time}/MergedVideo`)

    if (MeregdVideo) {
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}Output`)
    }

    let output;
    if (MetronomeOnOff) {

        output = await AddAudioToVideo(`./public/downloads/${Id}/${Time}/MergedAudio.wav`, `./public/downloads/${Id}/${Time}/MergedVideo.mp4`, `./public/downloads/${Id}Output/output`)
    } else {

        output = await AddAudioToVideo(`./public/downloads/${Id}/${Time}/ConcatChordAudio.wav`, `./public/downloads/${Id}/${Time}/MergedVideo.mp4`, `./public/downloads/${Id}Output/output`)
    }


    if (output) {
        fs.rmSync(path.join(`${__dirname}/../public/downloads/${Id}`), { recursive: true, force: true });
    }


    // if (Video1 && Video2 && Audio1 && Audio2 && MeregdVideo && MergedAudio && output) {
    // } else {
    //     res.send("Error Happend")
    // }
    res.send("Generated")




})

router.post('/generate-audio', async (req, res) => {
    var { MainArray, Id, Time, BPM, MetronomeOnOff, TimeSignature, DefaultTimeSign } = req.body;
    console.log(TimeSignature);

    Id = Id + Time + "Audio"
    BPM = ((60000 / (BPM * 2)) / 1000).toFixed(3)
    if (MetronomeOnOff == "true") {
        MetronomeOnOff = true
    } else {
        MetronomeOnOff = false

    }

    console.log(BPM);

    let DirToSave = path.join(`${__dirname}/../public/downloads/`, `${Id}/${Time}`);
    if (!fs.existsSync(DirToSave)) {
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}`)
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}/${Time}`)
        fs.mkdirSync(`${__dirname}/../public/downloads/${Id}/${Time}/ChordsAudios`)

    }

    let AudioArr = await CreateChordAudioTextFile(MainArray, BPM, DirToSave)
    let AudioDataArr = [];


    for (let i = 0; i < AudioArr.length; i++) {
        AudioDataArr.push(AudioArr[i][0])
    }
    AudioDataArr = removeDuplicates(AudioDataArr)

    // Download Required Files

    for (let i = 0; i < AudioDataArr.length; i++) {
        await DownloadFiles(AudioDataArr[i], DirToSave)
    }

    // Check If Audio Length Short or not(arr, dirToFetchFiles)
    await CheckAudioLengthShort(AudioArr, `./public/downloads/${Id}/${Time}`)

    // Moving audios to ChordAudios Folder
    for (let i = 0; i < AudioDataArr.length; i++) {
        let FilesAvailable = path.join(`${__dirname}/../public/downloads/${Id}/${Time}/ChordsAudios`, `${AudioDataArr[i]}`);
        if (!fs.existsSync(FilesAvailable)) {
            fs.renameSync(path.join(`${__dirname}/../public/downloads/${Id}/${Time}/`, `${AudioDataArr[i]}`), FilesAvailable, function (err) {
                if (err) throw err
                console.log('Successfully moved')

            })
        } else {
            // fs.unlinkSync(path.join(`${__dirname}/../public/downloads/${Id}/${Time}/`, `${AudioDataArr[i]}`))
        }

    }

    let ConcatAudiosFiles = ""
    for (let i = 0; i < AudioArr.length; i++) {

        await TrimAudioLength(`./public/downloads/${Id}/${Time}/ChordsAudios/${AudioArr[i][0]}`, AudioArr[i][1], `./public/downloads/${Id}/${Time}/ChordsAudios/Audio${i}`)
        ConcatAudiosFiles += `-i ./public/downloads/${Id}/${Time}/ChordsAudios/Audio${i}.wav `

    }

    if (MetronomeOnOff) {
        let afterHowmayBoxes = await CreateMetronomeAudioTextFile(MainArray, BPM, DirToSave, TimeSignature, DefaultTimeSign)
        await DownloadFiles("Click1.wav", DirToSave)
        await DownloadFiles("Click2.wav", DirToSave)

        let IncreaseMetronomeSound = (BPM * afterHowmayBoxes) + 4

        await CreatSilentSound(IncreaseMetronomeSound, `./public/downloads/${Id}/${Time}/`)

        let FilesPaths1 = `-i ./public/downloads/${Id}/${Time}/Click1.wav -i ./public/downloads/${Id}/${Time}/silence.wav`
        let FilesPaths2 = `-i ./public/downloads/${Id}/${Time}/Click2.wav -i ./public/downloads/${Id}/${Time}/silence.wav`

        await ConcatAudios(FilesPaths1, "2", `./public/downloads/${Id}/${Time}/ChordsAudios/Click1`)
        await ConcatAudios(FilesPaths2, "2", `./public/downloads/${Id}/${Time}/ChordsAudios/Click2`)

        fs.unlinkSync(`./public/downloads/${Id}/${Time}/silence.wav`)

        fs.renameSync(path.join(`${__dirname}/../public/downloads/${Id}/${Time}/`, `Metronome.txt`), path.join(`${__dirname}/../public/downloads/${Id}/${Time}/ChordsAudios/`, `Metronome.txt`), function (err) {
            if (err) throw err
            console.log('Successfully moved')

        })

    }

    let Audio2, Audio1

    fs.mkdirSync(`${__dirname}/../public/downloads/${Id}Output`)

    let output;
    if (MetronomeOnOff) {
        Audio1 = await ConcatAudios(ConcatAudiosFiles, AudioArr.length, `./public/downloads/${Id}/${Time}/ConcatChordAudio`)
        Audio2 = await ConcatAudiosForMetronome(`./public/downloads/${Id}/${Time}/ChordsAudios/Metronome.txt`, `./public/downloads/${Id}/${Time}/ConcatMetronomeAudio`)
        output = await MergeAudios(`./public/downloads/${Id}/${Time}/ConcatChordAudio.wav`, `./public/downloads/${Id}/${Time}/ConcatMetronomeAudio.wav`, `./public/downloads/${Id}Output/output`)
    } else {
        output = await ConcatAudios(ConcatAudiosFiles, AudioArr.length, `./public/downloads/${Id}Output/output`)
    }


    if (output) {
        fs.rmSync(path.join(`${__dirname}/../public/downloads/${Id}`), { recursive: true, force: true });
        res.send("Generated")
    } else {
        res.send("Error")
    }

})

router.get("/check", (req, res) => {
    let filePath = path.join(`${__dirname}/../`, `img.jpg`);
    res.download(filePath, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Send`);
            // fs.unlinkSync(path.join(`${__dirname}/../public/downloads/${FileName}Output/output.mp4`), { recursive: true, force: true });
            // fs.rmSync(path.join(`${__dirname}/../public/downloads/${FileName}Output`), { recursive: true, force: true });

        }
    })
})

router.get('/download/:FileName', async (req, res) => {
    let FileName = req.params["FileName"]
    console.log(`start download2`);

    let filePath = path.join(`${__dirname}/../public/downloads/${FileName}Output`, `output.mp4`);
    res.download(filePath, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Send`);
            fs.unlinkSync(path.join(`${__dirname}/../public/downloads/${FileName}Output/output.mp4`), { recursive: true, force: true });
            // fs.rmSync(path.join(`${__dirname}/../public/downloads/${FileName}Output`), { recursive: true, force: true });

        }
    })
})

// error Handle of API
// then go yo next steps or another project

router.get('/download-audio/:FileName', async (req, res) => {
    let FileName = req.params["FileName"]
    console.log(`start download2`);

    let filePath = path.join(`${__dirname}/../public/downloads/${FileName}AudioOutput`, `output.wav`);
    res.download(filePath, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Send`);
            fs.unlinkSync(path.join(`${__dirname}/../public/downloads/${FileName}AudioOutput/output.wav`), { recursive: true, force: true });
            // fs.rmSync(path.join(`${__dirname}/../public/downloads/${FileName}AudioOutput`), { recursive: true, force: true });


        }
    })
})


router.post('/getChordsData', (req, res) => {
    let { ChordsArray } = req.body;
    ChordsArray = removeDuplicates(ChordsArray)

    ChordsArray = filtertheChordsFileName(ChordsArray)
    res.json({ ChordsData: ChordsArray })
})


router.post('/getChordsDataPremium', (req, res) => {
    let { ChordsAudioArray, ChordsVideoArray, ChordsVideoType } = req.body;

    ChordsAudioArray = removeDuplicates(ChordsAudioArray)
    let index = ChordsAudioArray.indexOf("E")
    ChordsAudioArray.splice(index, 1)

    ChordsVideoArray = removeDuplicates(ChordsVideoArray)
    ChordsVideoArray = filtertheChordsFileNamePremium(ChordsVideoArray, ChordsVideoType) // handmade pass, advanced arr pass {id: to check premium, soundIntensity: intensity}


    res.json({
        ChordsAudioArray: ChordsAudioArray,
        ChordsVideoArray: ChordsVideoArray
    })
})

function removeDuplicates(arr) {
    return [...new Set(arr)];
}

function filtertheChordsFileName(arr) {
    let NewArr = [];

    arr.map((e) => {
        NewArr.push(`${e}-default-up.wav`)
        NewArr.push(`${e}-default-down.wav`)
        NewArr.push(`${e}-handmade.mp4`)
    });

    return (NewArr);
}

function filtertheChordsFileNamePremium(arr, ChordsVideoType) {
    let NewArr = [];

    arr.map((e) => {
        if (ChordsVideoType == "animated") {

            NewArr.push(`${e}-animated.mp4`)
        } else {
            NewArr.push(`${e}-handmade.mp4`)
        }

    });

    return (NewArr);
}

function ConcatVideos(FilePath, OutputName) {
    return new Promise(resolve => {
        exec(`ffmpeg -safe 0 -f concat -i ${FilePath} -c copy ${OutputName}.mp4`, (err, stdout) => {
            if (err) {
                console.log(`error is the ${err}`);
                resolve(false)
            } else {
                console.log(`Concated Videos`);
                resolve(true)
            }
        })
    })

}
function ConcatAudios(FilesPaths, NoOfFiles, OutputName) {
    return new Promise(resolve => {
        exec(`ffmpeg -y ${FilesPaths} -filter_complex "[0:a][1:a]concat=n=${NoOfFiles}:v=0:a=1" ${OutputName}.wav`, (err, stdout) => {
            if (err) {
                console.log(`error is the ${err}`);
                resolve(false)
            } else {
                console.log(`Concated Audios`);
                resolve(true)
            }
        })
    })

}

function ConcatAudiosForMetronome(FilePath, OutputName) {
    return new Promise(resolve => {
        exec(`ffmpeg -safe 0 -f concat -i ${FilePath} -c copy ${OutputName}.wav`, (err, stdout) => {
            if (err) {
                console.log(`error is the ${err}`);
                resolve(false)
            } else {
                console.log(`Concated Audios`);
                resolve(true)
            }
        })
    })

}

// ffmpeg -i .\public\downloads\ID16.35\16.35\ConcatMetronomeAudio.wav -i .\public\downloads\ID16.35\16.35\ConcatChordAudio.wav -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" out.wav
// ffmpeg -i .\public\downloads\ID16.35\16.35\ConcatMetronomeAudio.wav -i .\public\downloads\ID16.35\16.35\ConcatChordAudio.wav -filter_complex amix=inputs=2:duration=first out2.wav
function MergeAudios(Audio1, Audio2, OutputName) {
    return new Promise(resolve => {
        exec(`ffmpeg -i ${Audio1} -i ${Audio2} -filter_complex amix=inputs=2:duration=first ${OutputName}.wav`, (err, stdout) => {
            if (err) {
                console.log(`error is the ${err}`);
                resolve(false)
            } else {
                console.log(`Merged Audios`);
                resolve(true)
            }
        })
    })

}

// `ffmpeg -i ${LeftVideo} -i ${RightVideo} -filter_complex "[0:v] scale=iw/2:ih/2, pad=2*iw:ih [left]; [1:v] scale=iw/2:ih/2, fade=out:300:30:alpha=1 [right]; [left][right] overlay=main_w/2:0" -b:v 768k -preset ultrafast ${OutputName}.mp4`
// Current
// ffmpeg -i ${LeftVideo} -i ${RightVideo} -filter_complex "[0:v] scale=iw/2:ih/2, pad=2*iw:ih [left]; [1:v] scale=iw/2:ih/2, fade=out:999999999:9999:alpha=1 [right]; [left][right] overlay=main_w/2:0" -b:v 768k -preset ultrafast ${OutputName}.mp4
// ffmpeg -i .\public\downloads\ID16.36\16.36\ConcatUpDownVideo.mp4 -i .\public\downloads\ID16.36\16.36\ConcatChordsVideo.mp4 -filter_complex "hstack,format=yuv420p" -c:v libx264 -crf 18 output.mp4
// ffmpeg -i .\public\downloads\ID16.36\16.36\ConcatUpDownVideo.mp4 -i .\public\downloads\ID16.36\16.36\ConcatChordsVideo.mp4 -filter_complex "[0:v]pad=iw*2:ih[int]; [int][1:v]overlay=W/2:0[vid]" -map "[vid]" -c:v libx264 -crf 23 out.mp4

// ffmpeg -i .\public\downloads\ID16.37\16.37\ConcatUpDownVideo.mp4 -i .\public\downloads\ID16.37\16.37\ConcatChordsVideo.mp4 -filter_complex '[0:v]pad=iw*2:ih[res];[res][1:v]overlay=W/2:0[out]' -map '[out]' output.mp4
// ffmpeg -i .\public\downloads\ID16.37\16.37\ConcatUpDownVideo.mp4 -i .\public\downloads\ID16.37\16.37\ConcatChordsVideo.mp4 -filter_complex "[0:v] scale=iw/2:ih/2, pad=2*iw:ih [left]; [1:v] scale=iw/2:ih/2, fade=out:999999999:9999:alpha=1 [right]; [left][right] overlay=main_w/2:0" -b:v 768k -preset ultrafast out.mp4
// ffmpeg -i .\public\downloads\ID16.37\16.37\ConcatUpDownVideo.mp4 -i .\public\downloads\ID16.37\16.37\ConcatChordsVideo.mp4 -filter_complex hstack out2.mp4
function VideoLeftRightMerge(LeftVideo, RightVideo, OutputName) {
    return new Promise(resolve => {
        exec(`ffmpeg -i ${LeftVideo} -i ${RightVideo} -filter_complex "[0:v] scale=iw/2:ih/2, pad=2*iw:ih [left]; [1:v] scale=iw/2:ih/2, fade=out:999999999:9999:alpha=1 [right]; [left][right] overlay=main_w/2:0" -b:v 768k -preset veryfast ${OutputName}.mp4`, (err, stdout) => {
            if (err) {
                console.log(`error is the ${err}`);
                resolve(false)
            } else {
                console.log(`Merged Videos`);
                resolve(true)
            }
        })
    })

}
// Working
// ffmpeg -i ${LeftVideo} -i ${RightVideo} -filter_complex "[0:v] scale=iw/2:ih/2, pad=2*iw:ih [left]; [1:v] scale=iw/2:ih/2, fade=out:300:30:alpha=1 [right]; [left][right] overlay=main_w/2:0" -b:v 768k ${OutputName}.mp4
// ffmpeg -i .\public\downloads\ID16.38\16.38\MergedVideo.mp4 -i .\public\downloads\ID16.38\16.38\MergedAudio.wav -map 0:v -map 1:a -c:v copy -shortest output.mp4
function AddAudioToVideo(Audio, Video, OutputName) {
    return new Promise(resolve => {
        exec(`ffmpeg -i ${Video} -i ${Audio} -map 0:v -map 1:a -c:v copy -shortest ${OutputName}.mp4`, (err, stdout) => {
            if (err) {
                console.log(`error is the ${err}`);
                resolve(false)
            } else {
                console.log(`Final OutPut succeeded`);
                resolve(true)
            }
        })
    })

}

async function TrimAudioLength(AudioPath, LengthToTrim, OutputName) {
    return new Promise(resolve => {
        exec(`ffmpeg -i ${AudioPath} -t ${LengthToTrim} ${OutputName}.wav`, (err, stdout) => {
            if (err) {
                console.log(`error is the ${err}`);
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })

}

function GetAudioLength(Chord) {
    let intensity = Chord.split("-")[1]

    if (Chord == "NC-muted-default-down.wav" || Chord == "NC-muted-default-up.wav") {
        intensity = "NC"
    }

    let Muted = Chord.split("-")[1] + Chord.split("-")[2]
    if (Muted == "mutedfull.wav" || Muted == "mutedhalf.wav") {
        intensity = "muted"
    }

    let duration = 6;

    switch (intensity) {
        case "NC":
            duration = 0;
            break;
        case "muted":
            duration = 0;
            break;

        default:
            duration = 5;
            break;
    }

    return 0;
}

// async function DownloadFiles(FileName, DirToSave) {
//     try {

//         let data = await fetch(`https://guitar-app-data.netlify.app/${FileName}`)
//         let responseFile = await data.body.pipe(fs.createWriteStream(`${DirToSave}/${FileName}`))
//     } catch (error) {
//         console.log(`Err of do`);
//         console.log(error);
//     }
// }

async function DownloadFiles(FileName, DirToSave) {
    let SavedFileName = FileName

    let checkbass = FileName.split("-")[1]
    let chord = FileName.split("-")[0]
    let type = FileName.split(".")
    type = type[type.length - 1]

    if (checkbass == "Bass" || checkbass == "BassShort") {

        let firstTwoChar = chord.slice(0, 2)
        if (firstTwoChar == "Bb" || firstTwoChar == "Ab" || firstTwoChar == "Db" || firstTwoChar == "Gb" || firstTwoChar == "Eb") {
            if (checkbass == "BassShort") {

                FileName = `${firstTwoChar}-short-bass.wav`
            } else {

                FileName = `${firstTwoChar}-bass.wav`
            }
        } else {
            if (checkbass == "BassShort") {
                FileName = `${chord.charAt(0)}-short-bass.wav`
            } else {

                FileName = `${chord.charAt(0)}-bass.wav`
            }
        }
    }

    try {
        const downloader = new Downloader({
            url: `https://guitar-app-data.s3.amazonaws.com/${FileName}`,
            directory: DirToSave,
            fileName: SavedFileName,
            cloneFiles: false,
            maxAttempts: 3,
        });

        try {
            await downloader.download();
        } catch (error) {
            //If all attempts fail, the last error is thrown.
            console.log("Final fail", error);
            console.log(FileName);
        }

    } catch (error) {
        console.log(`Err of do`);
        console.log(error);
    }

    console.log(`${SavedFileName} takes ${new Date()}`);
}

async function DownloadAudios(FileName, DirToSave) {
    try {
        const downloader = new Downloader({
            url: `https://guitar-app-data.s3.amazonaws.com/${FileName}`,
            directory: DirToSave,
            fileName: FileName,
            cloneFiles: false,
            maxAttempts: 3,
        });

        try {
            await downloader.download();
        } catch (error) {
            //If all attempts fail, the last error is thrown.
            console.log("Final fail", error);
            console.log(FileName);
        }

    } catch (error) {
        console.log(`Err of do`);
        console.log(error);
    }

    console.log(`${FileName} takes ${new Date()}`);

}

async function CreateChordVideoTextFile(arr, BPM, DirToSave, SingleBeatArr, TimeSignature, VideoTypeHandOrReal) {
    let content = "";
    let length = 0
    let ChordVideoArr = []
    let previousChrods = "A"
    for (let i = 0; i < arr.length; i++) {

        let bpm = CalculateBpm(BPM, SingleBeatArr[i], TimeSignature)
        length = length + parseFloat(bpm)

        if (arr[i][1] == "Empty") {

            if (i + 1 == arr.length) {
                length = length + parseFloat(bpm)

                content +=
                    `outpoint ${parseFloat(length).toFixed(2)}
file ${previousChrods}-${VideoTypeHandOrReal}.mp4
inpoint 0
outpoint 0.01`
            }

        } else {

            previousChrods = arr[i][1]
            if (i == 0) {
                content +=
                    `file ${arr[i][1]}-${VideoTypeHandOrReal}.mp4
inpoint ${0}
`
                ChordVideoArr.push(`${arr[i][1]}-${VideoTypeHandOrReal}.mp4`)
            } else {
                content +=
                    `outpoint ${parseFloat(length).toFixed(2)}
file ${arr[i][1]}-${VideoTypeHandOrReal}.mp4
inpoint ${0}
`
                ChordVideoArr.push(`${arr[i][1]}-${VideoTypeHandOrReal}.mp4`)
            }

            if (i + 1 == arr.length) {

                content +=
                    `outpoint ${bpm}
file ${previousChrods}-${VideoTypeHandOrReal}.mp4
inpoint 0
outpoint 0.01`

            }

            length = 0

        }
    }

    fs.writeFileSync(`${DirToSave}/ChordsVideo.txt`, content);

    ChordVideoArr = removeDuplicates(ChordVideoArr)
    return ChordVideoArr;

}

// async function CreateChordVideoTextFileOld(arr, BPM, DirToSave, SingleBeatArr, TimeSignature, VideoTypeHandOrReal) {
//     let content = "";
//     let storeValueTemp = 1
//     let ChordVideoArr = []
//     let oneTime = true
//     let previousChrods = "A"
//     for (let i = 0; i < arr.length; i++) {
//         let bpm = CalculateBpm(BPM, SingleBeatArr[i], TimeSignature)
//         if (arr[i][1] == "Empty") {
//             if (SingleBeatArr[i] == "Default") {
//                 storeValueTemp++
//                 oneTime = true
//             }

//             if (SingleBeatArr[i] == "16ths" || SingleBeatArr[i] == "Shuffle") {
//                 if (oneTime) {
//                     storeValueTemp++
//                     oneTime = false
//                 }
//             }

//             if (i + 1 == arr.length) {
//                 content +=
//                     `outpoint ${parseFloat(bpm * storeValueTemp).toFixed(2)}
// file ${previousChrods}-${VideoTypeHandOrReal}.mp4
// inpoint 0
// outpoint 0.01`
//                 // ChordVideoArr.push(`Temp.mp4`)
//             }
//         } else {
//             previousChrods = arr[i][1]
//             if (i == 0) {
//                 content +=
//                     `file ${arr[i][1]}-${VideoTypeHandOrReal}.mp4
// inpoint ${0}
// `
//                 ChordVideoArr.push(`${arr[i][1]}-${VideoTypeHandOrReal}.mp4`)
//             } else {
//                 content +=
//                     `outpoint ${parseFloat(bpm * storeValueTemp).toFixed(2)}
// file ${arr[i][1]}-${VideoTypeHandOrReal}.mp4
// inpoint ${0}
// `
//                 ChordVideoArr.push(`${arr[i][1]}-${VideoTypeHandOrReal}.mp4`)
//             }

//             if (i + 1 == arr.length) {
//                 content +=
//                     `outpoint ${bpm}
// file ${previousChrods}-${VideoTypeHandOrReal}.mp4
// inpoint 0
// outpoint 0.01`
//                 // ChordVideoArr.push(`Temp.mp4`)

//             }


//             storeValueTemp = 1

//         }
//     }

//     fs.writeFileSync(`${DirToSave}/ChordsVideo.txt`, content);

//     ChordVideoArr = removeDuplicates(ChordVideoArr)
//     return ChordVideoArr;

// }

function CalculateBpm(BPM, BeatMode, TimeSignature) {
    let speed = 2
    if (TimeSignature[1] == 4) {
        switch (BeatMode) {
            case "Default":
                speed = 2
                break;
            case "Shuffle":
                speed = 3
                break;
            case "16ths":
                speed = 4
                break;

            default:
                break;
        }
    } else {

        switch (BeatMode) {
            case "Default":
                speed = 2
                break;
            case "Shuffle":
                speed = 6
                break;
            case "16ths":
                speed = 4
                break;

            default:
                break;
        }

    }

    BPM = ((60000 / (BPM * speed)) / 1000).toFixed(3)

    return BPM
}

async function CreateUpDownVideoTextFile(arr, BPM, DirToSave, SingleBeatArr, TimeSignature, VideoTypeHandOrReal) {
    let UpDownVideoContent = "";
    let length = 0
    let Sturm = "Up"
    for (let i = 0; i < arr.length; i++) {

        let bpm = CalculateBpm(BPM, SingleBeatArr[i], TimeSignature)
        length = length + parseFloat(bpm)

        if (arr[i][0] == "D") {
            Sturm = "Down"
        }
        if (arr[i][0] == "U") {
            Sturm = "Up"
        }

        if (arr[i][0] == "E") {
            if (i + 1 == arr.length) {
                length = length + parseFloat(bpm)
                UpDownVideoContent +=
                    `outpoint ${parseFloat(length).toFixed(2)}
            file Hand${Sturm}-${VideoTypeHandOrReal}-default.mp4
            inpoint 0
            outpoint 0.01`
            }

        } else {

            if (i == 0) {
                UpDownVideoContent +=
                    `
            file Hand${Sturm}-${VideoTypeHandOrReal}-default.mp4
            inpoint 0
            `
            } else {
                UpDownVideoContent +=
                    `outpoint ${parseFloat(length).toFixed(2)}
            file Hand${Sturm}-${VideoTypeHandOrReal}-default.mp4
            inpoint 0
            `
                if (i + 1 == arr.length) {
                    UpDownVideoContent +=
                        `outpoint ${bpm}
                        file Hand${Sturm}-${VideoTypeHandOrReal}-default.mp4
inpoint 0
outpoint 0.01`
                }

                
            }
            
            length = 0

        }
    }
    fs.writeFileSync(`${DirToSave}/UpDown.txt`, UpDownVideoContent);

    return [`HandUp-${VideoTypeHandOrReal}-default.mp4`, `HandDown-${VideoTypeHandOrReal}-default.mp4`]
}

async function CreateChordAudioTextFile(arr, BPM, DirToSave, SingleBeatArr, TimeSignature, IntensityArr) {

    let ChordsAudio = "";
    let length = 0
    let StoreChordValue = ""
    let AudioArr = []
    let CorrectIntensity = ""

    if (IntensityArr.length == 0) {
        for (let i = 0; i < arr.length; i++) {
            IntensityArr.push("default")
        }
    }

    for (let i = 0; i < arr.length; i++) {

        CorrectIntensity = IntensityArr[i]
        CorrectIntensity = CorrectIntensity.split("-")[0]

        if (IntensityArr[i] == "NC") {
            CorrectIntensity = "NC"
        }

        if (IntensityArr[i] == "Bass") {
            CorrectIntensity = "Bass"
        }

        if (IntensityArr[i] == "BassShort") {
            CorrectIntensity = "BassShort"
        }

        if (IntensityArr[i] == "") {
            CorrectIntensity = "default"
        }

        let bpm = CalculateBpm(BPM, SingleBeatArr[i], TimeSignature)
        length = length + parseFloat(bpm)

        let Sturm = ""
        if (arr[i][0] == "D") {
            Sturm = "down"
        }
        if (arr[i][0] == "U") {
            Sturm = "up"
        }

        if (arr[i][1] != "Empty") {
            StoreChordValue = arr[i][1]
        }

        if (arr[i][0] == "E") {
            if (i + 1 == arr.length) {
                length = length + parseFloat(bpm)
                ChordsAudio +=
                    `outpoint ${parseFloat(length).toFixed(2)}`
                AudioArr.push(parseFloat(length).toFixed(2))
            }
        } else {

            if (i == 0) {

                switch (CorrectIntensity) {
                    case "muted":
                        ChordsAudio +=
                            `
                file ${StoreChordValue}-${IntensityArr[i]}.wav
                inpoint 0
                `
                        AudioArr.push(`${StoreChordValue}-${IntensityArr[i]}.wav`)


                        break;

                    case "NC":
                        ChordsAudio +=
                            `
                file NC-muted-default-${Sturm}.wav
                inpoint 0
                `
                        AudioArr.push(`NC-muted-default-${Sturm}.wav`)


                        break;

                    case "Bass":

                        let firstTwoChar = arr[i][1].slice(0, 2)
                        let chordNamewillbe = ""

                        if (firstTwoChar == "Bb" || firstTwoChar == "Ab" || firstTwoChar == "Db" || firstTwoChar == "Gb" || firstTwoChar == "Eb") {
                            chordNamewillbe = firstTwoChar
                        } else {
                            chordNamewillbe = firstTwoChar.charAt(0)
                        }

                        ChordsAudio +=
                            `
            file ${chordNamewillbe}-bass.wav
            inpoint 0
            `
                        AudioArr.push(`${chordNamewillbe}-bass.wav`)

                        break;

                    case "BassShort":

                        let firstTwoCharShort = arr[i][1].slice(0, 2)
                        let chordNamewillbeShort = ""

                        if (firstTwoCharShort == "Bb" || firstTwoCharShort == "Ab" || firstTwoCharShort == "Db" || firstTwoCharShort == "Gb" || firstTwoCharShort == "Eb") {
                            chordNamewillbeShort = firstTwoCharShort
                        } else {
                            chordNamewillbeShort = firstTwoCharShort.charAt(0)
                        }

                        ChordsAudio +=
                            `
            file ${chordNamewillbeShort}-short-bass.wav
            inpoint 0
            `
                        AudioArr.push(`${chordNamewillbeShort}-short-bass.wav`)

                        break;

                    default:
                        ChordsAudio +=
                            `
                file ${StoreChordValue}-${IntensityArr[i]}-${Sturm}.wav
                inpoint 0
                `
                        AudioArr.push(`${StoreChordValue}-${IntensityArr[i]}-${Sturm}.wav`)

                        break;
                }


            } else {

                switch (CorrectIntensity) {
                    case "muted":
                        ChordsAudio +=
                            `outpoint ${parseFloat(length).toFixed(2)}
                file ${StoreChordValue}-${IntensityArr[i]}.wav
                inpoint 0
                `
                        AudioArr.push(parseFloat(length).toFixed(2))
                        AudioArr.push(`${StoreChordValue}-${IntensityArr[i]}.wav`)
                        break;

                    case "NC":
                        ChordsAudio +=
                            `outpoint ${parseFloat(length).toFixed(2)}
                file NC-muted-default-${Sturm}.wav
                inpoint 0
                    `
                        AudioArr.push(parseFloat(length).toFixed(2))
                        AudioArr.push(`NC-muted-default-${Sturm}.wav`)
                        break;

                    case "Bass":

                        let firstTwoChar = arr[i][1].slice(0, 2)
                        let chordNamewillbe = ""

                        if (firstTwoChar == "Bb" || firstTwoChar == "Ab" || firstTwoChar == "Db" || firstTwoChar == "Gb" || firstTwoChar == "Eb") {
                            chordNamewillbe = firstTwoChar
                        } else {
                            chordNamewillbe = firstTwoChar.charAt(0)
                        }

                        ChordsAudio +=
                            `outpoint ${parseFloat(length).toFixed(2)}
                file ${chordNamewillbe}-bass.wav
                inpoint 0
                `
                        AudioArr.push(parseFloat(length).toFixed(2))
                        AudioArr.push(`${chordNamewillbe}-bass.wav`)



                        break;

                    case "BassShort":

                        let firstTwoCharShort = arr[i][1].slice(0, 2)
                        let chordNamewillbeShort = ""

                        if (firstTwoCharShort == "Bb" || firstTwoCharShort == "Ab" || firstTwoCharShort == "Db" || firstTwoCharShort == "Gb" || firstTwoCharShort == "Eb") {
                            chordNamewillbeShort = firstTwoCharShort
                        } else {
                            chordNamewillbeShort = firstTwoCharShort.charAt(0)
                        }

                        ChordsAudio +=
                            `outpoint ${parseFloat(length).toFixed(2)}
                file ${chordNamewillbeShort}-short-bass.wav
                inpoint 0
                `
                        AudioArr.push(parseFloat(length).toFixed(2))
                        AudioArr.push(`${chordNamewillbeShort}-short-bass.wav`)



                        break;

                    default:
                        ChordsAudio +=
                            `outpoint ${parseFloat(length).toFixed(2)}
                file ${StoreChordValue}-${IntensityArr[i]}-${Sturm}.wav
                inpoint 0
                `
                        AudioArr.push(parseFloat(length).toFixed(2))
                        AudioArr.push(`${StoreChordValue}-${IntensityArr[i]}-${Sturm}.wav`)
                        break;
                }




                if (i + 1 == arr.length) {
                    ChordsAudio +=
                        `outpoint ${bpm}`
                    AudioArr.push(bpm)
                }

            }
            
            length = 0

        }
    }

    fs.writeFileSync(`${DirToSave}/ChordsAudio.txt`, ChordsAudio);
    AudioArr = DivideArr(AudioArr)

    return AudioArr


}

async function CreateMetronomeAudioTextFile(arr, BPM, DirToSave, MetronomeClicksArr, TimeSignature) {

    let MetronomeContent = "";
    let bottomValue = TimeSignature[1]
    let bpm = ((60000 / (BPM * 1)) / 1000).toFixed(3)

    if (bottomValue == 4) {
        bpm = ((60000 / (BPM * 1)) / 1000).toFixed(3)

    } else {
        bpm = ((60000 / (BPM * 2)) / 1000).toFixed(3)
    }

    let MetronomeArr = MetronomeClicksArr.filter(function (a) { return a !== 0 })

    let count = 0;
    for (let i = 0; i < MetronomeArr.length; i++) {

        if (count == bottomValue) {
            count = 0;
        }

        if (count == 0) {
            MetronomeContent += `
                    file Click1.wav
                    inpoint 0
                    outpoint ${bpm}`

        } else {
            MetronomeContent += `
                    file Click2.wav
                    inpoint 0
                    outpoint ${bpm}`
        }

        count++
    }

    fs.writeFileSync(`${DirToSave}/Metronome.txt`, MetronomeContent);

    return bpm;
}

async function CheckAudioLengthShort(arr, DireToFetch) {
    for (let i = 0; i < arr.length; i++) {
        let duration = 0
        // duration = parseFloat(duration).toFixed(0)

        // if (duration < parseFloat(arr[i][1]).toFixed(2)) {
        // console.log(`Start Silence ${arr[i][0]}`);
        duration = (arr[i][1] - duration) + 10
        await CreatSilentSound(duration, DireToFetch)
        let FilesPaths = `-i ${DireToFetch}/${arr[i][0]} -i ${DireToFetch}/silence.wav`
        let OutputName = arr[i][0];
        OutputName = OutputName.split(".")[0]
        await ConcatAudios(FilesPaths, "2", `${DireToFetch}/ChordsAudios/${OutputName}`)
        // }
    }
}

function ExtendAudio(filePath, FileName) {

    return new Promise(resolve => {
        exec(`ffmpeg -i ${filePath}/${FileName} -i ${filePath}/silence.wav -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" -y ${filePath}/ChordsAudios/${FileName}`, (err, stdout) => {
            if (err) {
                console.log(`error is the ${err}`);
                resolve(false)
            } else {
                // fs.unlinkSync(`${filePath}/silence.wav`)
                resolve(true)
            }
        })
    })
}

async function CreatSilentSound(duration, DirToSave) {

    return new Promise(resolve => {
        exec(`ffmpeg -y -f lavfi -i anullsrc=channel_layout=5.1:sample_rate=48000 -t ${duration} ${DirToSave}/silence.wav`, (err, stdout) => {
            if (err) {
                console.log(`error is the ${err}`);
                resolve(false)
            } else {
                console.log(`Created Silence`);
                resolve(true)
            }
        })
    })


}

function DivideArr(arr) {
    let NewArr = []

    for (let i = 0; i < arr.length; i++) {
        if ((i + 1) % 2) {
            NewArr.push([arr[i], arr[i + 1]])
        }
    }
    return NewArr
}

module.exports = router;