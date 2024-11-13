const CrawlSession = require('../../models/crawlSession')

const addCrawlSession = async (req, res) => {
    try {
        const newCrawlSession = new CrawlSession(req.body);
        const savedCrawlSession = await newCrawlSession.save();
        res.status(200).json({
            success: true,
            message: 'CrawlSession added successfully',
            items: savedCrawlSession
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding savedCrawlSession", error });
    }
}

const getCrawlSession = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const totalCrawlSession = await CrawlSession.countDocuments();

        const crawlSession = await CrawlSession.find({}).skip(skip).limit(limit);
        res.status(200).json({
            success: true,
            items: crawlSession,
            totalCrawlSession,
            page,
            totalPages: Math.ceil(totalCrawlSession / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
}

const deleteCrawlSession = async (req, res) => {
    const { id } = req.params;
    try {
        const crawlSession = await CrawlSession.findByIdAndDelete(id);
        if (!crawlSession) {
            return res.status(404).json({ message: "CrawlSession not found" });
        }
        res.status(200).json({
            success: true,
            message: "data deleted successfully"
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { addCrawlSession,getCrawlSession,deleteCrawlSession }