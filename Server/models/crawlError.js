const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const crawlErrorSchema = new Schema({
    website_id: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
    url: { type: String, required: true },
    source_url: { type: String, required: true },
    error_message: { type: String, required: true },
    error_type: { type: String, enum: ['rendering', 'validation', 'other'], default: 'other' },
    created_at: { type: Date, default: Date.now }
});

const CrawlError = mongoose.model('CrawlError', crawlErrorSchema);

module.exports = CrawlError;