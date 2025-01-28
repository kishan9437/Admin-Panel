const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const websiteurlSchema = new Schema({
    website_id: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
    url_hash: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    headers: { type: Object },
    last_render_at: { type: Date },
    created_at: { type: Date, default: Date.now },
    deleted_at: { type: Date },
    status: { type: String, enum: ['Pending', 'Rendered', 'Inactive'], default: 'Pending' },
    status_code: { type: Number },  
    depth: { type: Number, default: 0 },
    parent_url: { type: String },
    is_archived: { type: Boolean, default: false }
});

const WebsiteUrl = mongoose.model('WebsiteUrl', websiteurlSchema);

module.exports = WebsiteUrl;