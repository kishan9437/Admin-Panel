const mongoose = require('mongoose');
const { Schema } = mongoose;

const error400WebsiteSchema = new Schema({
  website_url: { type: String, required: true },
  website_id: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
  status_code: { type: Number, required: true },
  error_message: { type: String }, 
  timestamp: { type: Date, default: Date.now }, 
  error_type: { 
    type: String, 
    enum: ['Bad Request', 'Unauthorized', 'Forbidden', 'Not Found', 'Other'], 
    required: true 
  },
  response_body: { type: String }, 
  retry_attempts: { type: Number, default: 0 }, 
  resolved: { type: Boolean, default: false }, 
  resolved_at: { type: Date } 
});

const Error400Website = mongoose.model('Error400Website', error400WebsiteSchema);
module.exports = Error400Website;
