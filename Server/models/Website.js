const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true,
    }
})

const Website = mongoose.model('Website', websiteSchema);
module.exports = Website;