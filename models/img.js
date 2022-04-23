const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const img_Schema = new Schema({
    image: {
        description: String,
        data: Buffer,
        contentType: String
    }
});


module.exports = mongoose.model('images', img_Schema);