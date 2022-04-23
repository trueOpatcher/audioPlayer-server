const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mp3_Schema = new Schema({
    trackName: {
        type: String,
        required: true
    },
    
    userName: {
        type: String,
        required: true
    },
    trackID: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },

    title: String,
    
    artist: String,

    album: String,

    genre: [String],

    year: Number,

    bitrate: Number,

    imageID: String
    
});




module.exports = mongoose.model('sharedMp3', mp3_Schema);