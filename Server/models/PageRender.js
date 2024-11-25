const mongoose = require('mongoose');

const PageRenderSchema = new mongoose.Schema({
    pageName: { type: String, required: true },
    isRendered: { type: Boolean, default: false },
    renderDate: { type: Date, default: Date.now },
});

const PageRender = mongoose.model('PageRender', PageRenderSchema);

module.exports = PageRender;