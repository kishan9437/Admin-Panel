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
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', details: error.errors });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
}

const getWebsiteUrls = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const totalWebsitesUrl = await WebsiteUrl.countDocuments();  

        const websiteUrls = await WebsiteUrl.find({}).skip(skip).limit(limit);
        res.status(200).json({
            success: true,
            data: websiteUrls,
            totalWebsitesUrl,
            page,
            totalPages: Math.ceil(totalWebsitesUrl / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
}

const deleteWebsiteUrls = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteWebsiteUrl = await WebsiteUrl.findByIdAndDelete(id);

        if (!deleteWebsiteUrl) {
            return res.status(404).json({ message: "Website URL not found" });
        }
        res.status(200).json({
            success: true,
            message: "Website URL deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting data", error });
    }
}

const getWebsiteUrlById = async (req,res) => {
    const {id} = req.params;
    try {
        const websiteUrl = await WebsiteUrl.findById(id);
        if (!websiteUrl) {
            return res.status(404).json({message: "Website Url not found"});
        }
        res.status(200).json({
            success: true,
            data: websiteUrl
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

const updateWebsiteUrl = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updateWebsiteUrl = await WebsiteUrl.findByIdAndUpdate(id, updateData,{
            new : true,
            runValidators: true,
        })

        if (!updateWebsiteUrl) {
            return res.status(404).json({ message: "Website URL not found" });
        }
        res.status(200).json({
            success: true,
            message: "Website URL updated successfully",
            updateWebsiteUrl
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating data", error});
    }
}
module.exports = { addWebsiteUrl, getWebsiteUrls, deleteWebsiteUrls,updateWebsiteUrl,getWebsiteUrlById};