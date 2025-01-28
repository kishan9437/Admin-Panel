const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const prerenderActivitySchema = new Schema({
    url_id: { type: Schema.Types.ObjectId, ref: 'WebsiteUrl', required: true },
    last_render_at: { type: Date },
    page_size: { type: Number },
    status: { type: String, enum: ['Pending', 'Rendered', 'Inactive'], default: 'Pending' },
    status_code: { type: Number },
    error: { type: String },
}, { timestamps: true });

const PrerenderActivity = mongoose.model('Activity', prerenderActivitySchema);

module.exports = PrerenderActivity;