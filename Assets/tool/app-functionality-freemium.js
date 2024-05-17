let firstTime = true;
let BarsVisible = false, IntensitySelectVisible = false;
let TheMainValue, DefaultTimeSign;
let AudioIntensity = []
let isAdvancedMode = false
let VideoType = "animated"
let SetPatternNumber = 0
let SetChordNumber = 0
let IncrementPatternsNumber = 0
let BeatIdNumber = 0
let InstantStartFrom = 0
let NumberOfBeatArr = []
let MetronomeClickArr = []
let MetronomeSpeedArr = []
let showSections = true
let IsSplit = false
let RandomRightHandVideo = ""
let BarStartFrom = 0
let BarHTMLContentArr = ""
let PreviewAudioPlay = false
auto();
var API = ""
// var API = "https://strummingmagician.com"

function auto() {
    let logo = document.getElementById("loading-image");
    logo.src = logo.getAttribute("src")

    SyncSongFromDatabase()
    ShowGenerateBtn()

    if (localStorage.getItem("TopValue")) {
        document.getElementById("TimeSignatureTopValue").value = localStorage.getItem("TopValue");
        document.getElementById("TimeSignatureBottomValue").value = localStorage.getItem("BottomValue");
    }
    if (localStorage.getItem("StrummingPatternArrHold")) {
        localStorage.setItem("StrummingPatternArr", localStorage.getItem("StrummingPatternArrHold"))
        localStorage.removeItem("StrummingPatternArrHold")
    }

    if (localStorage.getItem("ModeArrHold")) {
        localStorage.setItem("ModeArr", localStorage.getItem("ModeArrHold"))
        localStorage.removeItem("ModeArrHold")
    }

    if (localStorage.getItem("BeatArrHold")) {
        localStorage.setItem("BeatArr", localStorage.getItem("BeatArrHold"))
        localStorage.removeItem("BeatArrHold")
    }

    if (localStorage.getItem("StoreIntensityArrHold")) {
        localStorage.setItem("StoreIntensityArr", localStorage.getItem("StoreIntensityArrHold"))
        localStorage.removeItem("StoreIntensityArrHold")
    }

    if (localStorage.getItem("TransposeKey")) {
        document.getElementById("TransposeKeyValue").value = localStorage.getItem("TransposeKey")
    }else{
        localStorage.setItem("TransposeKey", "0")
    }

    if(localStorage.getItem("BPM")){
        document.getElementById("BpmValue").value = localStorage.getItem("BPM")
    }else{
        localStorage.setItem("BPM", 70)
    }

    
    if(localStorage.getItem("Metronome")){
        
        document.getElementById("metronomeSound").checked = metronomeValueTrueorFalse()
    }else{
        localStorage.setItem("Metronome", true)
    }
    
    CheckAdvancedModeAciveRealTime()
    GetMainValueByTimeSign()
}

function CheckAdvancedModeAciveRealTime(){
    localStorage.setItem("AdvancedMode", isAdvancedMode)
}

function IsMetronomeClickOn(ele){
    localStorage.setItem("Metronome", ele.checked)
}

function UpdateTimeSign() {
    if (localStorage.getItem("StrummingPatternArr")) {
        return alert("Sorry, you can't change Time Signature at this time. Try to Reset Patterns to change the Time Signature")
    }
    GetMainValueByTimeSign()

}

function metronomeValueTrueorFalse(){
        if(localStorage.getItem("Metronome")=="true"){
            return true
        }else{
            return false
        }
}

function ChangeAllBarsMode() {
    let CheckMetroOn = false
    if (localStorage.getItem("Metronome")) {
        document.querySelector('#PlayPauseVideo').click()
        CheckMetroOn = true
    }
    switch (true) {
        case document.querySelector("#Default").checked:
            localStorage.setItem("DefaultTimeSign", "Default")
            DefaultTimeSign = "Default"
            break;
        case document.querySelector("#TimeSign16ths").checked:
            localStorage.setItem("DefaultTimeSign", "16ths")
            DefaultTimeSign = "16ths"
            break;
        case document.querySelector("#Shuffle").checked:
            localStorage.setItem("DefaultTimeSign", "Shuffle")
            DefaultTimeSign = "Shuffle"

            break;

        default:
            break;
    }
    CreatePatternBoxes()

    if (CheckMetroOn) {
        document.querySelector('#RestartVideo').click()
    }
    document.getElementById("GenerateVideo").style.display = "inline-block"
    // document.getElementById("AdvancedMode").style.display = "inline-block"

    document.getElementById("AdvancedModeExit").style.display = "none"
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"
}

function ChangingAllModes(BarIndex, ChangeTo) {
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    let ModeArr = localStorage.getItem("ModeArr");

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    ModeArr = JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    if (ModeArr[BarIndex] == ChangeTo) {
        return
    }

    let FunctionUsed = `${ModeArr[BarIndex]}To${ChangeTo}`

    let CuttingArr = []
    let CutArr = []
    let count = 0
    ModeArr.map(function (val, index) {
        switch (val) {
            case "Default":
                count += TheMainValue
                CuttingArr.push(count)
                CutArr.push(TheMainValue)
                break;
            case "Shuffle":
                if (document.getElementById("TimeSignatureBottomValue").value == 4) {

                    count += (TheMainValue / 2) * 3
                    CutArr.push((TheMainValue / 2) * 3)

                    CuttingArr.push(count)
                } else {
                    count += TheMainValue * 3
                    CutArr.push(TheMainValue * 3)

                    CuttingArr.push(count)

                }

                break;
            case "16ths":
                count += TheMainValue * 2
                CutArr.push(TheMainValue * 2)

                CuttingArr.push(count)
                break;

            default:
                break;
        }
    })

    let slicedArray = StrummingPatternArr.slice(CuttingArr[BarIndex - 1], CuttingArr[BarIndex]);
    let temp
    if (document.getElementById("TimeSignatureBottomValue").value == 4) {
        switch (FunctionUsed) {
            case "DefaultToShuffle":
                temp = DefaultToShuffle(slicedArray)

                break;
            case "DefaultTo16ths":
                temp = DefaultTo16th(slicedArray)

                break;
            case "ShuffleToDefault":
                temp = ShuffleToDefault(slicedArray)

                break;
            case "ShuffleTo16ths":
                temp = ShuffleTo16ths(slicedArray)

                break;
            case "16thsToDefault":
                temp = Fn16thToDefault(slicedArray)

                break;
            case "16thsToShuffle":
                temp = Fn16thToShuffle(slicedArray)

                break;

            default:
                break;
        }
    } else {
        switch (FunctionUsed) {
            case "DefaultToShuffle":
                temp = DefaultToShuffleby8(slicedArray)

                break;
            case "DefaultTo16ths":
                temp = DefaultTo16thby8(slicedArray)

                break;
            case "ShuffleToDefault":
                temp = ShuffleToDefaultby8(slicedArray)

                break;
            case "ShuffleTo16ths":
                temp = ShuffleTo16thsby8(slicedArray)

                break;
            case "16thsToDefault":
                temp = Fn16thToDefaultby8(slicedArray)

                break;
            case "16thsToShuffle":
                temp = Fn16thToShuffleby8(slicedArray)

                break;

            default:
                break;
        }
    }

    StrummingPatternArr.splice((CuttingArr[BarIndex - 1]), CutArr[BarIndex], ...temp);
    ModeArr.splice((BarIndex), 1, ChangeTo);

    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);

    ModeArr = JSON.stringify(ModeArr);
    localStorage.setItem("ModeArr", ModeArr);
}

function GetMainValueByTimeSign() {
    let CheckMetroOn = false
    if (localStorage.getItem("Metronome")) {
        document.querySelector('#PlayPauseVideo').click()
        CheckMetroOn = true
    }
    let SpecificPattern = localStorage.getItem("SpecificPattern")
    if (SpecificPattern) {
        return console.log("Can't update time Signature, try to back to All Patterns")
    }

    let topValue = document.getElementById("TimeSignatureTopValue").value
    let BottomValue = document.getElementById("TimeSignatureBottomValue").value

    if (!topValue || topValue <= 0) {
        topValue = 4
        document.getElementById("TimeSignatureTopValue").value = 4;
    }

    if (!BottomValue || BottomValue <= 0) {
        BottomValue = 4
        document.getElementById("TimeSignatureBottomValue").value = 4;
    }

    localStorage.setItem("TopValue", topValue)
    localStorage.setItem("BottomValue", BottomValue)

    if (BottomValue == 16) {
        BottomValue = 8;
    }

    let MainValue = (topValue / BottomValue) * 8;
    TheMainValue = MainValue;

    switch (true) {
        case document.querySelector("#Default").checked:
            localStorage.setItem("DefaultTimeSign", "Default")
            DefaultTimeSign = "Default"
            break;
        case document.querySelector("#TimeSign16ths").checked:
            localStorage.setItem("DefaultTimeSign", "16ths")
            DefaultTimeSign = "16ths"

            TheMainValue = 2 * TheMainValue
            break;
        case document.querySelector("#Shuffle").checked:
            localStorage.setItem("DefaultTimeSign", "Shuffle")
            DefaultTimeSign = "Shuffle"



            if (BottomValue == 8) {
                TheMainValue = 3 * TheMainValue
            } else {
                TheMainValue = 1.5 * TheMainValue
            }
            break;

        default:
            break;
    }
    localStorage.setItem("TheMainValue", TheMainValue)

    CreatePatternBoxes()
    CancelTimeSign()

    if(isAdvancedMode){
        // AdvancedMode()
    }else{
        DisplayStrummingPattern()
    }

    if (CheckMetroOn) {
        document.querySelector('#RestartVideo').click()
    }

}

function CreatePatternBoxes() {
    let container = document.getElementById("CreatePatternBlock");
    container.innerHTML = `
    <div class="container mt-2" id="NumberPattern"></div>
    <div class="container mt-2" id="UpperPattern"></div>
    <div class="container mt-3" id="DownPattern"></div>`

    let NumberOfBoxes = 8
    let DivideNumber = 2

    if (document.getElementById("TimeSignatureBottomValue").value == 4) {
        switch (DefaultTimeSign) {
            case "Default":
                DivideNumber = 2
                NumberOfBoxes = TheMainValue
                break;
            case "16ths":
                DivideNumber = 4
                NumberOfBoxes = TheMainValue * 2
                break;
            case "Shuffle":
                DivideNumber = 3
                NumberOfBoxes = TheMainValue * 1.5
                break;

            default:
                break;
        }
    } else {
        switch (DefaultTimeSign) {
            case "Default":
                DivideNumber = 1
                NumberOfBoxes = TheMainValue
                break;
            case "16ths":
                DivideNumber = 2
                NumberOfBoxes = TheMainValue * 2
                break;
            case "Shuffle":
                DivideNumber = 3
                NumberOfBoxes = TheMainValue * 3
                break;

            default:
                break;
        }
    }

    let count = 1
    for (let i = 0; i < NumberOfBoxes; i++) {

        let NumberPattern;
        if (i % DivideNumber == 0) {
            NumberPattern = `

        <div class="strumming-pattern-numbers-top">
            <div class="pattern-number-Main">${count}</div>
        </div>
        `
            count++
        } else {
            NumberPattern = `

        <div class="strumming-pattern-numbers-top">
        </div>
        `
        }



        let UpperAppendData = `
        <div class="strumming-pattern">
            <select class="strumming-pattern-select" name="" id="">
                <option value="U">U &uarr;</option>
                <option value="D">D &#8595;</option>
                <option value="E" selected>&nbsp;</option>
            </select>
        </div>`

        let DownAppendData = `
        <div class="strumming-pattern">

        <select class="strumming-pattern-select" name="" id="">

        <option value="Empty" selected>--</option>

        <option value="A" >A</option>
        <option value="Am" >Am</option>
        <option value="A7" >A7</option>
        <option value="Am7" >Am7</option>

        <option value="B" >B</option>
        <option value="Bm" >Bm</option>
        <option value="B7" >B7</option>
        <option value="Bm7" >Bm7</option>

        <option value="Bb">Bb (A#)</option>
        <option value="Bbm" >Bbm (A#m)</option>
        <option value="Bb7" >Bb7 (A#7)</option>
        <option value="Bbm7" >Bbm7 (A#m7)</option>
       
        <option value="C" >C</option>
        <option value="Cm" >Cm</option>
        <option value="C7" >C7</option>
        <option value="Cm7" >Cm7</option>

        <option value="D" >D</option>
        <option value="Dm" >Dm</option>
        <option value="D7" >D7</option>
        <option value="Dm7" >Dm7</option>

        <option value="Db" >C# (Db)</option>
        <option value="Dbm" >C#m (Dbm)</option>
        <option value="Db7" >C#7 (Db7)</option>
        <option value="Dbm7" >C#m7 (Dbm7)</option>

        <option value="E" >E</option>
        <option value="Em" >Em</option>
        <option value="E7" >E7</option>
        <option value="Em7" >Em7</option>

        <option value="Eb" >Eb (D#)</option>
        <option value="Ebm" >D#m (Ebm)</option>
        <option value="Eb7" >D#7 (Eb7)</option>
        <option value="Ebm7" >D#m7 (Ebm7)</option>
    

        <option value="F" >F</option>
        <option value="Fm" >Fm</option>
        <option value="F7" >F7</option>
        <option value="Fm7" >Fm7</option>

        <option value="G" >G</option>
        <option value="Gm" >Gm</option>
        <option value="G7" >G7</option>
        <option value="Gm7" >Gm7</option>

        <option value="Gb" >F# (Gb)</option>
        <option value="Gbm" >F#m (Gbm)</option>
        <option value="Gb7" >F#7 (Gb7)</option>
        <option value="Gbm7" >F#m7 (Gbm7)</option>

        <option value="Ab" >Ab (G#)</option>
        <option value="Abm" >Abm (G#m)</option>
        <option value="Ab7" >Ab7 (G#7)</option>
        <option value="Abm7" >Abm7 (G#m7)</option>

        </select>
        </div>`

        document.getElementById("UpperPattern").innerHTML += UpperAppendData
        document.getElementById("DownPattern").innerHTML += DownAppendData
        document.getElementById("NumberPattern").innerHTML += NumberPattern


    }

    document.querySelectorAll(".strumming-pattern-select")[0].value = "D"
    document.querySelectorAll(".strumming-pattern-select")[NumberOfBoxes].value = "Am"
    $('.strumming-pattern-select').select2({
        tags: false,
        matcher: matchCustom
    });


}

function ChangeTimeSignature() {
    document.getElementById("UpdateTimeSignBtn").style.display = "block"
}

function CancelTimeSign() {
    document.getElementById("UpdateTimeSignBtn").style.display = "none"
}

function ShowUpdateBPMOption() {
    document.getElementById("UpdateBPMBtn").style.display = "inline-block";
}

function CancelBPMChange() {
    document.getElementById("UpdateBPMBtn").style.display = "none";
}


$("#BpmValue").keyup(function (event) {
    if (event.keyCode === 13) {
        $("#UpdateBpmRealTime").click();
    }
});

function AddthisPattern() {

    let patternData = document.querySelectorAll(".strumming-pattern-select")
    let LastValuesArr = []
    let NumberOfBoxes = 8
    let beatNumbers = document.getElementById("TimeSignatureTopValue").value
    if (document.getElementById("TimeSignatureBottomValue").value == 4) {
        switch (DefaultTimeSign) {
            case "Default":
                NumberOfBoxes = TheMainValue
                break;
            case "16ths":
                NumberOfBoxes = TheMainValue * 2
                break;
            case "Shuffle":
                NumberOfBoxes = TheMainValue * 1.5
                break;

            default:
                break;
        }
    } else {
        switch (DefaultTimeSign) {
            case "Default":
                NumberOfBoxes = TheMainValue
                break;
            case "16ths":
                NumberOfBoxes = TheMainValue * 2
                break;
            case "Shuffle":
                NumberOfBoxes = TheMainValue * 3
                break;

            default:
                break;
        }
    }

    for (let i = 0; i < patternData.length - NumberOfBoxes; i++) {
        LastValuesArr[i] = patternData[i + NumberOfBoxes].value
    }


    let DataArr = []
    for (let i = 0; i < NumberOfBoxes; i++) {
        if (patternData[i].value == "E" && LastValuesArr[i] != "Empty") {

            return alert(`Can't add this pattern`)
        } else {

            DataArr[i] = [patternData[i].value, LastValuesArr[i]]
        }
    }
    // if (!localStorage.getItem("StrummingPatternArr")) {

    //     if (DataArr[0][0] == "E" || DataArr[0][1] == "Empty") {
    //         document.getElementById("loading").style.display = "none"

    //         return alert(`Can't add this pattern`)
    //     }
    // }
    let loopTimes = document.getElementById("loopTimes").value;
    if (loopTimes <= 0) {
        loopTimes = 1;
    }
    for (let i = 0; i < loopTimes; i++) {
        let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
        let ModeArr = localStorage.getItem("ModeArr");
        let BeatArr = localStorage.getItem("BeatArr");
        if (StrummingPatternArr) {

            ModeArr = JSON.parse(ModeArr);
            ModeArr = Object.values(ModeArr);
            ModeArr.push(localStorage.getItem("DefaultTimeSign"))

            BeatArr = JSON.parse(BeatArr);
            BeatArr = Object.values(BeatArr);
            for (let i = 0; i < beatNumbers; i++) {

                BeatArr.push(localStorage.getItem("DefaultTimeSign"))
            }


            StrummingPatternArr = JSON.parse(StrummingPatternArr);
            StrummingPatternArr = Object.values(StrummingPatternArr);
            StrummingPatternArr = [...StrummingPatternArr, ...DataArr]
            StrummingPatternArr = JSON.stringify(StrummingPatternArr);
            firstTime = false;

        } else {
            ModeArr = []
            ModeArr.push(localStorage.getItem("DefaultTimeSign"))

            BeatArr = []
            for (let i = 0; i < beatNumbers; i++) {
                BeatArr.push(localStorage.getItem("DefaultTimeSign"))
            }

            StrummingPatternArr = JSON.stringify(DataArr);
            firstTime = false;
        }

        ModeArr = JSON.stringify(ModeArr);
        localStorage.setItem("ModeArr", ModeArr);

        BeatArr = JSON.stringify(BeatArr);
        localStorage.setItem("BeatArr", BeatArr);

        localStorage.setItem("StrummingPatternArr", StrummingPatternArr);

    }

    if (isAdvancedMode) {
        AdvancedStrummingPattern()
    } else {

        DisplayStrummingPattern()
    }
    document.getElementById("loading").style.display = "none"
    document.getElementById("GenerateVideo").style.display = "inline-block"
    // document.getElementById("AdvancedMode").style.display = "inline-block"

    document.getElementById("AdvancedModeExit").style.display = "none"
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"

    CheckRequiresFilesDownload()
}

