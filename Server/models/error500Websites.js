const mongoose = require('mongoose');
const { Schema } = mongoose;

const error500WebsiteSchema = new Schema({
  website_url: { type: String, required: true },
  website_id: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
  status_code: { type: Number, required: true },
  error_message: { type: String }, // Optional
  timestamp: { type: Date, default: Date.now },
  error_type: {
    type: String,
    enum: ['Internal Server Error', 'Bad Gateway', 'Service Unavailable', 'Other'],
    required: false
  },
  stack_trace: { type: String }, // Optional
  retry_attempts: { type: Number, default: 0 }, // Optional
  resolved: { type: Boolean, default: false }, // Default to unresolved
  resolved_at: { type: Date } // Optional
});

// Create a model from the schema
const Error500Website = mongoose.model('Error500Website', error500WebsiteSchema);

module.exports = Error500Website;
