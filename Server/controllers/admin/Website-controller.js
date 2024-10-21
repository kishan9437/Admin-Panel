const Website = require('../../models/Website')

const addWebsite = async (req,res) => {
    const {name,url} = req.body;
    try {
        const website = new Website({name,url});
        const savedWebsite=await website.save();
        res.status(200).json({
             success: true,
             message: "Website added successfully",
             items: savedWebsite
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

const getAllWebsites = async (req,res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const limit = parseInt(req.params.limit) || 5;
        const skip = (page - 1) * limit;
        const totalWebsite = await Website.countDocuments()

        const sortOrder = req.query.order === 'desc' ? -1 : 1;
        const users = await Website.find({})
            .sort({name: sortOrder})
            .skip(skip)
            .limit(limit)

        const totalPages = Math.ceil(totalWebsite / limit);
        res.status(200).json({
            users,
            currentPage: page,
            totalPages,
            totalWebsite
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

const updateWebsite = async (req,res) => {
    const {id} = req.params;
    const {name, url} = req.body;
    try {
        const updatedWebsite = await Website.findByIdAndUpdate(id, {$set: {name, url}}, {new: true});

        if (!updatedWebsite) {
            return res.status(404).json({message: "Website not found"});
        }
        res.status(200).json({
            success: true,
            message: "Website updated successfully",
            data: updatedWebsite
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
}

const deleteWebsite = async (req,res) => {
    const {id} = req.params;
    try {
        const websiteDelete = await Website.findByIdAndDelete(id);
        if (!websiteDelete) {
            return res.status(404).json({message: "Website not found"});
        }
        res.status(200).json({
            success: true,
            message: "Website deleted successfully"
        })
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}
module.exports = {addWebsite,getAllWebsites,updateWebsite,deleteWebsite};