const mongoose = require('mongoose');

const SongData = mongoose.model('SongData', {
    UID: { type: String },
    SongName: { type: String },
    BPM: { type: String },
    MainValue: { type: String },
    DefaultTimeSign: { type: String },
    TransposeKey: { type: String },
    Metronome: { type: String },
    TimeSignatureTopValue: { type: String },
    TimeSignatureBottomValue: { type: String },
    StrummingPatterns: { type: String },
    ModeArr: { type: String },
    BeatArr: { type: String },
    IntensityArr: { type: String },
    AdvancedMode: { type: String },
    SectionNames: { type: String },
    SectionNamesValue: { type: String },
});

module.exports = SongData