function DisplayStrummingPattern() {
    document.getElementById("DiagramsContainer").innerHTML = ""

    document.getElementById("loading").style.display = "block"
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");

    if (!StrummingPatternArr) {
        document.getElementById("loading").style.display = "none"

        return console.log(`No data`);
    }

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    SetPatternNumber = 0
    SetChordNumber = 0

    // let DisplayPatternData = document.getElementById("DisplayPatternData")
    BarHTMLContentArr = CreateDisplayPattern(StrummingPatternArr, "default")
    // let content = ""
    // BarStartFrom = 10
    // let BarEndTo = BarStartFrom + 10
    // BarHTMLContentArr.map(function (val, index) {
    //     if(BarStartFrom<=index && index<BarEndTo){
    //         content+=BarHTMLContentArr[index]
    //     }
    // })

    // DisplayPatternData.innerHTML = content
    // DisplayPatternData.innerHTML = CreateDisplayPattern(StrummingPatternArr, "default")
    // console.log(BarHTMLContentArr[0]);
    BarStartFrom = roundToNextTen(BarHTMLContentArr.length) -10;
    ShowPagintion()
    ShowPagintionBtns()
    AutoShowPattern(StrummingPatternArr)
    // StorePredeafultIntensity("always")
    ShowGenerateBtn()
    document.getElementById("loading").style.display = "none"
    DisplayEle("NewSectionBtn", "inline-block")
    DisplayEle("TransposeKeyBtn", "inline-block")
    $('.select-chords-search').select2({
        tags: false,
        matcher: matchCustom
    });
    if (showSections) {
        ShowSectionNameOnBar()
    }

    // For playwithout bars

    // let HTMLContent = CreateDisplayPattern(StrummingPatternArr, "default")
    // console.log(HTMLContent);
    // AutoShowPattern(StrummingPatternArr)
    // ShowGenerateBtn()
    // document.getElementById("loading").style.display = "none"
    // DisplayEle("NewSectionBtn", "inline-block")
    // DisplayEle("TransposeKeyBtn", "inline-block")
    // $('.select-chords-search').select2({
    //     tags: false,
    //     matcher: matchCustom
    // });
    // if (showSections) {
    //     ShowSectionNameOnBar()
    // }

}

function AdvancedStrummingPattern() {
    document.getElementById("DiagramsContainer").innerHTML = ""

    document.getElementById("loading").style.display = "block"
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");

    if (!StrummingPatternArr) {
        document.getElementById("loading").style.display = "none"

        return console.log(`No data`);
    }

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    SetPatternNumber = 0
    SetChordNumber = 0
    
    // let DisplayPatternData = document.getElementById("DisplayPatternData")
    // DisplayPatternData.innerHTML = ``

    // DisplayPatternData.innerHTML = CreateDisplayPattern(StrummingPatternArr, "advanced")

    BarHTMLContentArr = CreateDisplayPattern(StrummingPatternArr, "advanced")

    ShowPagintion()
    ShowPagintionBtns()
    AutoShowPattern(StrummingPatternArr)
    StorePredeafultIntensity()
    InstensitySetOnDOM()
    // InstensitySetOnDOM()
    // InstensitySetOnStorage()
    // InstensitySetOnDOM()
    ShowGenerateBtn()
    document.getElementById("loading").style.display = "none"

    $('.select-chords-search').select2({
        tags: false,
        matcher: matchCustom
    });
    if (showSections) {
        ShowSectionNameOnBar()
    }

}

function CreateDisplayPattern(StrummingPatternArr, def) {
    let appendData = ""
    let EveryBoxNumber = 0, SinglePatternLength = 0
    IncrementPatternsNumber = 0
    BeatIdNumber = 0

    let ModeArr = localStorage.getItem("ModeArr");
    ModeArr = JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    let BeatArr = localStorage.getItem("BeatArr");
    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);

    NumberOfBeatArr = []
    MetronomeClickArr = []
    MetronomeSpeedArr = []

    let BarHTMLContentArr = []
    for (let i = 0; i < ModeArr.length; i++) {
        let NumberOfBeat = document.getElementById("TimeSignatureTopValue").value
        let CutArr = []
        CutArr = BeatArr.slice(i * NumberOfBeat, NumberOfBeat * (i + 1))

        let countPattern = 0
        for (let j = 0; j < CutArr.length; j++) {
            switch (CutArr[j]) {
                case "Default":
                    if (document.getElementById("TimeSignatureBottomValue").value == 4) {

                        countPattern += 2
                    } else {
                        countPattern += 1
                    }
                    break;
                case "Shuffle":
                    countPattern += 3
                    break;
                case "16ths":
                    if (document.getElementById("TimeSignatureBottomValue").value == 4) {

                        countPattern += 4
                    } else {
                        countPattern += 2
                    }
                    break;

                default:
                    break;
            }

        }
        // console.log(CutArr);
        SinglePatternLength = countPattern
        NumberOfBeatArr.push(SinglePatternLength)

        let htmlData = `

        <div class="line"><div class="pattern-number" onclick="PlayBar(${i})">${i + 1}</div>
            <p id="Section${i}" class="SectionOnBarLine"></p>
        </div>

        <div style="display: inline-block; padding-bottom: 5px;" class="Bars">
            

            <label for="BarNumber${i + 1}" class="SelectBars">
                <input type="checkbox" id="BarNumber${i + 1}" class="SelectBarsCheckBox" >
            </label>

            <div class="header">

            <div class="dropdown">
                <ul class="dropbtn icons btn-right showLeft whichNumber${i + 1}"  onclick="showDropdown(this)">
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>

                <div id="nestedMenu${i + 1}" class="dropdown-contentForNestedMenu">
                    <a onclick="ReplicateToLeft(${i})">Copy to Left</a>
                    <a onclick="ReplicateToRight(${i})">Copy to Right</a>
                    <a onclick="DeletePattern(${i})">Delete</a>
                </div>

                <div id="nestedMenuMode${i + 1}" class="dropdown-contentForNestedMenu">
                    <a onclick="Mode(${i}, 'Default')">Change Mode to Default</a>
                    <a onclick="Mode(${i}, 'Shuffle')">Change Mode to Shuffle</a>
                    <a onclick="Mode(${i}, '16ths')">Change Mode to 16ths</a>
                </div>

                <div id="nestedMenuSelect${i + 1}" class="dropdown-contentForNestedMenu">
                    <a onclick="SelectPatterns()">Select Patterns</a>
                    <a onclick="SelectIntensities()" ${(def == "default") ? 'style="display:none"' : 'style="display:block"'}>Select Intensity</a>
                </div>


                <div id="myDropdown${i + 1}" class="dropdown-content">
                    
                    <a onclick="ShowNestedMenu(${i + 1})" class="NestedMenuEvent">
                        Edit this Bar
                    </a>

                    <a onclick="ShowNestedMenuMode(${i + 1})" class="NestedMenuEvent">
                        Change the bar's division
                    </a>

                    <a onclick="ShowNestedMenuSelect(${i + 1})" class="NestedMenuEvent">
                        Select
                    </a>

                </div>
            </div>

            </div>
            <div id="Display-pattern-intensity${i + 1}" class="container mt-3" ${(def == "default") ? 'style="display:none"' : 'style="display:block"'}>${(loop1(StrummingPatternArr, def, EveryBoxNumber, SinglePatternLength))}</div>
            <div id="Display-pattern-number${i + 1}" class="container mt-2">${BarsPatternNumberLoop(i, SinglePatternLength)}</div>
            <div id="Display-pattern-upper${i + 1}" class="container mt-2">${loop2(i, SinglePatternLength)}</div>
            <div id="Display-pattern-lower${i + 1}" class="container mt-3">${loop3(i, SinglePatternLength)}</div>
        </div>`
        appendData += htmlData

        BarHTMLContentArr.push(htmlData)

    }
    return BarHTMLContentArr
}


function loop1(StrummingPatternArr, def, EveryBoxNumber, SinglePatternLength) {
    
    let IntensityHtml = ""
    if (def == "default") {
        for (let j = 0; j < SinglePatternLength; j++) {

            // EveryBoxNumber++
            
            IncrementPatternsNumber++
            // console.log(IncrementPatternsNumber);
            // console.log(StrummingPatternArr[IncrementPatternsNumber-1]);
            if (StrummingPatternArr[IncrementPatternsNumber - 1][0] == "E") {
                IntensityHtml += `<div class="strumming-pattern-Display-Intensity">
            
            </div>`
            } else {

                IntensityHtml += `<div class="strumming-pattern-Display" >
            <select class="strumming-pattern-select-Display Intensity" id="" >
                <option value="default" selected>Default</option>
                
            </select>
            </div>`


            }
        }
    } else {
        for (let j = 0; j < SinglePatternLength; j++) {

            // EveryBoxNumber++
            IncrementPatternsNumber++

            if (StrummingPatternArr[IncrementPatternsNumber - 1][0] == "E") {
                IntensityHtml += `<div class="strumming-pattern-Display-Intensity IntensityDiv">
                    <select class="strumming-pattern-select-Display IntensityStore SelectIntensityCheckBox" intensityattr="${IncrementPatternsNumber}" style="display:none" id="Intensity-${IncrementPatternsNumber}" >
                        <option value="NoIntensity">NoIntensity</option>
                    </select>

                
            </div>`
            } else {

                if (StrummingPatternArr[IncrementPatternsNumber - 1][1] == "NC-muted") {
                    IntensityHtml += `<div class="strumming-pattern-Display IntensityDiv">
                    
            <select class="strumming-pattern-select-Display Intensity IntensityStore" id="Intensity-${IncrementPatternsNumber}" onchange="InstensitySetOnStorage(this)">
                <option value="default" selected>Def</option>
                <option value="soft">Soft</option>
                <option value="hard">Hard</option>
            </select>

            <label for="IntensityBox${j}" class="SelectIntensity" style="display:none;">
            <input type="checkbox" id="IntensityBox${j}" class="SelectIntensityCheckBox" intensityattr="${IncrementPatternsNumber}">
        </label>
            </div>`
                } else {
                    IntensityHtml += `
                    <div class="strumming-pattern-Display IntensityDiv">

            <select class="strumming-pattern-select-Display Intensity IntensityStore" id="Intensity-${IncrementPatternsNumber}" onchange="InstensitySetOnStorage(this)">
                <option value="default" selected>Def</option>
                <option value="soft">Soft</option>
                <option value="hard">Hard</option>
                <option value="Bass">Bass Only</option>
                <option value="BassShort">Short Bass</option>
                <option value="short-default">Short Default</option>
                <option value="short-soft">Short Soft</option>
                <option value="short-hard">Short Hard</option>
                <option value="muted-half">Half Muted</option>
                <option value="muted-full">Full Muted</option>
                <option value="arpeggiated">Arpeggiated</option>
                <option value="NC"> X (NC)</option>
            </select>

            <label for="IntensityBox${j}" class="SelectIntensity" style="display:none;">
            <input type="checkbox" id="IntensityBox${j}" class="SelectIntensityCheckBox" intensityattr="${IncrementPatternsNumber}">
        </label>
            </div>`
                }




            }
        }
    }

    // console.log(IntensityHtml);
    return IntensityHtml
}

function BarsPatternNumberLoop(i, SinglePatternLength) {


    // if (document.getElementById("TimeSignatureBottomValue").value == 4) {
    //     switch (DefaultTimeSign) {
    //         case "Default":
    //             DivideNumber = 2
    //             break;
    //         case "16ths":
    //             DivideNumber = 4
    //             break;
    //         case "Shuffle":
    //             DivideNumber = 3
    //             break;

    //         default:
    //             break;
    //     }
    // } else {
    //     switch (DefaultTimeSign) {
    //         case "Default":
    //             DivideNumber = 1
    //             break;
    //         case "16ths":
    //             DivideNumber = 2
    //             break;
    //         case "Shuffle":
    //             DivideNumber = 3
    //             break;

    //         default:
    //             break;
    //     }
    // }

    let BeatArr = localStorage.getItem("BeatArr");
    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);


    let NumberOfBeat = document.getElementById("TimeSignatureTopValue").value
    let CutArr = []
    let DivideArr = []
    CutArr = BeatArr.slice(i * NumberOfBeat, NumberOfBeat * (i + 1))

    for (let j = 0; j < CutArr.length; j++) {
        switch (CutArr[j]) {
            case "Default":

                if (document.getElementById("TimeSignatureBottomValue").value == 4) {

                    DivideArr.push("Beat")
                    DivideArr.push(0)
                    MetronomeSpeedArr.push("Default")
                    MetronomeSpeedArr.push("Default")
                } else {
                    DivideArr.push("Beat")
                    MetronomeSpeedArr.push("Default")
                }

                break;
            case "Shuffle":
                DivideArr.push("Beat")
                DivideArr.push(0)
                DivideArr.push(0)
                MetronomeSpeedArr.push("Shuffle")
                MetronomeSpeedArr.push("Shuffle")
                MetronomeSpeedArr.push("Shuffle")
                break;
            case "16ths":
                if (document.getElementById("TimeSignatureBottomValue").value == 4) {

                    DivideArr.push("Beat")
                    DivideArr.push(0)
                    DivideArr.push(0)
                    DivideArr.push(0)
                    MetronomeSpeedArr.push("16ths")
                    MetronomeSpeedArr.push("16ths")
                    MetronomeSpeedArr.push("16ths")
                    MetronomeSpeedArr.push("16ths")
                } else {
                    DivideArr.push("Beat")
                    DivideArr.push(0)
                    MetronomeSpeedArr.push("16ths")
                    MetronomeSpeedArr.push("16ths")
                }

                break;

            default:
                break;
        }

    }
    MetronomeClickArr.push(...DivideArr)
    let count = 1

    let PatternNumber = ""
    for (let j = 0; j < SinglePatternLength; j++) {

        if (DivideArr[j] == "Beat") {
            BeatIdNumber++

            PatternNumber += `
        <div class="dropdownForBeat">
                <div class="strumming-pattern-numbers " onclick="showDropdownForBeat(${BeatIdNumber})">
                    <div class="pattern-number-Main">${count}</div>
                </div>
                <div id="${BeatIdNumber}" class="dropdown-contentForBeat">
                    <a onclick="BeatChange(${BeatIdNumber}, 'Default')">Change Beat to Default</a>
                    <a onclick="BeatChange(${BeatIdNumber}, 'Shuffle')">Change Beat to Shuffle</a>
                    <a onclick="BeatChange(${BeatIdNumber}, '16ths')">Change Beat to 16ths</a>
                </div>
        </div>`
            count++
        } else {
            PatternNumber += `
        <div class="strumming-pattern-numbers">
        </div>
        `
        }

    }

    return PatternNumber
}

function loop2(i, SinglePatternLength) {
    let UpperHtml = ""
    for (let j = 0; j < SinglePatternLength; j++) {

        UpperHtml += `<div class="strumming-pattern-Display">
    <select class="strumming-pattern-select-Display Upper-Pattern UpdatePattern" id="pattern${SetPatternNumber++}" onchange="UpdateStrummingPattern(this, ${SetPatternNumber})" >
        <option value="U">U &uarr;</option>
        <option value="D">D &#8595;</option>
        <option value="E"></option>
    </select>
    </div>`

    }

    return UpperHtml
}
function loop3(i, SinglePatternLength) {
    let LowerHtml = ""

    for (let j = 0; j < SinglePatternLength; j++) {


        LowerHtml += `<div class="strumming-pattern-Display">
        <select  name="" class="strumming-pattern-select-Display select-chords-search UpdateChord" autoComplete="on" list="suggestions1" id="chord${SetChordNumber++}"  onchange="UpdateStrummingPattern(this, ${SetChordNumber})">
        <option value="Empty" selected>--</option>

        <option value="A" >A</option>
        <option value="Am" >Am</option>
        <option value="A7" >A7</option>
        <option value="Am7" >Am7</option>

        <option value="B" >B</option>
        <option value="Bm" >Bm</option>
        <option value="B7" >B7</option>
        <option value="Bm7" >Bm7</option>

        <option value="Bb">Bb (A#)</option>
        <option value="Bbm" >Bbm (A#m)</option>
        <option value="Bb7" >Bb7 (A#7)</option>
        <option value="Bbm7" >Bbm7 (A#m7)</option>
       
        <option value="C" >C</option>
        <option value="Cm" >Cm</option>
        <option value="C7" >C7</option>
        <option value="Cm7" >Cm7</option>

        <option value="D" >D</option>
        <option value="Dm" >Dm</option>
        <option value="D7" >D7</option>
        <option value="Dm7" >Dm7</option>

        <option value="Db" >C# (Db)</option>
        <option value="Dbm" >C#m (Dbm)</option>
        <option value="Db7" >C#7 (Db7)</option>
        <option value="Dbm7" >C#m7 (Dbm7)</option>

        <option value="E" >E</option>
        <option value="Em" >Em</option>
        <option value="E7" >E7</option>
        <option value="Em7" >Em7</option>

        <option value="Eb" >Eb (D#)</option>
        <option value="Ebm" >D#m (Ebm)</option>
        <option value="Eb7" >D#7 (Eb7)</option>
        <option value="Ebm7" >D#m7 (Ebm7)</option>
    

        <option value="F" >F</option>
        <option value="Fm" >Fm</option>
        <option value="F7" >F7</option>
        <option value="Fm7" >Fm7</option>

        <option value="G" >G</option>
        <option value="Gm" >Gm</option>
        <option value="G7" >G7</option>
        <option value="Gm7" >Gm7</option>

        <option value="Gb" >F# (Gb)</option>
        <option value="Gbm" >F#m (Gbm)</option>
        <option value="Gb7" >F#7 (Gb7)</option>
        <option value="Gbm7" >F#m7 (Gbm7)</option>

        <option value="Ab" >Ab (G#)</option>
        <option value="Abm" >Abm (G#m)</option>
        <option value="Ab7" >Ab7 (G#7)</option>
        <option value="Abm7" >Abm7 (G#m7)</option>

    </select>
    </div>`

    }

    return LowerHtml
}

function Mode(BarIndex, ChangeTo) {
    let ModeArr = localStorage.getItem("ModeArr");

    ModeArr = JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    if (ModeArr[BarIndex] == ChangeTo) {
        return alert("Can't use same mode")
    }

    let Beat = document.getElementById("TimeSignatureTopValue").value
    Beat = parseInt(Beat)

    for (let i = 1; i < Beat + 1; i++) {
        let BeatNumber = Beat * BarIndex + i
        ChangeBeatModeForModeChange(BeatNumber, ChangeTo)

    }

    ModeArr.splice((BarIndex), 1, ChangeTo);

    ModeArr = JSON.stringify(ModeArr);
    localStorage.setItem("ModeArr", ModeArr);
    document.getElementById("GenerateVideo").style.display = "inline-block"
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"
    document.getElementById("StartVideo").style.display = "none"

    document.getElementById("ChordVideoSection").innerHTML = ""
    document.getElementById("ChordHandVideoSection").innerHTML = ""
    document.getElementById("AudioSecion").innerHTML = ""
    ShowOnDisplay()
}

function DefaultToShuffle(arr) {
    let N16Arr = []
    for (let i = 0; i < arr.length; i++) {

        if (i % 2) {
            N16Arr.push([arr[i][0], arr[i][1]])
        } else {
            N16Arr.push([arr[i][0], arr[i][1]])
            N16Arr.push(["E", "Empty"])
        }
    }

    return N16Arr
}

