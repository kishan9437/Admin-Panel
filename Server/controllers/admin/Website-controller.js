const Website = require('../../models/Website');
const WebsiteUrl = require('../../models/WebsiteUrl')

const addWebsite = async (req, res) => {
    const { name, url } = req.body;
    const generateAccessKey = () => Math.random().toString(36).substr(2, 16);
    try {
        const website = new Website({ 
            name, 
            url,
            access_key: generateAccessKey() 
        });
        const savedWebsite = await website.save();
        res.status(200).json({
            success: true,
            message: "Website added successfully",
            websites: savedWebsite
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

const getAllWebsites = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const totalWebsites = await Website.countDocuments();  // Total count of documents

        const sortOrder = req.query.order === "desc" ? -1 : 1;

        const websites = await Website.find({})
            .skip(skip)
            .limit(limit)
            .sort({ name: sortOrder });

        res.status(200).json({
            success: true,
            websites,
            totalWebsites,
            page,
            totalPages: Math.ceil(totalWebsites / limit),
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

const getUrls = async (req, res) => {
    try {
        const websiteUrls = await Website.find({});
        res.status(200).json({
            success: true,
            data: websiteUrls
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

const getWebsiteId=async (req, res) => {
    const { website_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    try {
        const website = await Website.findById(website_id);
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }
        const skip = (page - 1) * limit;

        const websiteUrls = await WebsiteUrl.find({ website_id: website_id }).skip(skip).limit(limit);

        const totalUrls = await WebsiteUrl.countDocuments({ website_id: website_id });

        res.json({
            urls: websiteUrls,
            totalPages : Math.ceil(totalUrls / limit),
            currentPage : page,
            totalItems : totalUrls,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}
const getWebsiteById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const website = await Website.findById(id);
        if (!website) {
            return res.status(404).json({ message: "Website not found" });
        }
        res.status(200).json({
            success: true,
            data: website
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
const updateWebsite = async (req, res) => {
    const { id } = req.params;
    const { name, url } = req.body;
    try {
        const updatedWebsite = await Website.findByIdAndUpdate(id, { $set: { name, url } }, { new: true });

        if (!updatedWebsite) {
            return res.status(404).json({ message: "Website not found" });
        }
        res.status(200).json({
            success: true,
            message: "Website updated successfully",
            data: updatedWebsite
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

const deleteWebsite = async (req, res) => {
    const { id } = req.params;
    try {
        const websiteDelete = await Website.findByIdAndDelete(id);
        if (!websiteDelete) {
            return res.status(404).json({ message: "Website not found" });
        }
        res.status(200).json({
            success: true,
            message: "data deleted successfully"
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
module.exports = { addWebsite, getAllWebsites,getUrls,getWebsiteId, getWebsiteById, updateWebsite, deleteWebsite };