const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the CrawlSession schema
const CrawlSessionSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true }, // Automatically generated ObjectId
  website_id: { type: Schema.Types.ObjectId, ref: 'Website', required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Active', 'Stopped', 'Completed'], 
    default: 'Pending'  
  },
  start_time: { type: Date, default: Date.now },
  last_updated_time: { type: Date, default: Date.now },
  crawl_depth: { type: Number, default: 0 }
});

// Create and export the CrawlSession model
const CrawlSession = mongoose.model('CrawlSession', CrawlSessionSchema);
module.exports = CrawlSession;