function DefaultTo16th(arr) {
    let N16Arr = []
    for (let i = 0; i < arr.length; i++) {

        if (i % 2) {
            N16Arr.push([arr[i][0], arr[i][1]])
            N16Arr.push(["E", "Empty"])
        } else {
            N16Arr.push([arr[i][0], arr[i][1]])
            N16Arr.push(["E", "Empty"])
        }
    }

    return N16Arr
}

function ShuffleToDefault(arr) {
    let N16Arr = []
    let first = true
    let count = 2
    for (let i = 0; i < arr.length; i++) {

        if (first) {
            N16Arr.push([arr[i][0], arr[i][1]])
            first = false
        } else {
            if (count == 2) {
                count = 0
            } else {
                N16Arr.push([arr[i][0], arr[i][1]])
                count++
            }
        }

    }

    return N16Arr
}

function Fn16thToDefault(arr) {
    let N16Arr = []
    let first = true
    for (let i = 0; i < arr.length; i++) {


        if (first) {
            N16Arr.push([arr[i][0], arr[i][1]])
            first = false
        } else {
            first = true
        }

    }

    return N16Arr
}

function ShuffleTo16ths(arr) {
    let N16Arr = []
    let first = true
    let count = 0
    for (let i = 0; i < arr.length; i++) {

        if (first) {
            N16Arr.push([arr[i][0], arr[i][1]])
            N16Arr.push(["E", "Empty"])
            first = false
        } else {
            if (count == 2) {
                N16Arr.push([arr[i][0], arr[i][1]])
                N16Arr.push(["E", "Empty"])
                count = 0
            } else {
                N16Arr.push([arr[i][0], arr[i][1]])
                count++
            }
        }

    }

    return N16Arr
}

function Fn16thToShuffle(arr) {
    let N16Arr = []
    let first = true
    let count = 3
    for (let i = 0; i < arr.length; i++) {

        if (first) {
            N16Arr.push([arr[i][0], arr[i][1]])
            first = false
        } else {
            if (count == 3) {
                count = 0
            } else {
                N16Arr.push([arr[i][0], arr[i][1]])
                count++
            }
        }

    }

    return N16Arr
}

// By 8

function DefaultToShuffleby8(arr) {
    let N16Arr = []
    for (let i = 0; i < arr.length; i++) {

        N16Arr.push([arr[i][0], arr[i][1]])
        N16Arr.push(["E", "Empty"])
        N16Arr.push(["E", "Empty"])
    }

    return N16Arr
}

function DefaultTo16thby8(arr) {
    let N16Arr = []
    for (let i = 0; i < arr.length; i++) {
        N16Arr.push([arr[i][0], arr[i][1]])
        N16Arr.push(["E", "Empty"])
    }

    return N16Arr
}

function ShuffleToDefaultby8(arr) {
    let N16Arr = []
    let first = true
    let count = 0
    for (let i = 0; i < arr.length; i++) {

        if (first) {
            N16Arr.push([arr[i][0], arr[i][1]])
            first = false
        } else {
            if (count == 2) {
                N16Arr.push([arr[i][0], arr[i][1]])
                count = 0
            } else {
                count++
            }
        }

    }

    return N16Arr
}

function ShuffleTo16thsby8(arr) {
    let N16Arr = []
    let first = true
    let count = 2
    for (let i = 0; i < arr.length; i++) {

        if (first) {
            N16Arr.push([arr[i][0], arr[i][1]])
            first = false
        } else {
            if (count == 2) {
                count = 0
            } else {
                N16Arr.push([arr[i][0], arr[i][1]])
                count++
            }
        }

    }

    return N16Arr
}

function Fn16thToDefaultby8(arr) {
    let N16Arr = []
    let first = true
    for (let i = 0; i < arr.length; i++) {


        if (first) {
            N16Arr.push([arr[i][0], arr[i][1]])
            first = false
        } else {
            first = true
        }

    }

    return N16Arr
}

function Fn16thToShuffleby8(arr) {
    let N16Arr = []
    for (let i = 0; i < arr.length; i++) {
        if (i % 2) {
            N16Arr.push([arr[i][0], arr[i][1]])
        } else {
            N16Arr.push([arr[i][0], arr[i][1]])
            N16Arr.push(["E", "Empty"])
        }


    }
    return N16Arr
}

function StorePredeafultIntensity(always){

    let StoreIntensityArr = localStorage.getItem("StoreIntensityArr");
    if(always!="always"){
        
        if (StoreIntensityArr != "") {
            return
        }
    }
    
        
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
        
    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);
    StoreIntensityArr = []

    for (let i = 0; i < StrummingPatternArr.length; i++) {
        if(StrummingPatternArr[i][0]=="E"){
            StoreIntensityArr.push("NoIntensity")
        }else{
            StoreIntensityArr.push("default")
        }
    }

    StoreIntensityArr = JSON.stringify(StoreIntensityArr);
    localStorage.setItem("StoreIntensityArr", StoreIntensityArr);
}

function InstensitySetOnStorage(e) {

    let CurrentIntensityValue = e.value

    let BoxIndex = e.id;
    BoxIndex = BoxIndex.split("-")[1];

    let StoreIntensityArr = localStorage.getItem("StoreIntensityArr");

    StoreIntensityArr = JSON.parse(StoreIntensityArr);
    StoreIntensityArr = Object.values(StoreIntensityArr);

    StoreIntensityArr[BoxIndex-1] = CurrentIntensityValue
    
    StoreIntensityArr = JSON.stringify(StoreIntensityArr);
    localStorage.setItem("StoreIntensityArr", StoreIntensityArr);

    // let IntensityArr = document.querySelectorAll(".IntensityStore");
    // // console.log(IntensityArr);
    // for (let i = 0; i < IntensityArr.length; i++) {
    //     StoreIntensityArr.push(IntensityArr[i].value)
    // }
    // // console.log(StoreIntensityArr);
    // StoreIntensityArr = JSON.stringify(StoreIntensityArr);
    // localStorage.setItem("StoreIntensityArr", StoreIntensityArr);

    // // InstensitySetOnDOM()

    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"
    document.getElementById("StartVideo").style.display = "none"

    document.getElementById("GenerateVideo").style.display = "inline-block"

    CheckRequiresFilesDownload()
}

function InstensitySetOnDOM() {
    let StoreIntensityArr = localStorage.getItem("StoreIntensityArr");

    if (!StoreIntensityArr) {
        return
    }

    StoreIntensityArr = JSON.parse(StoreIntensityArr);
    StoreIntensityArr = Object.values(StoreIntensityArr);

    for (let i = 0; i < StoreIntensityArr.length; i++) {
        try {
            document.getElementById(`Intensity-${i+1}`).value = StoreIntensityArr[i]
            
        } catch (error) {
            
        }
        // IntensityArr[i].value = StoreIntensityArr[i]
        // if (!StoreIntensityArr[i]) {
        //     IntensityArr[i].value = "default"

        // }
    }

}

function AutoShowPattern() {

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    for (let i = 0; i < StrummingPatternArr.length; i++) {

        let patternData = document.getElementById(`pattern${i}`)
        let chordData = document.getElementById(`chord${i}`)
        // console.log(StrummingPatternArr[i][0]);
        try {
            
            patternData.value = StrummingPatternArr[i][0]
            chordData.value = StrummingPatternArr[i][1]
        } catch (error) {
            
        }

    }
}

function UpdateStrummingPattern(ele, index) {
    document.getElementById("loading").style.display = "block"
    console.log(`Update`);
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");


    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    // let validate = ValidateStrummingPattern(StrummingPatternArr);
    // if (validate == "Not Possilbe") {
    //     document.getElementById("loading").style.display = "none"

    //     return alert(`Can't update due to some wrong Pattern`);
    // }


    let idValue = ele.id;
    idValue = idValue.substring(0, 5);
    if (idValue == "patte") {
        idValue = "pattern"
    }
    // let count = 0;
    // let increaseIValue = 0;
    // let index;

    // console.log(idValue);
    // Index value depends on TheMainValue , need to change
    // for (let i = 0; i < StrummingPatternArr.length; i++) {

    //     if (count < TheMainValue) {
    //         if (`${idValue}${increaseIValue}${count}` == ele.id) {
    //             index = i;
    //         }
    //         count++;
    //     } else {
    //         increaseIValue++
    //         count = 0
    //         if (`${idValue}${increaseIValue}${count}` == ele.id) {
    //             index = i;
    //         }
    //         count++;
    //     }
    // }
    // index = document.querySelectorAll(".UpdatePattern")

    index = index - 1

    if (idValue == "pattern") {
        StrummingPatternArr[index] = [ele.value, StrummingPatternArr[index][1]]
    } else {
        StrummingPatternArr[index] = [StrummingPatternArr[index][0], ele.value]
    }



    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);

    document.getElementById("loading").style.display = "none"
    document.getElementById("GenerateVideo").style.display = "inline-block"
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"
    document.getElementById("StartVideo").style.display = "none"

    document.getElementById("ChordVideoSection").innerHTML = ""
    document.getElementById("ChordHandVideoSection").innerHTML = ""
    document.getElementById("AudioSecion").innerHTML = ""
    document.getElementById("DiagramsContainer").innerHTML = ""

    if (isAdvancedMode) {
        //     console.log(StrummingPatternArr[index][0]);
        //     if (StrummingPatternArr[index][0] == "E") {
        //         document.querySelectorAll(".IntensityDiv")[index].innerHTML = `<div class="strumming-pattern-Display ">
        // <select class="strumming-pattern-select-Display Intensity IntensityStore" id="" onchange="InstensitySetOnStorage()">
        //     <option value="default" selected>Def</option>
        //     <option value="soft">Soft</option>
        //     <option value="hard">Hard</option>
        //     <option value="Bass">Bass Only</option>
        //     <option value="short-default">Short Default</option>
        //     <option value="short-soft">Short Soft</option>
        //     <option value="short-hard">Short Hard</option>
        //     <option value="muted-half">Half Muted</option>
        //     <option value="muted-full">Full Muted</option>
        //     <option value="arpeggiated">Arpeggiated</option>
        // </select>
        // </div>`
        //         console.log(StrummingPatternArr[index][0]);
        //         document.querySelectorAll(".IntensityDiv")[index].style.display = "inline-block"

        //     }

        ShowOnDisplay()

    }

    CheckRequiresFilesDownload()

}

function ValidateStrummingPattern(arr) {

    if (arr[0][1] == "Empty") {
        return "Not Possilbe"
    }

    for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] == "E" && arr[i][1] != "Empty") {
            return "Not Possilbe"
        }
    }
}

function ResetIt() {
    CreatePatternBoxes()
}

function ResetAll() {
    let Confimation = confirm("You're about to delete/erase all patterns. Are you Really want to proceed?")
    if (!Confimation) {
        return
    }

    localStorage.removeItem("StrummingPatternArr")
    localStorage.removeItem("StoreIntensityArr")
    localStorage.removeItem("ModeArr")
    localStorage.removeItem("BeatArr")
    localStorage.removeItem("SongSectionNames")
    localStorage.removeItem("TransposeKey")
    document.getElementById("DisplayPatternData").innerHTML = ""
    document.getElementById("DiagramsContainer").innerHTML = ""
    DisplayNone("SectionContainer")
    DisplayNone("NewSectionBtn")
    DisplayNone("TransposeKeyBtn")
    DisplayStrummingPattern()
    firstTime = true;
    document.getElementById("loopTimes").value = 1;
    document.getElementById("BpmValue").value = 70
    localStorage.setItem("BPM",70);
    ShowGenerateBtn()
}

function ShowGenerateBtn() {
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    if (StrummingPatternArr) {

        document.getElementById("GenerateVideoContainer").style.display = "block"
        document.querySelector(".VideoPlayer").style.display = "block"
    } else {
        document.getElementById("GenerateVideoContainer").style.display = "none"
        document.querySelector(".VideoPlayer").style.display = "none"
    }
}

function DeletePattern(index) {
    let Beat = document.getElementById("TimeSignatureTopValue").value
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let BeatArr = localStorage.getItem("BeatArr");
    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);

    let ModeArr = localStorage.getItem("ModeArr");

    ModeArr = JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    let DelIndex = 0
    for (let i = 0; i < NumberOfBeatArr.length; i++) {
        if (i < index) {
            DelIndex += NumberOfBeatArr[i]
        }

    }

    let DelCount = NumberOfBeatArr[index]

    StrummingPatternArr.splice(DelIndex, DelCount);
    BeatArr.splice((Beat * index), Beat);
    ModeArr.splice((index), 1);


    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    ModeArr = JSON.stringify(ModeArr);
    BeatArr = JSON.stringify(BeatArr);

    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);
    localStorage.setItem("ModeArr", ModeArr);
    localStorage.setItem("BeatArr", BeatArr);



    if (isAdvancedMode) {

        let IntensityArr = document.querySelectorAll(".IntensityStore");
        let StoreIntensityArr = []
        for (let i = 0; i < IntensityArr.length; i++) {
            StoreIntensityArr.push(IntensityArr[i].value)
        }
        console.log(StoreIntensityArr);

        StoreIntensityArr.splice(DelIndex, DelCount);
        StoreIntensityArr = JSON.stringify(StoreIntensityArr);

        localStorage.setItem("StoreIntensityArr", StoreIntensityArr);
        AdvancedStrummingPattern()
    } else {

        DisplayStrummingPattern()
    }

}

function ShowOnDisplay() {

    document.getElementById("DiagramsContainer").innerHTML = ""
    if (isAdvancedMode) {

        AdvancedStrummingPattern()
    } else {

        DisplayStrummingPattern()
    }
}

function DeleteMultiplePattern() {
    let Beat = document.getElementById("TimeSignatureTopValue").value

    let SelectBarsCheckBox = document.querySelectorAll(".SelectBarsCheckBox");
    let SelectedValueArr = []
    for (let i = 0; i < SelectBarsCheckBox.length; i++) {
        if (SelectBarsCheckBox[i].checked) {
            let id = SelectBarsCheckBox[i].id.slice(9);
            id = id-1
            SelectedValueArr.push(id)
        }
    }

    // console.log(SelectedValueArr);

    if (!SelectedValueArr.length) {
        return alert(`Please Select any bar`);
    }

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let ModeArr = localStorage.getItem("ModeArr");

    ModeArr = JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    let BeatArr = localStorage.getItem("BeatArr");
    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);


    let count1 = 0
    for (let i = 0; i < SelectedValueArr.length; i++) {

        let DelIndex = 0
        for (let j = 0; j < NumberOfBeatArr.length; j++) {
            if (j < SelectedValueArr[i] - count1) {
                DelIndex += NumberOfBeatArr[j]
            }

        }

        let DelCount = NumberOfBeatArr[SelectedValueArr[i]]

        StrummingPatternArr.splice(DelIndex, DelCount);
        ModeArr.splice(((SelectedValueArr[i] - count1)), 1);
        BeatArr.splice((Beat * (SelectedValueArr[i] - count1)), Beat);

        count1++;
    }


    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    ModeArr = JSON.stringify(ModeArr);
    BeatArr = JSON.stringify(BeatArr);

    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);
    localStorage.setItem("ModeArr", ModeArr);
    localStorage.setItem("BeatArr", BeatArr);


    if (isAdvancedMode) {

        let StoreIntensityArr = localStorage.getItem("StoreIntensityArr");

        StoreIntensityArr = JSON.parse(StoreIntensityArr);
        StoreIntensityArr = Object.values(StoreIntensityArr);

        let count2 = 0
        for (let i = 0; i < SelectedValueArr.length; i++) {
            let DelIndex = 0
            for (let j = 0; j < NumberOfBeatArr.length; j++) {
                if (j < SelectedValueArr[i] - count2) {
                    DelIndex += NumberOfBeatArr[j]
                }

            }

            let DelCount = NumberOfBeatArr[SelectedValueArr[i]]
            StoreIntensityArr.splice(DelIndex, DelCount);
            count2++;
        }

        StoreIntensityArr = JSON.stringify(StoreIntensityArr);
        localStorage.setItem("StoreIntensityArr", StoreIntensityArr);

        AdvancedStrummingPattern()
    } else {

        DisplayStrummingPattern()
    }

    try {
        let checkbox = document.querySelectorAll('input[type=checkbox][class=SelectBarsCheckBox]:checked');
        for (let i = 0; i < checkbox.length; i++) {
            checkbox[i].checked = false;
        }
    } catch (error) { }
    BarsVisible = true;
    SelectPatterns()
    document.getElementsByClassName("CopyPasteBtn")[0].style.display = "none"
    document.getElementsByClassName("CopyPasteBtn")[1].style.display = "none"

}

function ReplicateToLeft(index) {
    let Beat = document.getElementById("TimeSignatureTopValue").value

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let ModeArr = localStorage.getItem("ModeArr");
    ModeArr = JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    let BeatArr = localStorage.getItem("BeatArr");
    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);

    let DelIndex = 0
    for (let i = 0; i < NumberOfBeatArr.length; i++) {
        if (i < index) {
            DelIndex += NumberOfBeatArr[i]
        }

    }

    let DelCount = NumberOfBeatArr[index]

    let slicedArray = StrummingPatternArr.slice(DelIndex, DelIndex + DelCount);
    StrummingPatternArr.splice(DelIndex, 0, ...slicedArray);

    ModeArr.splice((index), 0, ModeArr[index]);

    let slicedBeatArr = BeatArr.slice(Beat * index, (Beat * index) + parseInt(Beat));
    BeatArr.splice((Beat * index), 0, ...slicedBeatArr);

    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    ModeArr = JSON.stringify(ModeArr);
    BeatArr = JSON.stringify(BeatArr);

    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);
    localStorage.setItem("ModeArr", ModeArr);
    localStorage.setItem("BeatArr", BeatArr);


    if (isAdvancedMode) {

        let IntensityArr = document.querySelectorAll(".IntensityStore");
        let StoreIntensityArr = []

        for (let i = 0; i < IntensityArr.length; i++) {
            StoreIntensityArr.push(IntensityArr[i].value)
        }

        let AdvancedslicedArray = StoreIntensityArr.slice(DelIndex, DelIndex + DelCount);
        StoreIntensityArr.splice(DelIndex, 0, ...AdvancedslicedArray)

        StoreIntensityArr = JSON.stringify(StoreIntensityArr);
        localStorage.setItem("StoreIntensityArr", StoreIntensityArr);
        AdvancedStrummingPattern()
    } else {

        DisplayStrummingPattern()
    }

}

