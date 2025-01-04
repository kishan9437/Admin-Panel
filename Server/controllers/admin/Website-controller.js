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
        const statusFilter = req.query.status;
        const filter = {
            $and: [
                {
                    $or: [
                        // { _id: new RegExp(search, 'i') },
                        // ...(mongoose.Types.ObjectId.isValid(search) ? [{ _id: search }] : []),
                        { name: new RegExp(search, 'i') },
                        { url: new RegExp(search, 'i') },
                        { access_key: new RegExp(search, 'i') },
                        { status: new RegExp(search, 'i') },
                    ]
                },
                ...(statusFilter ? [{ status: statusFilter }] : []),
            ]
        };

        const totalWebsites = await Website.countDocuments(filter);  // Total count of documents
        const websites = await Website.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ name: sortOrder });

        const websiteIds = websites.map(website => website._id)
        const urltotal = await WebsiteUrl.aggregate([
            { $match: { website_id: { $in: websiteIds } } },
            { $group: { _id: "$website_id", totalUrls: { $sum: 1 } } }
        ])
        
        const items = websites.map(website => {
            const totalurl = urltotal.find(t => String(t._id) === String(website._id)) || {};
            
            return {
                id: website._id,
                name: website.name,
                url: website.url,
                access_key: website.access_key,
                status: website.status,
                totalurls: totalurl.totalUrls,
            }
        })

        res.status(200).json({
            success: true,
            websites: items,
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
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status;
    const sortOrder = req.query.order === "desc" ? -1 : 1;

    try {
        if (!mongoose.Types.ObjectId.isValid(website_id)) {
            return res.status(400).json({ message: 'Invalid website_id format' });
        }

        const website = await Website.findById(website_id);
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }
        const skip = (page - 1) * limit;

        const filter = {
            website_id,
            ...(statusFilter && { status: statusFilter }),

            $or: [
                // {website_id : new RegExp(search, 'i')},
                ...(mongoose.Types.ObjectId.isValid(search) ? [{ website_id: search }] : []),
                { url: new RegExp(search, 'i') },
                { status: new RegExp(search, 'i') },
                ...(Number.isInteger(Number(search)) ? [{ status_code: Number(search) }] : []),
                ...(Number.isInteger(Number(search)) ? [{ depth: Number(search) }] : []),
                { parent_url: new RegExp(search, 'i') },
                ...(search === 'true' || search === 'false' ? [{ is_archived: search === 'true' }] : [])
            ],
        }

        const websiteUrls = await WebsiteUrl.find(filter).skip(skip).limit(limit).sort({ status_code: sortOrder });

        const totalUrls = await WebsiteUrl.countDocuments(filter);

        res.json({
            data: websiteUrls,
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