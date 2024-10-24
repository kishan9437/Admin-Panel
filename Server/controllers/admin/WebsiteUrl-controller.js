const WebsiteUrl = require('../../models/WebsiteUrl');

const addWebsiteUrl = async (req, res) => {
    try {
        const newWebsiteUrl = new WebsiteUrl(req.body);
        const savedWebsiteUrl = await newWebsiteUrl.save();
        res.status(200).json({
            success: true,
            message: 'Website URL added successfully',
            savedWebsiteUrl
        });
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

const getWebsiteUrls = async (req, res) => {
    try {
        const websiteUrls = await WebsiteUrl.find();
        res.status(200).json({
            success: true,
            data: websiteUrls
        });
    } catch (error) {
        res.status(500).json({message: "Error fetching data",error});
    }
}

module.exports = { addWebsiteUrl ,getWebsiteUrls };