function ReplicateToRight(index) {
    let Beat = document.getElementById("TimeSignatureTopValue").value

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let ModeArr = localStorage.getItem("ModeArr");
    ModeArr = JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    let BeatArr = localStorage.getItem("BeatArr");
    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);

    let DelIndex = 0
    for (let i = 0; i < NumberOfBeatArr.length; i++) {
        if (i < index) {
            DelIndex += NumberOfBeatArr[i]
        }

    }

    let DelCount = NumberOfBeatArr[index]

    let slicedArray = StrummingPatternArr.slice(DelIndex, DelIndex + DelCount);
    StrummingPatternArr.splice(DelIndex, 0, ...slicedArray);

    ModeArr.splice((index), 0, ModeArr[index]);

    let slicedBeatArr = BeatArr.slice(Beat * index, (Beat * index) + parseInt(Beat));
    BeatArr.splice((Beat * index), 0, ...slicedBeatArr);

    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    ModeArr = JSON.stringify(ModeArr);
    BeatArr = JSON.stringify(BeatArr);

    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);
    localStorage.setItem("ModeArr", ModeArr);
    localStorage.setItem("BeatArr", BeatArr);


    if (isAdvancedMode) {

        let IntensityArr = document.querySelectorAll(".IntensityStore");
        let StoreIntensityArr = []

        for (let i = 0; i < IntensityArr.length; i++) {
            StoreIntensityArr.push(IntensityArr[i].value)
        }

        let AdvancedslicedArray = StoreIntensityArr.slice(DelIndex, DelIndex + DelCount);
        StoreIntensityArr.splice(DelIndex, 0, ...AdvancedslicedArray)

        StoreIntensityArr = JSON.stringify(StoreIntensityArr);
        localStorage.setItem("StoreIntensityArr", StoreIntensityArr);
        AdvancedStrummingPattern()
    } else {

        DisplayStrummingPattern()
    }
}

function SelectPatterns() {
    let Bars = document.querySelectorAll(".SelectBars");
    if (!BarsVisible) {
        for (let i = 0; i < Bars.length; i++) {
            Bars[i].style.display = "inline-block"
        }

        document.getElementsByClassName("CopyPasteBtn")[0].style.display = "block"
        document.getElementsByClassName("CopyPasteBtn")[1].style.display = "none"

        BarsVisible = true;
    } else {
        for (let i = 0; i < Bars.length; i++) {
            Bars[i].style.display = "none"
        }

        document.getElementsByClassName("CopyPasteBtn")[0].style.display = "none"
        document.getElementsByClassName("CopyPasteBtn")[1].style.display = "none"
        BarsVisible = false;
    }

    try {
        let checkbox = document.querySelectorAll('input[type=checkbox][class=SelectBarsCheckBox]:checked');
        for (let i = 0; i < checkbox.length; i++) {
            checkbox[i].checked = false;
        }
    } catch (error) { }

}

function SelectIntensities() {
    let Bars = document.querySelectorAll(".SelectIntensity");
    if (!IntensitySelectVisible) {
        for (let i = 0; i < Bars.length; i++) {
            Bars[i].style.display = "inline-block"
        }

        document.getElementsByClassName("ChanheIntensitySelectDiv")[0].style.display = "block"

        IntensitySelectVisible = true;
    } else {
        for (let i = 0; i < Bars.length; i++) {
            Bars[i].style.display = "none"
        }

        document.getElementsByClassName("ChanheIntensitySelectDiv")[0].style.display = "none"
        IntensitySelectVisible = false;
    }

    DisplayNone("NewSectionBtn")
    DisplayNone("TransposeKeyBtn")

    try {
        let checkbox = document.querySelectorAll('input[type=checkbox][class=SelectIntensityCheckBox]:checked');
        for (let i = 0; i < checkbox.length; i++) {
            checkbox[i].checked = false;
        }
    } catch (error) { }

}

function ChangeMultipleIntensityValue() {
    let SelectBarsCheckBox = document.querySelectorAll(".SelectIntensityCheckBox");

    let SelectedValueArr = []
    for (let i = 0; i < SelectBarsCheckBox.length; i++) {
        if (SelectBarsCheckBox[i].checked) {
            let id = SelectBarsCheckBox[i].getAttribute("intensityattr")
            SelectedValueArr.push(id)
        }

    }

    if (!SelectedValueArr.length) {
        return alert(`Please Select Intensities to change.`);
    }


    let selectedValue = document.getElementsByClassName("ChanheIntensitySelect")[0].value

    SelectedValueArr.map(function (val, index) {
        document.getElementById(`Intensity-${val}`).value = selectedValue

        let ele = document.getElementById(`Intensity-${val}`)
        InstensitySetOnStorage(ele)
    })

    InstensitySetOnDOM()

    CancelIntensitySelect()
}

function CopyMultiplePattern() {
    let Beat = document.getElementById("TimeSignatureTopValue").value

    let SelectBarsCheckBox = document.querySelectorAll(".SelectBarsCheckBox");
    let SelectedValueArr = []
    for (let i = 0; i < SelectBarsCheckBox.length; i++) {
        if (SelectBarsCheckBox[i].checked) {
            // SelectedValueArr.push(i)

            let id = SelectBarsCheckBox[i].id.slice(9);
            id = id-1
            SelectedValueArr.push(id)
        }

    }

    if (!SelectedValueArr.length) {
        return alert(`Please Select any bar`);
    }

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let ModeArr = localStorage.getItem("ModeArr");
    ModeArr = JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    let BeatArr = localStorage.getItem("BeatArr");
    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);


    document.getElementById("PasteAfterBars").value = ModeArr.length
    let NewDataArr = []
    let CopiedModeArr = []
    let CopiedBeatArr = []

    for (let i = 0; i < SelectedValueArr.length; i++) {

        let DelIndex = 0
        for (let j = 0; j < NumberOfBeatArr.length; j++) {
            if (j < SelectedValueArr[i]) {
                DelIndex += NumberOfBeatArr[j]
            }

        }
        let DelCount = NumberOfBeatArr[SelectedValueArr[i]]

        let slicedArray = StrummingPatternArr.slice(DelIndex, DelIndex + DelCount);
        NewDataArr.push(...slicedArray)

        CopiedModeArr.push(ModeArr[SelectedValueArr[i]])

        let slicedBeatArr = BeatArr.slice(Beat * SelectedValueArr[i], (Beat * SelectedValueArr[i]) + parseInt(Beat));
        CopiedBeatArr.push(...slicedBeatArr)
    }


    NewDataArr = JSON.stringify(NewDataArr);
    CopiedModeArr = JSON.stringify(CopiedModeArr);
    CopiedBeatArr = JSON.stringify(CopiedBeatArr);

    sessionStorage.setItem("CopiedData", NewDataArr)
    sessionStorage.setItem("CopiedModeArr", CopiedModeArr)
    sessionStorage.setItem("CopiedBeatArr", CopiedBeatArr)

    if (isAdvancedMode) {
        let IntensityArr = document.querySelectorAll(".IntensityStore");
        let StoreIntensityArr = []

        for (let i = 0; i < IntensityArr.length; i++) {
            StoreIntensityArr.push(IntensityArr[i].value)
        }
        let NewDataArrIntensity = []

        for (let i = 0; i < SelectedValueArr.length; i++) {
            let DelIndex = 0
            for (let j = 0; j < NumberOfBeatArr.length; j++) {
                if (j < SelectedValueArr[i]) {
                    DelIndex += NumberOfBeatArr[j]
                }

            }
            let DelCount = NumberOfBeatArr[SelectedValueArr[i]]

            let slicedArray = StoreIntensityArr.slice(DelIndex, DelIndex + DelCount);

            NewDataArrIntensity.push(...slicedArray)

        }

        NewDataArrIntensity = JSON.stringify(NewDataArrIntensity);

        sessionStorage.setItem("CopiedDataIntensity", NewDataArrIntensity)
    }


    try {
        let checkbox = document.querySelectorAll('input[type=checkbox][class=SelectBarsCheckBox]:checked');
        for (let i = 0; i < checkbox.length; i++) {
            checkbox[i].checked = false;
        }
    } catch (error) { }
    BarsVisible = true;
    SelectPatterns()
    document.getElementsByClassName("CopyPasteBtn")[0].style.display = "none"
    document.getElementsByClassName("CopyPasteBtn")[1].style.display = "block"
}

function PasteMultiplePattern() {
    let Beat = document.getElementById("TimeSignatureTopValue").value

    let CopiedData = sessionStorage.getItem("CopiedData")
    let CopiedModeArr = sessionStorage.getItem("CopiedModeArr")
    let CopiedBeatArr = sessionStorage.getItem("CopiedBeatArr")

    if (!CopiedData) {
        return console.log(`No Copied Data`);
    }

    CopiedData = JSON.parse(CopiedData);
    CopiedData = Object.values(CopiedData);

    CopiedModeArr = JSON.parse(CopiedModeArr);
    CopiedModeArr = Object.values(CopiedModeArr)

    CopiedBeatArr = JSON.parse(CopiedBeatArr);
    CopiedBeatArr = Object.values(CopiedBeatArr);

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let ModeArr = localStorage.getItem("ModeArr");

    ModeArr = JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    let BeatArr = localStorage.getItem("BeatArr");
    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);

    let PasteAfterBars = document.getElementById("PasteAfterBars").value
    let PasteBarLoop = document.getElementById("PasteBarLoop").value

    if (!PasteAfterBars || PasteAfterBars <= 0) {
        PasteAfterBars = 1;
    }
    if (!PasteBarLoop || PasteBarLoop <= 0) {
        PasteBarLoop = 1;
    }
    let NewCopiedData = []
    let NewModeCopiedData = []
    let NewBeatCopiedData = []
    for (let i = 0; i < PasteBarLoop; i++) {
        NewCopiedData = NewCopiedData.concat(CopiedData);
        NewModeCopiedData = NewModeCopiedData.concat(CopiedModeArr);
        NewBeatCopiedData = NewBeatCopiedData.concat(CopiedBeatArr);

    }

    let DelIndex = 0
    for (let i = 0; i < NumberOfBeatArr.length; i++) {
        if (i < PasteAfterBars) {
            DelIndex += NumberOfBeatArr[i]
        }

    }

    StrummingPatternArr.splice(DelIndex, 0, ...NewCopiedData);
    ModeArr.splice(PasteAfterBars, 0, ...NewModeCopiedData)
    BeatArr.splice(PasteAfterBars * parseInt(Beat), 0, ...NewBeatCopiedData)

    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);

    ModeArr = JSON.stringify(ModeArr);
    localStorage.setItem("ModeArr", ModeArr);

    BeatArr = JSON.stringify(BeatArr);
    localStorage.setItem("BeatArr", BeatArr);



    if (isAdvancedMode) {
        let CopiedDataIntensity = sessionStorage.getItem("CopiedDataIntensity")
        CopiedDataIntensity = JSON.parse(CopiedDataIntensity);
        CopiedDataIntensity = Object.values(CopiedDataIntensity);

        let NewCopiedDataIntensity = []
        for (let i = 0; i < PasteBarLoop; i++) {
            NewCopiedDataIntensity = NewCopiedDataIntensity.concat(CopiedDataIntensity);

        }

        let StoreIntensityArr = localStorage.getItem("StoreIntensityArr");

        StoreIntensityArr = JSON.parse(StoreIntensityArr);
        StoreIntensityArr = Object.values(StoreIntensityArr);

        StoreIntensityArr.splice(DelIndex, 0, ...NewCopiedDataIntensity);

        StoreIntensityArr = JSON.stringify(StoreIntensityArr);
        localStorage.setItem("StoreIntensityArr", StoreIntensityArr);
        AdvancedStrummingPattern()
    } else {

        DisplayStrummingPattern()
    }


    document.getElementsByClassName("CopyPasteBtn")[0].style.display = "none"
    document.getElementsByClassName("CopyPasteBtn")[1].style.display = "none"

}

const increasingSequence = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i + 1] - arr[i] === 1 || arr[i + 1] - arr[i] === -1) {
            continue;
        } else {
            return false;
        }
    }
    return true;
}


function RunSpecificPattern() {
    showSections = false
    let Beat = document.getElementById("TimeSignatureTopValue").value

    if (localStorage.getItem("Metronome")) {
        document.querySelector('#PlayPauseVideo').click()
    }

    document.getElementById("GenerateVideo").style.display = "inline-block"
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"

    let SelectBarsCheckBox = document.querySelectorAll(".SelectBarsCheckBox");
    let SelectedValueArr = []
    for (let i = 0; i < SelectBarsCheckBox.length; i++) {
        if (SelectBarsCheckBox[i].checked) {
            SelectedValueArr.push(i)
        }

    }

    if (!SelectedValueArr.length) {
        return alert(`Please Select any bar`);
    }

    if (!increasingSequence(SelectedValueArr)) {
        return alert(`Please Select Sequential Bars Only`);
    }

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    localStorage.setItem("StrummingPatternArrHold", StrummingPatternArr);

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let ModeArr = localStorage.getItem("ModeArr");
    localStorage.setItem("ModeArrHold", ModeArr);

    ModeArr = JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    let BeatArr = localStorage.getItem("BeatArr");
    localStorage.setItem("BeatArrHold", BeatArr);

    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);

    let SpecificPattern = []
    let SpecificModeArr = []
    let SpecificBeatArr = []

    for (let i = 0; i < SelectedValueArr.length; i++) {

        let DelIndex = 0
        for (let j = 0; j < NumberOfBeatArr.length; j++) {
            if (j < SelectedValueArr[i]) {
                DelIndex += NumberOfBeatArr[j]
            }

        }

        let DelCount = NumberOfBeatArr[SelectedValueArr[i]]

        let slicedArray = StrummingPatternArr.slice(DelIndex, DelIndex + DelCount);

        let slicedBeatArr = BeatArr.slice(Beat * SelectedValueArr[i], (Beat * SelectedValueArr[i]) + parseInt(Beat));

        SpecificPattern.push(...slicedArray)
        SpecificBeatArr.push(...slicedBeatArr)
        SpecificModeArr.push(ModeArr[SelectedValueArr[i]])

    }

    SpecificPattern = JSON.stringify(SpecificPattern);
    SpecificModeArr = JSON.stringify(SpecificModeArr);
    SpecificBeatArr = JSON.stringify(SpecificBeatArr);

    localStorage.setItem("StrummingPatternArr", SpecificPattern);
    localStorage.setItem("ModeArr", SpecificModeArr);
    localStorage.setItem("BeatArr", SpecificBeatArr);

    if (isAdvancedMode) {

        let StoreIntensityArr = localStorage.getItem("StoreIntensityArr");
        localStorage.setItem("StoreIntensityArrHold", StoreIntensityArr);

        StoreIntensityArr = JSON.parse(StoreIntensityArr);
        StoreIntensityArr = Object.values(StoreIntensityArr);

        let SpecificPattern = []

        for (let i = 0; i < SelectedValueArr.length; i++) {

            let DelIndex = 0
            for (let j = 0; j < NumberOfBeatArr.length; j++) {
                if (j < SelectedValueArr[i]) {
                    DelIndex += NumberOfBeatArr[j]
                }

            }
            let DelCount = NumberOfBeatArr[SelectedValueArr[i]]

            let slicedArray = StoreIntensityArr.slice(DelIndex, DelIndex + DelCount);
            SpecificPattern.push(...slicedArray)

        }

        SpecificPattern = JSON.stringify(SpecificPattern);

        localStorage.setItem("StoreIntensityArr", SpecificPattern);

        AdvancedStrummingPattern()
    } else {

        DisplayStrummingPattern()
    }


    try {
        let checkbox = document.querySelectorAll('input[type=checkbox][class=SelectBarsCheckBox]:checked');
        for (let i = 0; i < checkbox.length; i++) {
            checkbox[i].checked = false;
        }
    } catch (error) { }
    BarsVisible = true;
    SelectPatterns()
    DisplayNone("NewSectionBtn")
    DisplayNone("TransposeKeyBtn")

    document.getElementsByClassName("CopyPasteBtn")[0].style.display = "none"
    document.getElementsByClassName("CopyPasteBtn")[1].style.display = "none"
    document.getElementsByClassName("CopyPasteBtn")[2].style.display = "block"

}

function BackToAllPatterns() {
    showSections = true

    if (localStorage.getItem("Metronome")) {
        document.querySelector('#PlayPauseVideo').click()
    }

    document.getElementById("GenerateVideo").style.display = "inline-block"
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"

    document.getElementById("ChordVideoSection").innerHTML = ""
    document.getElementById("ChordHandVideoSection").innerHTML = ""
    document.getElementById("AudioSecion").innerHTML = ""
    document.getElementById("DiagramsContainer").innerHTML = ""

    document.getElementsByClassName("CopyPasteBtn")[0].style.display = "none"
    document.getElementsByClassName("CopyPasteBtn")[1].style.display = "none"
    document.getElementsByClassName("CopyPasteBtn")[2].style.display = "none"

    DisplayEle("NewSectionBtn", "inline-block")
    if (IsSplit) {
        // working here to remove that object patterns and add new data

        let StrummingPatternArrHold = localStorage.getItem("StrummingPatternArrHold")
        StrummingPatternArrHold = JSON.parse(StrummingPatternArrHold);
        StrummingPatternArrHold = Object.values(StrummingPatternArrHold);

        let ModeArrHold = localStorage.getItem("ModeArrHold")
        ModeArrHold = JSON.parse(ModeArrHold);
        ModeArrHold = Object.values(ModeArrHold);

        let BeatArrHold = localStorage.getItem("BeatArrHold")
        BeatArrHold = JSON.parse(BeatArrHold);
        BeatArrHold = Object.values(BeatArrHold);

        let StrummingPatternArr = localStorage.getItem("StrummingPatternArr")
        StrummingPatternArr = JSON.parse(StrummingPatternArr);
        StrummingPatternArr = Object.values(StrummingPatternArr);

        let ModeArr = localStorage.getItem("ModeArr")
        ModeArr = JSON.parse(ModeArr);
        ModeArr = Object.values(ModeArr);

        let BeatArr = localStorage.getItem("BeatArr")
        BeatArr = JSON.parse(BeatArr);
        BeatArr = Object.values(BeatArr);

        let ChangesDataObject = localStorage.getItem("ChangesDataObject");
        ChangesDataObject = JSON.parse(ChangesDataObject);

        // remove and add updated patterns
        StrummingPatternArrHold.splice(ChangesDataObject["PatternDelIndex"], ChangesDataObject["PatternDelCount"], ...StrummingPatternArr)
        ModeArrHold.splice(ChangesDataObject["ModeDelIndex"], ChangesDataObject["ModeDelCount"], ...ModeArr)
        BeatArrHold.splice(ChangesDataObject["BeatDelIndex"], ChangesDataObject["BeatDelCount"], ...BeatArr)

        StrummingPatternArrHold = JSON.stringify(StrummingPatternArrHold);
        ModeArrHold = JSON.stringify(ModeArrHold);
        BeatArrHold = JSON.stringify(BeatArrHold);

        localStorage.setItem("StrummingPatternArr", StrummingPatternArrHold);
        localStorage.setItem("ModeArr", ModeArrHold);
        localStorage.setItem("BeatArr", BeatArrHold);

        localStorage.removeItem("StrummingPatternArrHold")
        localStorage.removeItem("ModeArrHold")
        localStorage.removeItem("BeatArrHold")

        if (isAdvancedMode) {

            let StoreIntensityArrHold = localStorage.getItem("StoreIntensityArrHold")
            StoreIntensityArrHold = JSON.parse(StoreIntensityArrHold);
            StoreIntensityArrHold = Object.values(StoreIntensityArrHold);

            let StoreIntensityArr = localStorage.getItem("StoreIntensityArr")
            StoreIntensityArr = JSON.parse(StoreIntensityArr);
            StoreIntensityArr = Object.values(StoreIntensityArr);

            StoreIntensityArrHold.splice(ChangesDataObject["IntensityDelIndex"], ChangesDataObject["IntensityDelCount"], ...StoreIntensityArr)

            StoreIntensityArrHold = JSON.stringify(StoreIntensityArrHold);
            localStorage.setItem("StoreIntensityArr", StoreIntensityArrHold);

            localStorage.removeItem("StoreIntensityArrHold")


            AdvancedStrummingPattern()
        } else {

            DisplayStrummingPattern()
        }
        IsSplit = false
        return
    }

    if (isAdvancedMode) {

        localStorage.setItem("StrummingPatternArr", localStorage.getItem("StrummingPatternArrHold"))
        localStorage.removeItem("StrummingPatternArrHold")

        localStorage.setItem("StoreIntensityArr", localStorage.getItem("StoreIntensityArrHold"))
        localStorage.removeItem("StoreIntensityArrHold")

        localStorage.setItem("ModeArr", localStorage.getItem("ModeArrHold"))
        localStorage.removeItem("ModeArrHold")

        localStorage.setItem("BeatArr", localStorage.getItem("BeatArrHold"))
        localStorage.removeItem("BeatArrHold")

        AdvancedStrummingPattern()
    } else {
        localStorage.setItem("StrummingPatternArr", localStorage.getItem("StrummingPatternArrHold"))
        localStorage.setItem("ModeArr", localStorage.getItem("ModeArrHold"))
        localStorage.setItem("BeatArr", localStorage.getItem("BeatArrHold"))

        localStorage.removeItem("StrummingPatternArrHold")
        localStorage.removeItem("ModeArrHold")
        localStorage.removeItem("BeatArrHold")

        DisplayStrummingPattern()
    }
}

