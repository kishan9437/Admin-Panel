const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema
const error400WebsiteSchema = new Schema({
  website_url: { type: String, required: true },
  status_code: { type: Number, required: true },
  error_message: { type: String }, // Optional: might not always have an error message
  timestamp: { type: Date, default: Date.now }, // Automatically set current timestamp
  error_type: { 
    type: String, 
    enum: ['Bad Request', 'Unauthorized', 'Forbidden', 'Not Found', 'Other'], 
    required: true 
  },
  response_body: { type: String }, // Optional: if you want to capture the response body
  retry_attempts: { type: Number, default: 0 }, // Optional: track retry attempts
  resolved: { type: Boolean, default: false }, // Default to unresolved
  resolved_at: { type: Date } // Optional: track when the issue was resolved
});

// Create and export the model
const Error400Website = mongoose.model('Error400Website', error400WebsiteSchema);
module.exports = Error400Website;
