const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true,
    },
    access_key: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Complete', 'Error', 'Active', 'Inactive'], default: 'Pending' }
})

const Website = mongoose.model('Website', websiteSchema);
module.exports = Website;