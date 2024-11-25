const Website = require('../../models/Website');
const WebsiteUrl = require('../../models/WebsiteUrl')
const mongoose = require('mongoose');

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
        const sortOrder = req.query.order === "desc" ? -1 : 1;

        const search = req.query.search || "";

        const filter =
        {
            $or: [
                // { _id: new RegExp(search, 'i') },
                // ...(mongoose.Types.ObjectId.isValid(search) ? [{ _id: search }] : []),
                { name: new RegExp(search, 'i') },
                { url: new RegExp(search, 'i') },
                { access_key: new RegExp(search, 'i') },
                { status: new RegExp(search, 'i') },
            ]
        }
        const totalWebsites = await Website.countDocuments(filter);  // Total count of documents
        const websites = await Website.find(filter)
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

const getWebsiteId = async (req, res) => {
    const { website_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';

    try {
        const website = await Website.findById(website_id);
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }
        const skip = (page - 1) * limit;

        const filter = {
            website_id: website_id,
            $or: [
                // {website_id : new RegExp(search, 'i')},
                ...(mongoose.Types.ObjectId.isValid(search) ? [{ website_id: search}]: []),
                { url: new RegExp(search, 'i') },
                { status: new RegExp(search, 'i') },
                ...(Number.isInteger(Number(search)) ? [{ status_code: Number(search) }] : []),
                ...(Number.isInteger(Number(search)) ? [{ depth: Number(search) }] : []),
                { parent_url: new RegExp(search, 'i') },
                ...(search === 'true' || search === 'false' ? [{ is_archived: search === 'true' }] : [])
            ]
        }

        const websiteUrls = await WebsiteUrl.find(filter).skip(skip).limit(limit);

        const totalUrls = await WebsiteUrl.countDocuments(filter);

        res.json({
            urls: websiteUrls,
            totalPages: Math.ceil(totalUrls / limit),
            currentPage: page,
            totalItems: totalUrls,
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
module.exports = { addWebsite, getAllWebsites, getUrls, getWebsiteId, getWebsiteById, updateWebsite, deleteWebsite };