function CancelSelect() {
    document.getElementsByClassName("CopyPasteBtn")[0].style.display = "none"
    try {
        let checkbox = document.querySelectorAll('input[type=checkbox][class=SelectBarsCheckBox]:checked');
        for (let i = 0; i < checkbox.length; i++) {
            checkbox[i].checked = false;
        }
    } catch (error) { }
    BarsVisible = true;
    SelectPatterns()
}

function CancelIntensitySelect() {
    document.getElementsByClassName("ChanheIntensitySelectDiv")[0].style.display = "none"
    try {
        let checkbox = document.querySelectorAll('input[type=checkbox][class=SelectIntensityCheckBox]:checked');
        for (let i = 0; i < checkbox.length; i++) {
            checkbox[i].checked = false;
        }
    } catch (error) { }
    IntensitySelectVisible = true;

    SelectIntensities()

    DisplayEle("NewSectionBtn", "inline-block")
    DisplayEle("TransposeKeyBtn", "inline-block")

}

// function SetDefaultOr16ths() {
//     if (localStorage.getItem("Metronome")) {
//         return console.log(`Not Possible`);
//     }
//     let SpecificPattern = localStorage.getItem("SpecificPattern")
//     if (SpecificPattern) {
//         return console.log("Can't update BPM, try to back to All Patterns")
//     }

//     let bpm = document.getElementById("BpmValue").value;
//     if (!bpm) {
//         bpm = 70
//     }
//     if (bpm <= 50) {
//         document.querySelector("#TimeSign16ths").checked = true;
//     } else {
//         document.querySelector("#Default").checked = true;
//     }

//     GetMainValueByTimeSign()



// }

function AdvancedMode() {
    if (localStorage.getItem("Metronome")) {
        document.querySelector('#PlayPauseVideo').click()
    }
    AdvancedStrummingPattern()
    // document.getElementById("GenerateVideo").style.display = "none"
    document.getElementById("AdvancedMode").style.display = "none"
    document.getElementById("AdvancedModeExit").style.display = "inline-block"
    isAdvancedMode = true
    CheckAdvancedModeAciveRealTime()
}

function AdvancedModeExit() {
    if (localStorage.getItem("Metronome")) {
        document.querySelector('#PlayPauseVideo').click()
    }
    document.getElementById("GenerateVideo").style.display = "inline-block"
    document.getElementById("AdvancedMode").style.display = "inline-block"

    document.getElementById("AdvancedModeExit").style.display = "none"
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"
    isAdvancedMode = false
    DisplayStrummingPattern()
    CheckAdvancedModeAciveRealTime()

}


// Show dot Menu
function showDropdown(ele) {
    let index = ele.classList[4].split("whichNumber")[1];
    document.getElementById(`myDropdown${index}`).classList.toggle("show");

}
function showDropdownForBeat(id) {
    // let index = ele.classList[4].split("whichNumber")[1];
    document.getElementById(id).classList.toggle("show");

}

function removeDuplicates(arr) {
    return [...new Set(arr)];
}

async function FetchFiles() {
    PreviewAudioPlay = false

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let validate = ValidateStrummingPattern(StrummingPatternArr);
    if (validate == "Not Possilbe") {
        return alert(`Can't update due to some wrong Pattern`);
    }

    let logo = document.getElementById("loading-image");
    logo.src = logo.getAttribute("src")
    document.getElementById("loading").style.display = "block"

    if(!localStorage.getItem("StrummingPatternArrHold")){
        await SyncSongData();
    }


    document.getElementById("AudioSecion").innerHTML = ""
    document.getElementById("ChordVideoSection").innerHTML = ""
    document.getElementById("ChordHandVideoSection").innerHTML = ""
    document.getElementById("DiagramsContainer").innerHTML = ""


    // let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    // StrummingPatternArr = JSON.parse(StrummingPatternArr);
    // StrummingPatternArr = Object.values(StrummingPatternArr);

    let ChordsVideoArr = []
    let StoreIntensityArr = localStorage.getItem("StoreIntensityArr");

    // if (!StoreIntensityArr) {
    //     document.getElementById("loading").style.display = "none"
    //     return
    // }
    
    if(isAdvancedMode){
            console.log(`Adva`);
            StoreIntensityArr = JSON.parse(StoreIntensityArr);
            StoreIntensityArr = Object.values(StoreIntensityArr);
    }else{
            StoreIntensityArr = IntensityForDefaultMode()
    }

    let count = 0
    let CurrentChordValue, PreviousChordValue
    AudioIntensity = []
    StrummingPatternArr.map((e) => {
        CurrentChordValue = e[1]

        if (e[1] != "Empty") {
            ChordsVideoArr.push(`${e[1]}`)

            if (CurrentChordValue != "NC-muted") {
                PreviousChordValue = CurrentChordValue
            }

        }

        if (CurrentChordValue == "Empty") {
            CurrentChordValue = PreviousChordValue
        }
        // if (e[1] == "NC") {
        // CurrentChordValue = "NC-muted-default"
        // }

        if (e[0] == "E") {
            AudioIntensity.push(`E`)
            count++
        } else {

            // if (e[0] == "U") {

            //         AudioIntensity.push(`${CurrentChordValue}-default-up.wav`)
            //         count++

            //     } else {
            //         AudioIntensity.push(`${CurrentChordValue}-default-down.wav`)
            //         count++
            //     }
                
            let IntensityValue = StoreIntensityArr[count]

            // if (!document.querySelectorAll(".Intensity")[count]) {
            //     IntensityValue = "default"
            // } else {
            //     IntensityValue = IntensityValue.value
            // }

            if (IntensityValue == "muted-full" || IntensityValue == "muted-half") {

                AudioIntensity.push(`${CurrentChordValue}-${IntensityValue}.wav`)
                count++
            } else if (IntensityValue == "NC") {
                if (e[0] == "U") {

                    AudioIntensity.push(`NC-muted-default-up.wav`)
                } else {
                    AudioIntensity.push(`NC-muted-default-down.wav`)

                }
                count++
            } else {
                if (e[0] == "U") {

                    AudioIntensity.push(`${CurrentChordValue}-${IntensityValue}-up.wav`)
                    count++

                } else {
                    AudioIntensity.push(`${CurrentChordValue}-${IntensityValue}-down.wav`)
                    count++
                }
            }

        }

    });

    console.log(AudioIntensity);
    // console.log(ChordsVideoArr);
    // return


    let DiagramsArr = []
    ChordsVideoArr.map((e) => {
        DiagramsArr.push(`${e}.png`)
    })

    DiagramsArr = removeDuplicates(DiagramsArr)
    let getChrodsFilesArr = await fetch(`${API}/getChordsDataPremium`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "ChordsAudioArray": AudioIntensity,
            "ChordsVideoArray": ChordsVideoArr,
            "ChordsVideoType": VideoType
        })
    })
    getChrodsFilesArr = await getChrodsFilesArr.json();

    let AudioArr = getChrodsFilesArr.ChordsAudioArray;
    let VideoArr = getChrodsFilesArr.ChordsVideoArray;

    // console.log(AudioArr);
    // console.log(VideoArr);

    await StroeFiles(AudioArr, VideoArr, DiagramsArr)
    await SetFilesToDisplay(AudioArr, VideoArr, DiagramsArr)

    console.log(`Downloaded Data`);
    // document.getElementById("PauseVideo").style.display = "inline-block"
    // document.getElementById("PlayVideo").style.display = "inline-block"
    // document.getElementById("RestartVideo").style.display = "inline-block"
    document.getElementById("GenerateVideo").innerHTML = "Update Video"
    document.getElementById("GenerateVideo").style.display = "none"
    document.getElementById("loading").style.display = "none"
    IntensityArr = []
    if (isAdvancedMode) {
        // document.getElementById("AdvancedMode").style.display = "none"
    }
    document.getElementById("StartVideo").style.display = "inline-block"

}

function StartVideo() {
    
    document.getElementById("RestartVideo").click();
    document.getElementById("StartVideo").style.display = "none"
    
    document.getElementById("PlayPauseVideo").style.display = "inline-block"
    document.getElementById("RestartVideo").style.display = "inline-block"

}


async function SetFilesToDisplay(AudioArr, VideoArr, DiagramsArr) {
    AudioArr.push("Click1.wav")
    AudioArr.push("Click2.wav")

    let LeftHandVideo = [`HandUp-${VideoType}-default.gif`, `HandDown-${VideoType}-default.gif`]

    // For Audio
    for (let i = 0; i < AudioArr.length; i++) {

        const url = await FetchFileFromDB(AudioArr[i])
        let container = document.getElementById("AudioSecion");
        container.innerHTML += `<audio src="${url}" id="${AudioArr[i]}"></audio>`
    }

    // For Video

    for (let i = 0; i < VideoArr.length; i++) {

        const url = await FetchFileFromDB(VideoArr[i])
        let container = document.getElementById("ChordVideoSection");
        container.innerHTML += `<video width="320" height="240" id="${VideoArr[i]}" style="display: none; margin-left: -4.5px;">
            <source src="${url}" type="video/mp4">
            Your browser does not support the video tag.
        </video>`
    }

    // For GiF
    for (let i = 0; i < LeftHandVideo.length; i++) {

        const url = await FetchFileFromDB(LeftHandVideo[i])

        let container = document.getElementById("ChordHandVideoSection");
        container.innerHTML += `<img src="${url}" class="VideoConatiner" width="320" height="180" style="display:none" alt="" srcset="" id="${LeftHandVideo[i]}">
        `

    }


    // For PNG
    for (let i = 0; i < DiagramsArr.length; i++) {

        const url = await FetchFileFromDB(DiagramsArr[i])

        let container = document.getElementById("DiagramsContainer");
        container.innerHTML += `<img src="${url}" id="${DiagramsArr[i]}" style="display:none">
        `

    }


}

async function StroeFiles(AudioArr, VideoArr, DiagramsArr) {

    let StoredFilesArr = localStorage.getItem("AppChrodsData")
    if (StoredFilesArr) {
        StoredFilesArr = JSON.parse(StoredFilesArr);
        StoredFilesArr = Object.values(StoredFilesArr);
    } else {
        StoredFilesArr = []
    }

    AudioArr.push("Click1.wav")
    AudioArr.push("Click2.wav")

    // let pairs = ["", "1", "2", "3"]

    // let randomNumber = Math.floor(Math.random() * 4);

    // RandomRightHandVideo = pairs[randomNumber]
    
    let LeftHandVideo = [`HandUp-${VideoType}-default.gif`, `HandDown-${VideoType}-default.gif`]
    
    console.log(LeftHandVideo);

    var date = new Date();
    let ID = `${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}`
    for (let i = 0; i < AudioArr.length; i++) {
        if (!StoredFilesArr.includes(AudioArr[i])) {

            let response = await fetch(`${API}/files/${ID}/${AudioArr[i]}`)
            let data = await response.blob()
        }
    }


    for (let i = 0; i < AudioArr.length; i++) {
        if (!StoredFilesArr.includes(AudioArr[i])) {

            let response = await fetch(`${API}/DownloadFiles/${ID}/${AudioArr[i]}`)
            let data = await response.blob()

            const url = URL.createObjectURL(data);

            let Saved = await InsertFileToDB(data, AudioArr[i], "audio/wav")
            if (Saved != "Error") {

                StoredFilesArr.push(AudioArr[i])
            }

        }
    }


    // VideoArr Store Files

    for (let i = 0; i < VideoArr.length; i++) {
        if (!StoredFilesArr.includes(VideoArr[i])) {

            let response = await fetch(`${API}/files/${ID}/${VideoArr[i]}`)
            let data = await response.blob()
        }
    }


    for (let i = 0; i < VideoArr.length; i++) {
        if (!StoredFilesArr.includes(VideoArr[i])) {

            let response = await fetch(`${API}/DownloadFiles/${ID}/${VideoArr[i]}`)
            let data = await response.blob()

            const url = URL.createObjectURL(data);

            let Saved = await InsertFileToDB(data, VideoArr[i], "video/mp4")
            if (Saved != "Error") {

                StoredFilesArr.push(VideoArr[i])
            }

        }
    }

    // LeftHandUpDown Video Store


    for (let i = 0; i < LeftHandVideo.length; i++) {
        if (!StoredFilesArr.includes(LeftHandVideo[i])) {

            let response = await fetch(`${API}/files/${ID}/${LeftHandVideo[i]}`)
            let data = await response.blob()
        }
    }


    for (let i = 0; i < LeftHandVideo.length; i++) {
        if (!StoredFilesArr.includes(LeftHandVideo[i])) {

            let response = await fetch(`${API}/DownloadFiles/${ID}/${LeftHandVideo[i]}`)
            let data = await response.blob()

            const url = URL.createObjectURL(data);

            let Saved = await InsertFileToDB(data, LeftHandVideo[i], "image/gif")
            if (Saved != "Error") {

                StoredFilesArr.push(LeftHandVideo[i])
            }

        }
    }

    // For Diagrams

    for (let i = 0; i < DiagramsArr.length; i++) {
        if (!StoredFilesArr.includes(DiagramsArr[i])) {

            let response = await fetch(`${API}/files/${ID}/${DiagramsArr[i]}`)
            let data = await response.blob()
        }
    }


    for (let i = 0; i < DiagramsArr.length; i++) {
        if (!StoredFilesArr.includes(DiagramsArr[i])) {

            let response = await fetch(`${API}/DownloadFiles/${ID}/${DiagramsArr[i]}`)
            let data = await response.blob()

            const url = URL.createObjectURL(data);

            let Saved = await InsertFileToDB(data, DiagramsArr[i], "image/png")
            if (Saved != "Error") {

                StoredFilesArr.push(DiagramsArr[i])
            }

        }
    }


    StoredFilesArr = JSON.stringify(StoredFilesArr);
    localStorage.setItem("AppChrodsData", StoredFilesArr);

    let response = await fetch(`${API}/delete/${ID}`)
    let data = await response.text()
    console.log(data);
}

async function SyncNewFiles() {

    let StoredFilesArr = localStorage.getItem("AppChrodsData")
    if (!StoredFilesArr) {
        return console.log(`No data Found`);
    }
    StoredFilesArr = JSON.parse(StoredFilesArr);
    StoredFilesArr = Object.values(StoredFilesArr);

    // Version Controller here

}

async function DownloadVideo() {
    document.getElementById("loading").style.display = "block"

    let StrumminPatternArr = localStorage.getItem("StrummingPatternArr");
    StrumminPatternArr = JSON.parse(StrumminPatternArr);
    StrumminPatternArr = Object.values(StrumminPatternArr);

    let Intensities = []
    if (isAdvancedMode) {
        Intensities = localStorage.getItem("StoreIntensityArr");
        Intensities = JSON.parse(Intensities);
        Intensities = Object.values(Intensities);
    }

    var date = new Date();
    let ID = `${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}`

    let BPM = document.getElementById("BpmValue").value;
    let Metronome = document.getElementById("metronomeSound").checked

    let TimeSignature = [document.getElementById("TimeSignatureTopValue").value, document.getElementById("TimeSignatureBottomValue").value]
    // console.log(MetronomeSpeedArr);
    // console.log(Intensities);
    // console.log(MetronomeClickArr);
    // console.log(TimeSignature);
    try {
        let requested = await fetch(`${API}/generate-video`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "StrumminPatternArr": StrumminPatternArr,
                "SingleBeatArr": MetronomeSpeedArr,
                "IntensityArr": Intensities,
                "MetronomeClicksArr": MetronomeClickArr,
                "Id": ID,
                "Time": "16.80",
                "BPM": BPM,
                "MetronomeOnOff": Metronome,
                "TimeSignature": TimeSignature
            })
        })

        let data = await requested.text();
        if (data == "Generated") {
            let response = await fetch(`${API}/download/${ID}16.80`)
            let data = await response.blob()

            let url = URL.createObjectURL(data);
            console.log(url);

            const link = document.createElement('a')

            link.setAttribute('href', url)
            link.setAttribute('download', "Downloaded Video.mp4")
            link.style.display = 'none'

            document.body.appendChild(link)

            link.click()

        }
        document.getElementById("loading").style.display = "none"

    } catch (error) {
        console.log(error);
        alert("Something went wrong")
        document.getElementById("loading").style.display = "none"
    }


}
// Add a start button

async function DownloadAudio() {
    document.getElementById("loading").style.display = "block"

    let MainArray = localStorage.getItem("StrummingPatternArr");
    MainArray = JSON.parse(MainArray);
    MainArray = Object.values(MainArray);

    var date = new Date();
    let ID = `${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}`

    let BPM = document.getElementById("BpmValue").value;
    let Metronome = document.getElementById("metronomeSound").checked
    if (Metronome) {
        Metronome = "true"
    } else {
        Metronome = "false"
    }

    let TimeSignature = [document.getElementById("TimeSignatureTopValue").value, document.getElementById("TimeSignatureBottomValue").value]
    let DefaultTimeSign = localStorage.getItem("DefaultTimeSign")

    let requested = await fetch(`${API}/generate-audio`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "MainArray": MainArray,
            "Id": ID,
            "Time": "16.80",
            "BPM": BPM,
            "MetronomeOnOff": Metronome,
            "TimeSignature": TimeSignature,
            "DefaultTimeSign": DefaultTimeSign

        })
    })
    let data = await requested.text();

    if (data == "Generated") {
        let response = await fetch(`${API}/download-audio/${ID}16.80`)
        let data = await response.blob()

        let url = URL.createObjectURL(data);
        console.log(url);

        const link = document.createElement('a')

        link.setAttribute('href', url)
        link.setAttribute('download', `${MainArray[0][1]}-Audio.wav`)
        link.style.display = 'none'

        document.body.appendChild(link)

        link.click()

    } else {
        alert("Something Went Wrong")
    }

    document.getElementById("loading").style.display = "none"

}

