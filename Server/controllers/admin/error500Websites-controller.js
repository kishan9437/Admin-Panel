const Error500Website = require('../../models/error500Websites')
const mongoose = require('mongoose');

const addError500Website = async (req, res) => {
    try {
        const newError500Website = new Error500Website(req.body);
        const savedError500Website = await newError500Website.save();
        res.status(200).json({
            success: true,
            message: 'Error500Website added successfully',
            items: savedError500Website
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding savedError500Website", error });
    }
}

const getError500website = async (req, res) => {
    try {
        // const page = parseInt(req.query.page) || 1;
        // const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';

        const filter = {
            $or:[
                ...(mongoose.Types.ObjectId.isValid(search) ? [{ website_id: search}]: []),
                { website_url: new RegExp(search, 'i') },
                { error_message: new RegExp(search, 'i') },
                { error_type: new RegExp(search,'i')},
                ...(Number.isInteger(Number(search)) ? [{ status_code: search }] : []),
                ...(Number.isInteger(Number(search)) ? [{ retry_attempts: search }] : [])
            ] 
        }

        // const skip = (page - 1) * limit;
        // const totalError500Website = await Error500Website.countDocuments(filter);

        const error500Website = await Error500Website.find(filter)
        res.status(200).json({
            success: true,
            items: error500Website,
            // totalError500Website,
            // page,
            // totalPages: Math.ceil(totalError500Website / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
}

const deleteError500website = async (req, res) => {
    const { id } = req.params;
    try {
        const error500Website = await Error500Website.findByIdAndDelete(id);
        if (!error500Website) {
            return res.status(404).json({ message: "error500Website not found" });
        }
        res.status(200).json({
            success: true,
            message: "data deleted successfully"
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {addError500Website,getError500website,deleteError500website}