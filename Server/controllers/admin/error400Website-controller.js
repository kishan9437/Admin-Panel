const Error400Website = require('../../models/error400Website')

const addError400Website = async (req, res) => {
    try {
        const newError400Website = new Error400Website(req.body);
        const savedError400Website = await newError400Website.save();
        res.status(200).json({
            success: true,
            message: 'Error400Website added successfully',
            items: savedError400Website
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding savedError400Website", error });
    }
}

const getError400website = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const totalError400Website = await Error400Website.countDocuments();

        const error400Website = await Error400Website.find({}).skip(skip).limit(limit);
        res.status(200).json({
            success: true,
            items: error400Website,
            totalError400Website,
            page,
            totalPages: Math.ceil(totalError400Website / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
}

const deleteError400website = async (req, res) => {
    const { id } = req.params;
    try {
        const error400Website = await Error400Website.findByIdAndDelete(id);
        if (!error400Website) {
            return res.status(404).json({ message: "error400Website not found" });
        }
        res.status(200).json({
            success: true,
            message: "data deleted successfully"
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { addError400Website, getError400website, deleteError400website }