function SetVideoType() {
    VideoType = document.querySelector('input[name="VideoType"]:checked').value;
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"
    document.getElementById("StartVideo").style.display = "none"

    document.getElementById("GenerateVideo").style.display = "inline-block"
    // document.getElementById("AdvancedMode").style.display = "inline-block"
}
// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches(".dropbtn")) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains("show")) {
                openDropdown.classList.remove("show");
            }
        }
    }

    if (!event.target.matches(".pattern-number-main")) {
        var dropdowns = document.getElementsByClassName("dropdown-contentForBeat");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains("show")) {
                openDropdown.classList.remove("show");
            }
        }
    }

    if (!event.target.matches(".SongSectionEvent")) {
        var dropdowns = document.getElementsByClassName("dropdown-contentForSection");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains("show")) {
                openDropdown.classList.remove("show");
            }
        }
    }

    if (!event.target.matches(".NestedMenuEvent")) {
        var dropdowns = document.getElementsByClassName("dropdown-contentForNestedMenu");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains("show")) {
                openDropdown.classList.remove("show");
            }
        }
    }




};
// if (!('indexedDB' in window)) {
//     console.log("This browser doesn't support IndexedDB");
// }

let db;
let dbVersion = 1;
let dbReady = false;

document.addEventListener('DOMContentLoaded', () => {
    console.log('dom content loaded');
    document.getElementById("loading").style.display = "none"
    document.getElementById("Body").style.display = "block"
    initDb();
});

function initDb() {
    let request = indexedDB.open('AppData', dbVersion);

    request.onerror = function (e) {
        console.error('Unable to open database.');
    }

    request.onsuccess = function (e) {
        db = e.target.result;
        console.log('db opened');
    }

    request.onupgradeneeded = function (e) {
        let db = e.target.result;
        db.createObjectStore('ChordsData', { keyPath: 'id', autoIncrement: true });
        dbReady = true;
    }
}

async function InsertFileToDB(file, ChordName, contentType, version = "v1") {
    var reader = new FileReader();
    reader.readAsBinaryString(file);

    return new Promise(resolve => {

        reader.onload = function (e) {
            let bits = e.target.result;

            let trans = db.transaction(['ChordsData'], 'readwrite');
            let addReq = trans.objectStore('ChordsData');
            addReq.put({ id: ChordName, data: bits, contentType: contentType, version: version });

            addReq.onerror = function (e) {
                console.log('error storing data');
                resolve(false)
                console.error(e);
            }

            trans.oncomplete = function (e) {
                resolve(bits)
                // console.log('data stored');
            }
        }
    })
}

async function FetchFileFromDB(ChordName) {
    let trans = db.transaction(['ChordsData'], 'readonly');
    let req = trans.objectStore('ChordsData').get(ChordName);
    return new Promise(resolve => {

        req.onsuccess = function (e) {
            let record = e.target.result;
            let blobDB = btoa(record.data);
            let contentType = record.contentType;
            const blob = b64toBlob(blobDB, contentType);
            const blobUrl = URL.createObjectURL(blob);
            resolve(blobUrl)
        }
    })
}


function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

$(document).ready(function () {
    $('.strumming-pattern-select').select2({
        tags: false,
        matcher: matchCustom
    });
    $('.select-chords-search').select2({
        tags: false,
        matcher: matchCustom
    });
});


function matchCustom(params, data) {
    try {
        document.getElementsByClassName("select2-search__field")[0].value = capitalizeFLetter(params.term)
        params.term = capitalizeFLetter(params.term)
    } catch (error) {

    }

    if ($.trim(params.term) === '') {
        return data;
    }

    if (typeof data.text === 'undefined') {
        return null;
    }

    if (data.text.indexOf(params.term) > -1) {
        var modifiedData = $.extend({}, data, true);

        return modifiedData;
    }

    return null;
}
function capitalizeFLetter(string) {
    let re = string[0].toUpperCase() + string.slice(1)
    return re
}


function BeatChange(BeatIndex, ChangeTo) {
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let BeatArr = localStorage.getItem("BeatArr");
    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);

    if (BeatArr[BeatIndex - 1] == ChangeTo) {
        return alert("You can't change into same beat mode")
    }
    let FunctionUsed = `${BeatArr[BeatIndex - 1]}To${ChangeTo}`
    let CuttingArr = []
    let count = 0
    CuttingArr.push(count)
    BeatArr.map(function (val, index) {
        switch (val) {
            case "Default":
                if (document.getElementById("TimeSignatureBottomValue").value == 4) {

                    count += 2
                } else {
                    count += 1
                }
                CuttingArr.push(count)
                break;
            case "Shuffle":
                count += 3
                CuttingArr.push(count)
                break;
            case "16ths":
                if (document.getElementById("TimeSignatureBottomValue").value == 4) {

                    count += 4
                } else {
                    count += 2
                }
                CuttingArr.push(count)
                break;

            default:
                break;
        }
    })

    let slicedArray = StrummingPatternArr.slice(CuttingArr[BeatIndex - 1], CuttingArr[BeatIndex]);
    let temp
    if (document.getElementById("TimeSignatureBottomValue").value == 4) {
        switch (FunctionUsed) {
            case "DefaultToShuffle":
                temp = DefaultToShuffle(slicedArray)

                break;
            case "DefaultTo16ths":
                temp = DefaultTo16th(slicedArray)

                break;
            case "ShuffleToDefault":
                temp = ShuffleToDefault(slicedArray)

                break;
            case "ShuffleTo16ths":
                temp = ShuffleTo16ths(slicedArray)

                break;
            case "16thsToDefault":
                temp = Fn16thToDefault(slicedArray)

                break;
            case "16thsToShuffle":
                temp = Fn16thToShuffle(slicedArray)

                break;

            default:
                break;
        }
    } else {
        switch (FunctionUsed) {
            case "DefaultToShuffle":
                temp = DefaultToShuffleby8(slicedArray)

                break;
            case "DefaultTo16ths":
                temp = DefaultTo16thby8(slicedArray)

                break;
            case "ShuffleToDefault":
                temp = ShuffleToDefaultby8(slicedArray)

                break;
            case "ShuffleTo16ths":
                temp = ShuffleTo16thsby8(slicedArray)

                break;
            case "16thsToDefault":
                temp = Fn16thToDefaultby8(slicedArray)

                break;
            case "16thsToShuffle":
                temp = Fn16thToShuffleby8(slicedArray)

                break;

            default:
                break;
        }
    }
    console.log(temp);

    StrummingPatternArr.splice((CuttingArr[BeatIndex - 1]), CuttingArr[BeatIndex] - CuttingArr[BeatIndex - 1], ...temp);
    BeatArr.splice(BeatIndex - 1, 1, ChangeTo);

    // console.log(StrummingPatternArr);
    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);

    BeatArr = JSON.stringify(BeatArr);
    localStorage.setItem("BeatArr", BeatArr);

    document.getElementById("GenerateVideo").style.display = "inline-block"
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"
    document.getElementById("StartVideo").style.display = "none"

    document.getElementById("ChordVideoSection").innerHTML = ""
    document.getElementById("ChordHandVideoSection").innerHTML = ""
    document.getElementById("AudioSecion").innerHTML = ""
    ShowOnDisplay()

    // ShowSectionNameOnBar()

}


function ChangeBeatModeForModeChange(BeatIndex, ChangeTo) {

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let BeatArr = localStorage.getItem("BeatArr");
    BeatArr = JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);

    if (BeatArr[BeatIndex - 1] == ChangeTo) {
        return
    }
    let FunctionUsed = `${BeatArr[BeatIndex - 1]}To${ChangeTo}`
    let CuttingArr = []
    let count = 0
    CuttingArr.push(count)
    BeatArr.map(function (val, index) {
        switch (val) {
            case "Default":
                if (document.getElementById("TimeSignatureBottomValue").value == 4) {

                    count += 2
                } else {
                    count += 1
                }
                CuttingArr.push(count)
                break;
            case "Shuffle":
                count += 3
                CuttingArr.push(count)
                break;
            case "16ths":
                if (document.getElementById("TimeSignatureBottomValue").value == 4) {

                    count += 4
                } else {
                    count += 2
                }
                CuttingArr.push(count)
                break;

            default:
                break;
        }
    })

    let slicedArray = StrummingPatternArr.slice(CuttingArr[BeatIndex - 1], CuttingArr[BeatIndex]);
    let temp
    if (document.getElementById("TimeSignatureBottomValue").value == 4) {
        switch (FunctionUsed) {
            case "DefaultToShuffle":
                temp = DefaultToShuffle(slicedArray)

                break;
            case "DefaultTo16ths":
                temp = DefaultTo16th(slicedArray)

                break;
            case "ShuffleToDefault":
                temp = ShuffleToDefault(slicedArray)

                break;
            case "ShuffleTo16ths":
                temp = ShuffleTo16ths(slicedArray)

                break;
            case "16thsToDefault":
                temp = Fn16thToDefault(slicedArray)

                break;
            case "16thsToShuffle":
                temp = Fn16thToShuffle(slicedArray)

                break;

            default:
                break;
        }
    } else {
        switch (FunctionUsed) {
            case "DefaultToShuffle":
                temp = DefaultToShuffleby8(slicedArray)

                break;
            case "DefaultTo16ths":
                temp = DefaultTo16thby8(slicedArray)

                break;
            case "ShuffleToDefault":
                temp = ShuffleToDefaultby8(slicedArray)

                break;
            case "ShuffleTo16ths":
                temp = ShuffleTo16thsby8(slicedArray)

                break;
            case "16thsToDefault":
                temp = Fn16thToDefaultby8(slicedArray)

                break;
            case "16thsToShuffle":
                temp = Fn16thToShuffleby8(slicedArray)

                break;

            default:
                break;
        }
    }

    StrummingPatternArr.splice((CuttingArr[BeatIndex - 1]), CuttingArr[BeatIndex] - CuttingArr[BeatIndex - 1], ...temp);
    BeatArr.splice(BeatIndex - 1, 1, ChangeTo);

    // console.log(StrummingPatternArr);
    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);

    BeatArr = JSON.stringify(BeatArr);
    localStorage.setItem("BeatArr", BeatArr);
}

function AddNewSectionofSong() {

    document.getElementById("AddSectionRange").style.display = "block"
    document.getElementById("RangeFrom").value = ""
    document.getElementById("RangeTo").value = ""
}

function AddNewSectionRange() {
    let RangeFrom = document.getElementById("RangeFrom").value
    let RangeTo = document.getElementById("RangeTo").value

    if (!RangeFrom || !RangeTo) {
        return alert("Please Enter Range to Proceed")
    }

    if (RangeTo > BarHTMLContentArr.length) {
        return alert("Range is Out of Patterns")
    }

    RangeFrom = parseInt(RangeFrom)
    RangeTo = parseInt(RangeTo)

    RangeFrom = RangeFrom - 1
    RangeTo = RangeTo - 1


    if (RangeFrom < 0 || RangeTo < 0) {
        return alert("Please Enter correct Range to Proceed")
    }

    if (RangeFrom > RangeTo) {
        return alert("Start Range must be less than the End Range")
    }


    let SongSectionNames = localStorage.getItem("SongSectionNames")

    if (SongSectionNames) {
        SongSectionNames = JSON.parse(SongSectionNames);
        SongSectionNames = Object.values(SongSectionNames);

        let AllRanges = []

        for (let i = 0; i < SongSectionNames.length; i++) {
            let SectionName = localStorage.getItem(SongSectionNames[i])
            SectionName = JSON.parse(SectionName);
            SectionName = Object.values(SectionName);

            AllRanges = [...AllRanges, ...SectionName]
        }
        if (AllRanges.includes(parseInt(RangeFrom)) || AllRanges.includes(parseInt(RangeTo))) {
            return alert("This Range already in Use")
        }

    }



    let SectionName = prompt("Please Enter the Name for this sections")
    if (!SectionName) {
        return
    }

    let SelectedValueArr = []

    for (let i = RangeFrom; i <= RangeTo; i++) {
        i = parseInt(i)
        SelectedValueArr.push(i)
    }

    SelectedValueArr = JSON.stringify(SelectedValueArr);
    localStorage.setItem(SectionName, SelectedValueArr);

    if (SongSectionNames) {
        if (SongSectionNames.includes(SectionName)) {
            return alert("Section Name will need to be unique")
        }
        SongSectionNames.push(SectionName)

    } else {
        SongSectionNames = []
        SongSectionNames.push(SectionName)
    }

    SongSectionNames = JSON.stringify(SongSectionNames);
    localStorage.setItem("SongSectionNames", SongSectionNames);

    ShowSectionNameOnBar()
    document.getElementById("AddSectionRange").style.display = "none"

}

function ShowSectionNameOnBar() {

    let SongSectionNames = localStorage.getItem("SongSectionNames")
    if (!SongSectionNames) {
        document.getElementById("SectionContainer").style.display = "none"

        return
    }
    document.getElementById("SectionContainer").style.display = "inline-block"
    document.getElementById("TransposeKeyBtn").style.display = "inline-block"
    let container = document.getElementById("SectionContentID")
    container.innerHTML = ""

    let SectionOnBarLine = document.querySelectorAll(".SectionOnBarLine")
    for (let i = 0; i < SectionOnBarLine.length; i++) {
        SectionOnBarLine[i].style.display = "none"
    }

    SongSectionNames = JSON.parse(SongSectionNames);
    SongSectionNames = Object.values(SongSectionNames);

    for (let i = 0; i < SongSectionNames.length; i++) {
        let SectionName = localStorage.getItem(SongSectionNames[i])
        SectionName = JSON.parse(SectionName);
        SectionName = Object.values(SectionName);

        let id = SectionName[0]

        try {

        //     <svg xmlns="http://www.w3.org/2000/svg" onclick="PlaySection('${SongSectionNames[i]}')" style="margin-left: 10px;" width="20" height="20" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
        //     <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        //     <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445"/>
        // </svg>

        // <svg xmlns="http://www.w3.org/2000/svg" onclick="MoveBartoThatNumber('${id}')" style="margin-left: 10px;" width="20" height="20" fill="currentColor" class="bi bi-arrow-right-circle" viewBox="0 0 16 16">
        //     <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/>
        // </svg>

        let a = document.createElement("a")
        a.innerHTML = `${SongSectionNames[i]}

        <img onclick="SplitSection('${SongSectionNames[i]}')" style="margin-left: 10px;" width="20" height="20" src="https://img.icons8.com/ios-glyphs/90/split.png" alt="split"/>

        <svg xmlns="http://www.w3.org/2000/svg" onclick="EditSectionName('${SongSectionNames[i]}')" style="margin-left: 10px;" width="20" height="20" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
        </svg>

        <svg xmlns="http://www.w3.org/2000/svg" onclick="EditSectionRange('${SongSectionNames[i]}')" style="margin-left: 10px;" width="20" height="20" fill="currentColor" class="bi bi-list-ol" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"/>
            <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z"/>
        </svg>


        <svg xmlns="http://www.w3.org/2000/svg" onclick="DeleteSectionName('${SongSectionNames[i]}')" style="margin-left: 10px;" width="20" height="20" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
        </svg>
        `
        container.appendChild(a)
        
            document.getElementById(`Section${id}`).innerHTML = SongSectionNames[i]
        document.getElementById(`Section${id}`).style.display = "inline"

        // append section name

        
        } catch (error) {
            console.log(error);
        }

        

    }

}

function ShowSectionContents() {
    document.getElementById("SectionContentID").classList.toggle("show");
}

function ShowNestedMenu(i) {
    document.getElementById(`nestedMenu${i}`).classList.toggle("show");
}
function ShowNestedMenuMode(i) {
    document.getElementById(`nestedMenuMode${i}`).classList.toggle("show");
}
function ShowNestedMenuSelect(i) {
    document.getElementById(`nestedMenuSelect${i}`).classList.toggle("show");
}



function MoveBartoThatNumber(id) {
    document.getElementById(`Section${id}`).scrollIntoViewIfNeeded()
}

async function PlaySection(SectionName) {
    let metronome = document.getElementById("Click1.wav")
    if (!metronome) {
        return alert("Please Generate Video before Playing Section")
    }
    let SelectedValueArr = localStorage.getItem(SectionName)
    if (!SelectedValueArr) {
        return alert("Something Went Wrong")
    }

    SelectedValueArr = await JSON.parse(SelectedValueArr);
    SelectedValueArr = Object.values(SelectedValueArr);

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    StrummingPatternArr = await JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let DelIndex = 0
    for (let j = 0; j < NumberOfBeatArr.length; j++) {
        if (j < SelectedValueArr[0]) {
            DelIndex += NumberOfBeatArr[j]
        }

    }

    InstantStartFrom = [DelIndex, SelectedValueArr[0]]

    let ele = document.getElementById("InstantPlaySection")
    ele.click();

    document.getElementById("StartVideo").style.display = "none"

    document.getElementById("PlayPauseVideo").style.display = "inline-block"
    document.getElementById("RestartVideo").style.display = "inline-block"

}

