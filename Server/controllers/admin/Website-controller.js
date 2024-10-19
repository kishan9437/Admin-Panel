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
        const websites = await Website.find({});
        res.status(200).json({
            success: true,
            items: websites
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