const PrerenderActivity = require('../../models/Activity')
const WebsiteUrl = require('../../models/WebsiteUrl');
const mongoose = require('mongoose');

const addActivity = async (req, res) => {
    try {
        const newActivity = new PrerenderActivity(req.body);
        const savedActivity = await newActivity.save();
        res.status(200).json({
            success: true,
            message: 'Activity added successfully',
            items: savedActivity
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding activity", error });
    }
}

const getActivity = async (req, res) => {
    try {
        const { id, startDate, endDate } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';
        const sortOrder = req.query.order === "desc" ? -1 : 1;
        const statusFilter = req.query.status;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid URL ID format' });
        }

        const filter = {
            $and: [
                { url_id: id },
                ...(search
                    ? [
                        {
                            $or: [
                                ...(mongoose.Types.ObjectId.isValid(search)
                                    ? [{ url_id: search }]
                                    : []),
                                { status: new RegExp(search, 'i') },
                                { error: new RegExp(search, 'i') },
                                ...(Number.isInteger(Number(search))
                                    ? [{ page_size: parseInt(search, 10) }]
                                    : []),
                            ],
                        },
                    ]
                    : []),
                ...(statusFilter ? [{ status: statusFilter }] : []),
                ...(startDate || endDate
                    ? [
                        {
                            last_render_at: {
                                ...(startDate ? { $gte: new Date(startDate) } : {}),
                                ...(endDate ? { $lte: new Date(endDate) } : {}),
                            },
                        },
                    ]
                    : []),
            ]

        }

        const skip = (page - 1) * limit;
        const totalActivity = await PrerenderActivity.countDocuments(filter);

        const activity = await PrerenderActivity.find(filter).skip(skip).limit(limit).sort({ page_size: sortOrder });
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
module.exports = { addActivity, getActivity, deleteActivity };