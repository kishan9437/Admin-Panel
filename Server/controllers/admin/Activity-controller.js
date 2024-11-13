const PrerenderActivity = require('../../models/Activity')
const WebsiteUrl = require('../../models/WebsiteUrl');

const addActivity = async (req, res) => {
    try {
        const newActivity = new PrerenderActivity(req.body);
        const savedActivity = await newActivity.save();
        res.status(200).json({
            success: true,
            message: 'Activity added successfully',
            items:savedActivity
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding activity", error });
    }
}

const getActivity = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const totalActivity = await PrerenderActivity.countDocuments();  

        const activity = await PrerenderActivity.find({}).skip(skip).limit(limit);
        res.status(200).json({
            success: true,
            items: activity,
            totalActivity,
            page,
            totalPages: Math.ceil(totalActivity / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
}

const deleteActivity = async (req, res) => {
    const { id } = req.params;
    try {
        const activityDelete = await PrerenderActivity.findByIdAndDelete(id);
        if (!activityDelete) {
            return res.status(404).json({ message: "Activity not found" });
        }
        res.status(200).json({
            success: true,
            message: "data deleted successfully"
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
module.exports = { addActivity , getActivity,deleteActivity };