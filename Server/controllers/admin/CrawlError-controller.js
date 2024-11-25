const CrawlError = require('../../models/crawlError')
const mongoose = require('mongoose');

const addCrawlError = async (req, res) => {
    try {
        const newCrawlError = new CrawlError(req.body);
        const savedCrawlError = await newCrawlError.save();
        res.status(200).json({
            success: true,
            message: 'CrawlError added successfully',
            items: savedCrawlError
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding CrawlError", error });
    }
}

const getCrawlError = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';

        const filter = {
            $or:[
                ...(mongoose.Types.ObjectId.isValid(search) ? [{ website_id: search}]: []),
                { url: new RegExp(search, 'i') },
                { source_url: new RegExp(search, 'i') },
                { error_message: new RegExp(search, 'i') },
                { error_type: new RegExp(search, 'i') },
            ] 
        }

        const skip = (page - 1) * limit;
        const totalCrawlError = await CrawlError.countDocuments(filter);

        const crawlError = await CrawlError.find(filter).skip(skip).limit(limit);
        res.status(200).json({
            success: true,
            items: crawlError,
            totalCrawlError,
            page,
            totalPages: Math.ceil(totalCrawlError / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
}

const deleteCrawlError = async (req, res) => {
    const { id } = req.params;
    try {
        const crawlErrorDelete = await CrawlError.findByIdAndDelete(id);
        if (!crawlErrorDelete) {
            return res.status(404).json({ message: "CrawlError not found" });
        }
        res.status(200).json({
            success: true,
            message: "data deleted successfully"
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { addCrawlError, getCrawlError, deleteCrawlError };