async function SplitSection(SectionName) {

    if (localStorage.getItem("Metronome")) {
        document.querySelector('#PlayPauseVideo').click()
    }

    document.getElementById("GenerateVideo").style.display = "inline-block"
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"
    document.getElementById("StartVideo").style.display = "none"


    document.getElementById("ChordVideoSection").innerHTML = ""
    document.getElementById("ChordHandVideoSection").innerHTML = ""
    document.getElementById("AudioSecion").innerHTML = ""
    document.getElementById("DiagramsContainer").innerHTML = ""

    showSections = false
    let SelectedValueArr = localStorage.getItem(SectionName)
    if (!SelectedValueArr) {
        return alert("Something Went Wrong")
    }

    SelectedValueArr = await JSON.parse(SelectedValueArr);
    SelectedValueArr = Object.values(SelectedValueArr);

    let Beat = document.getElementById("TimeSignatureTopValue").value

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    localStorage.setItem("StrummingPatternArrHold", StrummingPatternArr);

    StrummingPatternArr = await JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let ModeArr = localStorage.getItem("ModeArr");
    localStorage.setItem("ModeArrHold", ModeArr);

    ModeArr = await JSON.parse(ModeArr);
    ModeArr = Object.values(ModeArr);

    let BeatArr = localStorage.getItem("BeatArr");
    localStorage.setItem("BeatArrHold", BeatArr);

    BeatArr = await JSON.parse(BeatArr);
    BeatArr = Object.values(BeatArr);

    let SpecificPattern = []
    let SpecificModeArr = []
    let SpecificBeatArr = []
    let once = true
    let ChangesDataObject = {
        "PatternDelIndex": 0, "PatternDelCount": 0,
        "ModeDelIndex": 0, "ModeDelCount": 0,
        "BeatDelIndex": 0, "BeatDelCount": 0,
        "IntensityDelIndex": 0, "IntensityDelCount": 0,
    }

    for (let i = 0; i < SelectedValueArr.length; i++) {

        let DelIndex = 0
        for (let j = 0; j < NumberOfBeatArr.length; j++) {
            if (j < SelectedValueArr[i]) {
                DelIndex += NumberOfBeatArr[j]
            }

        }

        let DelCount = NumberOfBeatArr[SelectedValueArr[i]]

        let slicedArray = StrummingPatternArr.slice(DelIndex, DelIndex + DelCount);

        let slicedBeatArr = BeatArr.slice(Beat * SelectedValueArr[i], (Beat * SelectedValueArr[i]) + parseInt(Beat));

        SpecificPattern.push(...slicedArray)
        SpecificBeatArr.push(...slicedBeatArr)
        SpecificModeArr.push(ModeArr[SelectedValueArr[i]])

        if (once) {
            ChangesDataObject["PatternDelIndex"] = DelIndex
            ChangesDataObject["ModeDelIndex"] = SelectedValueArr[i]
            ChangesDataObject["BeatDelIndex"] = Beat * SelectedValueArr[i]
            once = false
        }
    }

    ChangesDataObject["PatternDelCount"] = SpecificPattern.length
    ChangesDataObject["ModeDelCount"] = SpecificModeArr.length
    ChangesDataObject["BeatDelCount"] = SpecificBeatArr.length

    ChangesDataObject = JSON.stringify(ChangesDataObject);
    localStorage.setItem("ChangesDataObject", ChangesDataObject);

    SpecificPattern = JSON.stringify(SpecificPattern);
    SpecificModeArr = JSON.stringify(SpecificModeArr);
    SpecificBeatArr = JSON.stringify(SpecificBeatArr);

    localStorage.setItem("StrummingPatternArr", SpecificPattern);
    localStorage.setItem("ModeArr", SpecificModeArr);
    localStorage.setItem("BeatArr", SpecificBeatArr);

    if (isAdvancedMode) {

        let StoreIntensityArr = localStorage.getItem("StoreIntensityArr");
        localStorage.setItem("StoreIntensityArrHold", StoreIntensityArr);

        StoreIntensityArr = await JSON.parse(StoreIntensityArr);
        StoreIntensityArr = Object.values(StoreIntensityArr);

        ChangesDataObject = localStorage.getItem("ChangesDataObject");
        ChangesDataObject = JSON.parse(ChangesDataObject);

        let SpecificPattern = []

        let onceForAdvanced = true

        for (let i = 0; i < SelectedValueArr.length; i++) {

            let DelIndex = 0
            for (let j = 0; j < NumberOfBeatArr.length; j++) {
                if (j < SelectedValueArr[i]) {
                    DelIndex += NumberOfBeatArr[j]
                }

            }
            let DelCount = NumberOfBeatArr[SelectedValueArr[i]]

            let slicedArray = StoreIntensityArr.slice(DelIndex, DelIndex + DelCount);
            SpecificPattern.push(...slicedArray)

            if (onceForAdvanced) {
                ChangesDataObject["IntensityDelIndex"] = DelIndex
                onceForAdvanced = false
            }
        }

        ChangesDataObject["IntensityDelCount"] = SpecificPattern.length

        ChangesDataObject = JSON.stringify(ChangesDataObject);
        localStorage.setItem("ChangesDataObject", ChangesDataObject);

        SpecificPattern = JSON.stringify(SpecificPattern);
        localStorage.setItem("StoreIntensityArr", SpecificPattern);

        AdvancedStrummingPattern()
    } else {

        DisplayStrummingPattern()
    }

    document.getElementById("SectionContainer").style.display = "none"
    DisplayNone("NewSectionBtn")
    DisplayNone("TransposeKeyBtn")

    document.getElementsByClassName("CopyPasteBtn")[0].style.display = "none"
    document.getElementsByClassName("CopyPasteBtn")[1].style.display = "none"
    document.getElementsByClassName("CopyPasteBtn")[2].style.display = "block"

    document.getElementById("Section0").style.display = "inline-block"
    document.getElementById("Section0").innerHTML = SectionName
    IsSplit = true

}

function EditSectionName(currentSectionName) {

    let SectionName = prompt(`Rename of ${currentSectionName}`, currentSectionName)
    if (!SectionName || SectionName == currentSectionName) {
        return
    }

    let SongSectionNames = localStorage.getItem("SongSectionNames")
    SongSectionNames = JSON.parse(SongSectionNames);
    SongSectionNames = Object.values(SongSectionNames);

    if (SongSectionNames.includes(SectionName)) {
        return alert("Section Name will need to be unique")
    }

    let index = SongSectionNames.indexOf(currentSectionName)

    SongSectionNames.splice(index, 1, SectionName)

    SongSectionNames = JSON.stringify(SongSectionNames);
    localStorage.setItem("SongSectionNames", SongSectionNames);

    let tempholdRangeData = localStorage.getItem(currentSectionName)
    localStorage.setItem(SectionName, tempholdRangeData)
    localStorage.removeItem(currentSectionName)

    ShowSectionNameOnBar()
    ShowSectionContents()
}

function DeleteSectionName(currentSectionName) {

    let SongSectionNames = localStorage.getItem("SongSectionNames")
    SongSectionNames = JSON.parse(SongSectionNames);
    SongSectionNames = Object.values(SongSectionNames);

    let index = SongSectionNames.indexOf(currentSectionName)

    SongSectionNames.splice(index, 1)

    SongSectionNames = JSON.stringify(SongSectionNames);
    localStorage.setItem("SongSectionNames", SongSectionNames);

    let SectionName = localStorage.getItem(currentSectionName)
    SectionName = JSON.parse(SectionName);
    SectionName = Object.values(SectionName);
    let id = SectionName[0]
    document.getElementById(`Section${id}`).style.display = "none"

    localStorage.removeItem(currentSectionName)

    ShowSectionContents()
    ShowSectionNameOnBar()
}

function EditSectionRange(currentSectionName) {
    document.getElementById("UpdateSectionRange").style.display = "block"
    document.getElementById("EditRangeP").innerHTML = `${currentSectionName}`

    let SectionName = localStorage.getItem(currentSectionName)
    SectionName = JSON.parse(SectionName);
    SectionName = Object.values(SectionName);

    document.getElementById("UpdateRangeFrom").value = SectionName[0] + 1
    document.getElementById("UpdateRangeTo").value = SectionName[SectionName.length - 1] + 1


}

function UpdateSectionRange() {
    let currentSectionName = document.getElementById("EditRangeP").innerHTML

    let RangeFrom = document.getElementById("UpdateRangeFrom").value
    let RangeTo = document.getElementById("UpdateRangeTo").value

    if (!RangeFrom || !RangeTo) {
        return alert("Please Enter Range to Proceed")
    }

    if (RangeTo > document.querySelectorAll(".pattern-number").length) {
        return alert("Range is Out of Patterns")
    }

    RangeFrom = parseInt(RangeFrom)
    RangeTo = parseInt(RangeTo)

    RangeFrom = RangeFrom - 1
    RangeTo = RangeTo - 1


    if (RangeFrom < 0 || RangeTo < 0) {
        return alert("Please Enter correct Range to Proceed")
    }

    if (RangeFrom > RangeTo) {
        return alert("Start Range must be less than the End Range")
    }


    let SongSectionNames = localStorage.getItem("SongSectionNames")

    if (SongSectionNames) {
        SongSectionNames = JSON.parse(SongSectionNames);
        SongSectionNames = Object.values(SongSectionNames);

        let AllRanges = []
        let RangesObject = []

        for (let i = 0; i < SongSectionNames.length; i++) {
            let SectionName = localStorage.getItem(SongSectionNames[i])
            SectionName = JSON.parse(SectionName);
            SectionName = Object.values(SectionName);
            let CurrentSecNameInLoop = SongSectionNames[i]
            let obj = {}
            obj[CurrentSecNameInLoop] = SectionName;
            RangesObject.push(obj)

            if (SongSectionNames[i] == currentSectionName) {
            } else {
                AllRanges = [...AllRanges, ...SectionName]

                // if (SectionName.includes(parseInt(RangeTo))) {

                //     console.log(RangeTo);
                //     console.log(SongSectionNames[i]);
                //     console.log(SectionName);
                // }
            }


        }

        // console.log(RangesObject);

        if (AllRanges.includes(parseInt(RangeFrom)) || AllRanges.includes(parseInt(RangeTo))) {


            let tempRange = []

            for (let i = RangeFrom; i <= RangeTo; i++) {
                i = parseInt(i)
                tempRange.push(i)
            }

            // console.log(tempRange);

            let SectionName = localStorage.getItem(currentSectionName)
            SectionName = JSON.parse(SectionName);
            SectionName = Object.values(SectionName);

            let DiFferenceRemoveRange = DiFferenceRemove(tempRange, SectionName)

            // console.log(DiFferenceRemoveRange);

            for (let i = 0; i < RangesObject.length; i++) {
                let obj = RangesObject[i]
                let key = Object.keys(obj);
                key = key[0]

                let SectionValue = obj[key]

                let CheckArrcontainAllValue = IsArrcontainAllValue(SectionValue, DiFferenceRemoveRange)
                if (CheckArrcontainAllValue.length != 0) {
                    // let msg = ""
                    // for (let j = 0; j < CheckArrcontainAllValue.length; j++) {
                    //     msg+=`${CheckArrcontainAllValue[i]} `

                    // }

                    let confirmation = confirm(`Chaning the range cause to delete ${key} section.`)

                    if (!confirmation) {
                        return
                    }
                }

            }


            for (let i = 0; i < RangesObject.length; i++) {
                let obj = RangesObject[i]
                let key = Object.keys(obj);
                key = key[0]

                let SectionValue = obj[key]

                for (let j = 0; j < DiFferenceRemoveRange.length; j++) {
                    if (SectionValue.includes(DiFferenceRemoveRange[j])) {

                        let EditSectionName = localStorage.getItem(key)
                        EditSectionName = JSON.parse(EditSectionName);
                        EditSectionName = Object.values(EditSectionName);

                        EditSectionName.splice(EditSectionName.indexOf(DiFferenceRemoveRange[j]), 1)

                        if (EditSectionName.length == 0) {
                            localStorage.removeItem(key)
                            let AllSectionNames = localStorage.getItem("SongSectionNames")
                            AllSectionNames = JSON.parse(AllSectionNames);
                            AllSectionNames = Object.values(AllSectionNames);

                            AllSectionNames.splice(AllSectionNames.indexOf(key), 1)

                            AllSectionNames = JSON.stringify(AllSectionNames);
                            localStorage.setItem("SongSectionNames", AllSectionNames);

                        }

                        EditSectionName = JSON.stringify(EditSectionName);
                        localStorage.setItem(key, EditSectionName);

                        // console.log(key);
                        // console.log(DiFferenceRemoveRange[j]);
                    }

                }


            }


        }

    }

    // return

    let SelectedValueArr = []

    for (let i = RangeFrom; i <= RangeTo; i++) {
        i = parseInt(i)
        SelectedValueArr.push(i)
    }

    // let SectionName = localStorage.getItem(currentSectionName)
    // SectionName = JSON.parse(SectionName);
    // SectionName = Object.values(SectionName);
    // let id = SectionName[0]
    // document.getElementById(`Section${id}`).style.display = "none"

    SelectedValueArr = JSON.stringify(SelectedValueArr);
    localStorage.setItem(currentSectionName, SelectedValueArr);

    document.getElementById("UpdateSectionRange").style.display = "none"


    ShowSectionContents()
    ShowSectionNameOnBar()
}

function DiFferenceRemove(tempRange, SectionName) {
    // Work here send difference arr to fn, and check and delete array ele
    // from different sections
    let output = []
    for (let i = 0; i < tempRange.length; i++) {
        let TempRangleVal = tempRange[i]
        if (!SectionName.includes(TempRangleVal)) {
            output.push(TempRangleVal)
        }

    }

    return output
}

function IsArrcontainAllValue(SectionValue, DiFferenceRemoveRange) {
    let output = []
    for (let i = 0; i < SectionValue.length; i++) {

        if (DiFferenceRemoveRange.includes(SectionValue[i])) {
            output.push(SectionValue[i])
        }

    }

    if (output.length == SectionValue.length) {
        return output
    } else {
        return []
    }

}

function ShowSettingPage() {
    document.getElementById("SettingPage").style.display = "block"
}

function CloseSettingPage() {
    document.getElementById("SettingPage").style.display = "none"

}

function IncrementTransposeKey() {
    let TransposeKeyValue = document.getElementById("TransposeKeyValue").value
    if (TransposeKeyValue >= 11) {
        return
    }
    TransposeKeyValue++
    document.getElementById("TransposeKeyValue").value = TransposeKeyValue

}

function DecrementTransposeKey() {
    let TransposeKeyValue = document.getElementById("TransposeKeyValue").value
    if (TransposeKeyValue <= -11) {
        return
    }
    TransposeKeyValue--
    document.getElementById("TransposeKeyValue").value = TransposeKeyValue

}

function UpdateTransposeKey() {

    ShowToastMsg("Please Wait a while we update the Transpose key.")
    if (localStorage.getItem("Metronome")) {
        document.querySelector('#PlayPauseVideo').click()
    }

    document.getElementById("GenerateVideo").style.display = "inline-block"
    document.getElementById("PlayPauseVideo").style.display = "none"
    document.getElementById("RestartVideo").style.display = "none"
    document.getElementById("StartVideo").style.display = "none"

    let TransposeKeyValue = document.getElementById("TransposeKeyValue").value

    if (!localStorage.getItem("TransposeKey")) {
        localStorage.setItem("TransposeKey", 0)
    }

    let previousKey = localStorage.getItem("TransposeKey")

    if (parseInt(TransposeKeyValue) == parseInt(previousKey)) {
        ShowToastMsg("Change the Transpose Value")
        return
    }

    localStorage.setItem("TransposeKey", TransposeKeyValue)
    GetPatternsBackReal(previousKey)
    TransposePatterns(TransposeKeyValue)

    ShowToastMsg("Transpose Key has been Updated")

}

function GetPatternsBackReal(TransposeKeyValue) {
    TransposeKeyValue = parseInt(TransposeKeyValue)
    let UseTransposeArr = []
    switch (TransposeKeyValue) {
        case 0:
            UseTransposeArr = []
            break;

        case 1:
            UseTransposeArr = [`Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`]
            break;

        case 2:
            UseTransposeArr = [`D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`]
            break;

        case 3:
            UseTransposeArr = [`Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`]
            break;

        case 4:
            UseTransposeArr = [`E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`]
            break;

        case 5:
            UseTransposeArr = [`F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`]
            break;

        case 6:
            UseTransposeArr = [`Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`]
            break;

        case 7:
            UseTransposeArr = [`G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`]
            break;

        case 8:
            UseTransposeArr = [`Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`]
            break;

        case 9:
            UseTransposeArr = [`A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`]
            break;

        case 10:
            UseTransposeArr = [`Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`]
            break;

        case 11:
            UseTransposeArr = [`B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`]
            break;

        case -1:
            UseTransposeArr = [`B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`]
            break;

        case -2:
            UseTransposeArr = [`Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`]
            break;

        case -3:
            UseTransposeArr = [`A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`]
            break;

        case -4:
            UseTransposeArr = [`Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`]
            break;

        case -5:
            UseTransposeArr = [`G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`]
            break;

        case -6:
            UseTransposeArr = [`Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`]
            break;

        case -7:
            UseTransposeArr = [`F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`]
            break;

        case -8:
            UseTransposeArr = [`E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`]
            break;

        case -9:
            UseTransposeArr = [`Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`]
            break;

        case -10:
            UseTransposeArr = [`D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`]
            break;

        case -11:
            UseTransposeArr = [`Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`]
            break;



    }

    if (UseTransposeArr.length == 0) {
        return
    }

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let ChordsName = document.querySelectorAll(".UpdateChord")
    for (let i = 0; i < ChordsName.length; i++) {
        if (ChordsName[i].value != "Empty") {
            if (ChordsName[i].value != "NC-muted") {

                let Transposed = TransposePreviousChordsName(ChordsName[i].value, UseTransposeArr)
                document.querySelectorAll(".UpdateChord")[i].value = Transposed
                StrummingPatternArr[i][1] = Transposed
            }
        }

    }

    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);

}

function TransposePreviousChordsName(ChordName, TransposeArr) {
    let rowArr = [`C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`]
    let AfterChords = ChordName
    let firstTwoChar = ChordName.slice(0, 2)
    let firstOneChar = ChordName.slice(0, 1)
    if (firstTwoChar == "Bb" || firstTwoChar == "Ab" || firstTwoChar == "Db" || firstTwoChar == "Gb" || firstTwoChar == "Eb") {
        ChordName = firstTwoChar
        AfterChords = AfterChords.slice(2, AfterChords.length)

    } else if (TransposeArr.includes(firstOneChar)) {
        ChordName = firstOneChar
        AfterChords = AfterChords.slice(1, AfterChords.length)

    }

    for (let i = 0; i < rowArr.length; i++) {

        if (ChordName == TransposeArr[i]) {

            if (AfterChords == "") {
                return rowArr[i]
            } else {
                return `${rowArr[i]}${AfterChords}`
            }
        }

    }
}

function TransposePatterns(TransposeKeyValue) {
    TransposeKeyValue = parseInt(TransposeKeyValue)
    let UseTransposeArr = []
    switch (TransposeKeyValue) {
        case 0:
            UseTransposeArr = []
            break;

        case 1:
            UseTransposeArr = [`Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`]
            break;

        case 2:
            UseTransposeArr = [`D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`]
            break;

        case 3:
            UseTransposeArr = [`Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`]
            break;

        case 4:
            UseTransposeArr = [`E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`]
            break;

        case 5:
            UseTransposeArr = [`F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`]
            break;

        case 6:
            UseTransposeArr = [`Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`]
            break;

        case 7:
            UseTransposeArr = [`G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`]
            break;

        case 8:
            UseTransposeArr = [`Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`]
            break;

        case 9:
            UseTransposeArr = [`A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`]
            break;

        case 10:
            UseTransposeArr = [`Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`]
            break;

        case 11:
            UseTransposeArr = [`B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`]
            break;

        case -1:
            UseTransposeArr = [`B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`]
            break;

        case -2:
            UseTransposeArr = [`Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`]
            break;

        case -3:
            UseTransposeArr = [`A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`]
            break;

        case -4:
            UseTransposeArr = [`Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`]
            break;

        case -5:
            UseTransposeArr = [`G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`]
            break;

        case -6:
            UseTransposeArr = [`Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`, `F`]
            break;

        case -7:
            UseTransposeArr = [`F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`, `E`]
            break;

        case -8:
            UseTransposeArr = [`E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`, `Eb`]
            break;

        case -9:
            UseTransposeArr = [`Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`, `D`]
            break;

        case -10:
            UseTransposeArr = [`D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`, `Db`]
            break;

        case -11:
            UseTransposeArr = [`Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`, `C`]
            break;



    }

    if (UseTransposeArr.length == 0) {
        $('.select-chords-search').select2();
        return
    }
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");

    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let ChordsName = StrummingPatternArr
    for (let i = 0; i < ChordsName.length; i++) {
        if (ChordsName[i][1] != "Empty") {

            if (ChordsName[i][1] != "NC-muted") {
                let Transposed = TransposeChordsName(ChordsName[i][1], UseTransposeArr)
                ChordsName[i][1] = Transposed
            }
        }

    }

    StrummingPatternArr = ChordsName
    StrummingPatternArr = JSON.stringify(StrummingPatternArr);
    localStorage.setItem("StrummingPatternArr", StrummingPatternArr);

    ShowOnDisplay()
}

function TransposeChordsName(ChordName, TransposeArr) {
    let rowArr = [`C`, `Db`, `D`, `Eb`, `E`, `F`, `Gb`, `G`, `Ab`, `A`, `Bb`, `B`]
    let AfterChords = ChordName
    let firstTwoChar = ChordName.slice(0, 2)
    let firstOneChar = ChordName.slice(0, 1)
    if (firstTwoChar == "Bb" || firstTwoChar == "Ab" || firstTwoChar == "Db" || firstTwoChar == "Gb" || firstTwoChar == "Eb") {
        ChordName = firstTwoChar
        AfterChords = AfterChords.slice(2, AfterChords.length)

    } else if (TransposeArr.includes(firstOneChar)) {
        ChordName = firstOneChar
        AfterChords = AfterChords.slice(1, AfterChords.length)

    }

    for (let i = 0; i < rowArr.length; i++) {

        if (ChordName == rowArr[i]) {

            if (AfterChords == "") {
                return TransposeArr[i]
            } else {
                return `${TransposeArr[i]}${AfterChords}`
            }
        }

    }

}

function TickPatterns() {
    let RangeFrom = document.getElementById("TickRangeFrom").value
    let RangeTo = document.getElementById("TickRangeTo").value

    if (!RangeFrom || !RangeTo) {
        return alert("Please Enter Range to Proceed")
    }

    if (RangeTo > document.querySelectorAll(".pattern-number").length) {
        return alert("Range is Out of Patterns")
    }

    RangeFrom = parseInt(RangeFrom)
    RangeTo = parseInt(RangeTo)

    RangeFrom = RangeFrom - 1
    RangeTo = RangeTo - 1


    if (RangeFrom < 0 || RangeTo < 0) {
        return alert("Please Enter correct Range to Proceed")
    }

    if (RangeFrom > RangeTo) {
        return alert("Start Range must be less than the End Range")
    }


    for (let i = RangeFrom; i < RangeTo + 1; i++) {
        document.querySelectorAll(".SelectBarsCheckBox")[i].checked = true
    }

}

function UnselectAllPatterns() {
    let allSelectPatterns = document.querySelectorAll(".SelectBarsCheckBox")

    for (let i = 0; i < allSelectPatterns.length; i++) {
        document.querySelectorAll(".SelectBarsCheckBox")[i].checked = false

    }
}

function CancelBtnForNewSection() {
    document.getElementById("RangeFrom").value = ""
    document.getElementById("RangeTo").value = ""
    document.getElementById("AddSectionRange").style.display = "none"
}

function CancelBtnForUpdateSection() {
    document.getElementById("UpdateRangeFrom").value = ""
    document.getElementById("UpdateRangeTo").value = ""
    document.getElementById("UpdateSectionRange").style.display = "none"
}

function DisplayNone(id) {
    document.getElementById(id).style.display = "none"
}

function DisplayEle(id, block = "block") {
    document.getElementById(id).style.display = block
}

function ShowToastMsg(msg) {
    Toastify({
        text: msg,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();
}

function TickAllIntensity() {
    let allSelectIntensity = document.querySelectorAll(".SelectIntensityCheckBox")
    for (let i = 0; i < allSelectIntensity.length; i++) {
        document.querySelectorAll(".SelectIntensityCheckBox")[i].checked = true

    }
}

async function PlayBar(BarId) {
    let metronome = document.getElementById("Click1.wav")
    if (!metronome) {
        return alert("Please Generate Video before Playing Section")
    }
    // let SelectedValueArr = localStorage.getItem(SectionName)
    // if (!SelectedValueArr) {
    //     return alert("Something Went Wrong")
    // }

    // SelectedValueArr = await JSON.parse(SelectedValueArr);
    // SelectedValueArr = Object.values(SelectedValueArr);

    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    StrummingPatternArr = await JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let DelIndex = 0
    for (let j = 0; j < NumberOfBeatArr.length; j++) {
        if (j < BarId) {
            DelIndex += NumberOfBeatArr[j]
        }

    }

    InstantStartFrom = [DelIndex, BarId]

    let ele = document.getElementById("InstantPlaySection")
    ele.click();

    document.getElementById("StartVideo").style.display = "none"

    document.getElementById("PlayPauseVideo").style.display = "inline-block"
    document.getElementById("RestartVideo").style.display = "inline-block"

}

async function SyncSongData(){
    try {

        let SongName = CurrentSongData.SongName
        let BPM = localStorage.getItem("BPM")
        let MainValue = localStorage.getItem("TheMainValue")
        let DefaultTimeSign = localStorage.getItem("DefaultTimeSign")
        let TransposeKey = localStorage.getItem("TransposeKey")
        let Metronome = localStorage.getItem("Metronome")
        let TimeSignatureTopValue = localStorage.getItem("TopValue")
        let TimeSignatureBottomValue = localStorage.getItem("BottomValue")
        let StrummingPatterns = localStorage.getItem("StrummingPatternArr")
        let ModeArr = localStorage.getItem("ModeArr")
        let BeatArr = localStorage.getItem("BeatArr")
        let IntensityArr = localStorage.getItem("StoreIntensityArr")
        let AdvancedMode = localStorage.getItem("AdvancedMode")
        let SectionNames = localStorage.getItem("SongSectionNames")
        let SectionNamesValue = ""

        if(SectionNames){
           let SectionNamesArr = SectionNames
           SectionNamesArr = JSON.parse(SectionNamesArr);
           SectionNamesArr = Object.values(SectionNamesArr);

           SectionNamesValue = {}
           SectionNamesArr.forEach(key => {
            const value = localStorage.getItem(key);
            SectionNamesValue[key] = value;
          });

          SectionNamesValue = JSON.stringify(SectionNamesValue)
        }

        let request = await fetch(`${API}/update-song-data`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                SongName, BPM, MainValue, DefaultTimeSign, TransposeKey, Metronome, TimeSignatureTopValue, TimeSignatureBottomValue, StrummingPatterns, ModeArr, BeatArr, IntensityArr, AdvancedMode, SectionNames, SectionNamesValue
            })
        })

        let data = await request.json();

        console.log(data);
    } catch (error) {
     console.log(error);   
    }
}

function SyncSongFromDatabase(){

    let AppChrodsData = localStorage.getItem("AppChrodsData")
    localStorage.clear()
    if(AppChrodsData){
        localStorage.setItem("AppChrodsData", AppChrodsData);
    }

    
    // localStorage.setItem("AdvancedMode", CurrentSongData.AdvancedMode)
    localStorage.setItem("BPM", CurrentSongData.BPM)
    localStorage.setItem("BeatArr", CurrentSongData.BeatArr)
    localStorage.setItem("DefaultTimeSign", CurrentSongData.DefaultTimeSign)
    localStorage.setItem("StoreIntensityArr", CurrentSongData.IntensityArr)
    localStorage.setItem("TheMainValue", CurrentSongData.MainValue)
    localStorage.setItem("Metronome", CurrentSongData.Metronome)
    localStorage.setItem("ModeArr", CurrentSongData.ModeArr)
    localStorage.setItem("SongSectionNames", CurrentSongData.SectionNames)
    localStorage.setItem("StrummingPatternArr", CurrentSongData.StrummingPatterns)
    localStorage.setItem("BottomValue", CurrentSongData.TimeSignatureBottomValue)
    localStorage.setItem("TopValue", CurrentSongData.TimeSignatureTopValue)
    localStorage.setItem("TransposeKey", CurrentSongData.TransposeKey)
    
    let SectionNamesValue = CurrentSongData.SectionNamesValue
    if(!SectionNamesValue){
        return
    }
    SectionNamesValue = JSON.parse(SectionNamesValue)
    
    for (const key in SectionNamesValue) {
        if (SectionNamesValue.hasOwnProperty(key)) {
          const value = SectionNamesValue[key];
          localStorage.setItem(key, value);
        }
    }


}

function PaginationNext(){
    
    if(BarStartFrom>BarHTMLContentArr.length){
        return
    }

    BarStartFrom+=10
    ShowPagintion()
}

function PaginationPrevious(){
    BarStartFrom-=10

    if(BarStartFrom<0){
        BarStartFrom = 0
    }

    ShowPagintion()
}

function ShowPagintion(){
    let DisplayPatternData = document.getElementById("DisplayPatternData")
    let content = ""
    let BarEndTo = BarStartFrom + 10

    let NewAppendHtmlArr = BarHTMLContentArr.slice(BarStartFrom, BarEndTo);

    if(NewAppendHtmlArr.length ==0 || BarStartFrom<0){
        return
    }

    NewAppendHtmlArr.map(function (val, index) {
        content+=val
    })
    
    DisplayPatternData.innerHTML = content

    AutoShowPattern()

    if (showSections) {
        ShowSectionNameOnBar()
    }

    if(AdvancedMode){
        InstensitySetOnDOM()
    }
}

function ShowPagintionBtns(){
    if(BarHTMLContentArr.length>10){
        document.getElementById("PaginationBtns").style.display = "block"
    }
    
}

async function CheckRequiresFilesDownload(){
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let validate = ValidateStrummingPattern(StrummingPatternArr);
    if (validate == "Not Possilbe") {
        return 
    }

    let ChordsVideoArr = []
    let StoreIntensityArr = localStorage.getItem("StoreIntensityArr");
    // console.log(StoreIntensityArr);
    // if (!StoreIntensityArr) {
    //     document.getElementById("loading").style.display = "none"
    //     return
    // }
    
        if(isAdvancedMode){
            console.log(`Adva`);
            StoreIntensityArr = JSON.parse(StoreIntensityArr);
            StoreIntensityArr = Object.values(StoreIntensityArr);
        }else{
            StoreIntensityArr = IntensityForDefaultMode()
        }
    // console.log(StoreIntensityArr);

    if(!localStorage.getItem("StrummingPatternArrHold")){
        await SyncSongData();
    }

    let count = 0
    let CurrentChordValue, PreviousChordValue
    AudioIntensity = []

    StrummingPatternArr.map((e) => {
        CurrentChordValue = e[1]

        if (e[1] != "Empty") {
            ChordsVideoArr.push(`${e[1]}`)

            if (CurrentChordValue != "NC-muted") {
                PreviousChordValue = CurrentChordValue
            }

        }

        if (CurrentChordValue == "Empty") {
            CurrentChordValue = PreviousChordValue
        }

        if (e[0] == "E") {
            AudioIntensity.push(`E`)
            count++
        } else {

            let IntensityValue = StoreIntensityArr[count]

            if (IntensityValue == "muted-full" || IntensityValue == "muted-half") {

                AudioIntensity.push(`${CurrentChordValue}-${IntensityValue}.wav`)
                count++
            } else if (IntensityValue == "NC") {
                if (e[0] == "U") {

                    AudioIntensity.push(`NC-muted-default-up.wav`)
                } else {
                    AudioIntensity.push(`NC-muted-default-down.wav`)

                }
                count++
            } else {
                if (e[0] == "U") {

                    AudioIntensity.push(`${CurrentChordValue}-${IntensityValue}-up.wav`)
                    count++

                } else {
                    AudioIntensity.push(`${CurrentChordValue}-${IntensityValue}-down.wav`)
                    count++
                }
            }

        }

    });

    let getChrodsFilesArr = await fetch(`${API}/getChordsDataPremium`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "ChordsAudioArray": AudioIntensity,
            "ChordsVideoArray": ChordsVideoArr,
            "ChordsVideoType": VideoType
        })
    })
    getChrodsFilesArr = await getChrodsFilesArr.json();

    let AudioArr = getChrodsFilesArr.ChordsAudioArray;
    let VideoArr = getChrodsFilesArr.ChordsVideoArray;

    console.log(VideoArr);

    await StroeAudioFilesOnly(AudioArr)
}

async function StroeAudioFilesOnly(AudioArr) {

    let StoredFilesArr = localStorage.getItem("AppChrodsData")
    if (StoredFilesArr) {
        StoredFilesArr = JSON.parse(StoredFilesArr);
        StoredFilesArr = Object.values(StoredFilesArr);
    } else {
        StoredFilesArr = []
    }

    AudioArr.push("Click1.wav")
    AudioArr.push("Click2.wav")

    var date = new Date();
    let ID = `${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}`
    for (let i = 0; i < AudioArr.length; i++) {
        if (!StoredFilesArr.includes(AudioArr[i])) {

            let response = await fetch(`${API}/files/${ID}/${AudioArr[i]}`)
            let data = await response.blob()
        }
    }


    for (let i = 0; i < AudioArr.length; i++) {
        if (!StoredFilesArr.includes(AudioArr[i])) {

            let response = await fetch(`${API}/DownloadFiles/${ID}/${AudioArr[i]}`)
            let data = await response.blob()

            const url = URL.createObjectURL(data);

            let Saved = await InsertFileToDB(data, AudioArr[i], "audio/wav")
            if (Saved != "Error") {

                StoredFilesArr.push(AudioArr[i])
            }

        }
    }


    StoredFilesArr = JSON.stringify(StoredFilesArr);
    localStorage.setItem("AppChrodsData", StoredFilesArr);

    let response = await fetch(`${API}/delete/${ID}`)
    let data = await response.text()
    console.log(data);
}

async function PreviewAudioOnly() {
    PreviewAudioPlay = true
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);

    let validate = ValidateStrummingPattern(StrummingPatternArr);
    if (validate == "Not Possilbe") {
        return alert(`Can't update due to some wrong Pattern`);
    }

    let logo = document.getElementById("loading-image");
    logo.src = logo.getAttribute("src")
    document.getElementById("loading").style.display = "block"

    if(!localStorage.getItem("StrummingPatternArrHold")){
        await SyncSongData();
    }


    document.getElementById("AudioSecion").innerHTML = ""
    document.getElementById("ChordVideoSection").innerHTML = ""
    document.getElementById("ChordHandVideoSection").innerHTML = ""
    document.getElementById("DiagramsContainer").innerHTML = ""

    let ChordsVideoArr = []
    let StoreIntensityArr = localStorage.getItem("StoreIntensityArr");

    // if (!StoreIntensityArr) {
    // document.getElementById("loading").style.display = "none"
    // return
    // }

    if(isAdvancedMode){
        console.log(`Adva`);
        StoreIntensityArr = JSON.parse(StoreIntensityArr);
        StoreIntensityArr = Object.values(StoreIntensityArr);
    }else{
        StoreIntensityArr = IntensityForDefaultMode()
    }

    let count = 0
    let CurrentChordValue, PreviousChordValue
    AudioIntensity = []
    StrummingPatternArr.map((e) => {
        CurrentChordValue = e[1]

        if (e[1] != "Empty") {
            ChordsVideoArr.push(`${e[1]}`)

            if (CurrentChordValue != "NC-muted") {
                PreviousChordValue = CurrentChordValue
            }

        }

        if (CurrentChordValue == "Empty") {
            CurrentChordValue = PreviousChordValue
        }

        if (e[0] == "E") {
            AudioIntensity.push(`E`)
            count++
        } else {

            let IntensityValue = StoreIntensityArr[count]

            if (IntensityValue == "muted-full" || IntensityValue == "muted-half") {

                AudioIntensity.push(`${CurrentChordValue}-${IntensityValue}.wav`)
                count++
            } else if (IntensityValue == "NC") {
                if (e[0] == "U") {

                    AudioIntensity.push(`NC-muted-default-up.wav`)
                } else {
                    AudioIntensity.push(`NC-muted-default-down.wav`)

                }
                count++
            } else {
                if (e[0] == "U") {

                    AudioIntensity.push(`${CurrentChordValue}-${IntensityValue}-up.wav`)
                    count++

                } else {
                    AudioIntensity.push(`${CurrentChordValue}-${IntensityValue}-down.wav`)
                    count++
                }
            }

        }

    });

    console.log(AudioIntensity);
    // console.log(ChordsVideoArr);

    // let DiagramsArr = []
    // ChordsVideoArr.map((e) => {
    //     DiagramsArr.push(`${e}.png`)
    // })

    // DiagramsArr = removeDuplicates(DiagramsArr)
    let getChrodsFilesArr = await fetch(`${API}/getChordsDataPremium`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "ChordsAudioArray": AudioIntensity,
            "ChordsVideoArray": ChordsVideoArr,
            "ChordsVideoType": VideoType
        })
    })
    getChrodsFilesArr = await getChrodsFilesArr.json();

    let AudioArr = getChrodsFilesArr.ChordsAudioArray;
    let VideoArr = getChrodsFilesArr.ChordsVideoArray;

    console.log(AudioArr);
    console.log(VideoArr);

    await StroeAudioFilesOnly(AudioArr)
    await SetAudioFilesToDisplay(AudioArr)

    console.log(`Ready to preview Audio`);

    document.getElementById("GenerateVideo").innerHTML = "Update Video"
    document.getElementById("GenerateVideo").style.display = "none"
    document.getElementById("loading").style.display = "none"
    IntensityArr = []
    if (isAdvancedMode) {
        // document.getElementById("AdvancedMode").style.display = "none"
    }
    document.getElementById("StartVideo").style.display = "inline-block"

}

async function SetAudioFilesToDisplay(AudioArr) {
    AudioArr.push("Click1.wav")
    AudioArr.push("Click2.wav")

    // For Audio
    for (let i = 0; i < AudioArr.length; i++) {

        const url = await FetchFileFromDB(AudioArr[i])
        let container = document.getElementById("AudioSecion");
        container.innerHTML += `<audio src="${url}" id="${AudioArr[i]}"></audio>`
    }

}

function roundToNextTen(num) {
    return Math.ceil(num / 10) * 10;
  }

function IntensityForDefaultMode(){
    let StrummingPatternArr = localStorage.getItem("StrummingPatternArr");
        
    StrummingPatternArr = JSON.parse(StrummingPatternArr);
    StrummingPatternArr = Object.values(StrummingPatternArr);
    let StoreIntensityArr = []

    for (let i = 0; i < StrummingPatternArr.length; i++) {
        if(StrummingPatternArr[i][0]=="E"){
            StoreIntensityArr.push("NoIntensity")
        }else{
            StoreIntensityArr.push("default")
        }
    }

    return StoreIntensityArr
}



// $('.select-chords-search').on('select2:open', function (e) {
//     // let ele = e.currentTarget
    
//     // ele.scrollTop = 1
//     console.log(e);
//   });