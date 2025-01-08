const WebsiteUrl = require('../../models/WebsiteUrl');
const Error400Website = require('../../models/error400Website');
const Error500Website = require('../../models/error500Websites');
const Website = require('../../models/Website');
const Activity = require('../../models/Activity')
const { ObjectId } = require('mongodb');

const getChartData = async (req, res) => {
    try {
        const { startDate, endDate, id } = req.query;
        const { ObjectId } = require('mongodb');

        let websiteId;
        try {
            websiteId = new ObjectId(id);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid ObjectId format' });
        }

        if (!startDate || !endDate || !id) {
            return res.status(400).json({ error: 'StartDate, EndDate and Id are required.' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setDate(start.getDate() + 0); 
        // end.setDate(end.getDate() + (7 - end.getDay()));
        // end.setHours(23, 59, 59, 999);

        const dateRange = [];
        const currentDate = new Date(start);
        while (currentDate <= end) {
            dateRange.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const websiteUrlsData = await WebsiteUrl.aggregate([
            {
                $match: {
                    website_id: websiteId,
                    created_at: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: { day: { $dateToString: { format: '%Y-%m-%d', date: "$created_at" } } },
                    totalPages: { $sum: 1 },
                    renderedPages: {
                        $sum: { $cond: [{ $eq: ['$status', 'Rendered'] }, 1, 0] },
                    },
                    notRenderedPages: {
                        $sum: { $cond: [{ $ne: ['$status', 'Rendered'] }, 1, 0] },
                    },
                },
            },
            { $sort: { '_id.day': 1 } },
        ]);

        const error400Total = await Error400Website.aggregate([
            {
                $match: {
                    website_id: websiteId,
                    timestamp: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } },
                    count: { $sum: 1 },
                },
            },
        ]);

        const error500Total = await Error500Website.aggregate([
            {
                $match: {
                    website_id: websiteId,
                    timestamp: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } },
                    count: { $sum: 1 },
                },
            },
        ]);

        const activityTotal = await Activity.aggregate([
            { 
                $match: {
                    url_id: websiteId,
                    last_render_at: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$last_render_at' } } },
                    count: { $sum: 1 },
                },
            },
        ])

        const error500 = error500Total.reduce((acc, stat) => {
            acc[stat._id.day] = stat.count;
            return acc;
        }, {})

        const error400 = error400Total.reduce((acc, stat) => {
            acc[stat._id.day] = stat.count;
            return acc;
        }, {})

        const activity = activityTotal.reduce((acc, stat) => {
            acc[stat._id.day] = stat.count;
            return acc;
        },{})

        const statsMap = websiteUrlsData.reduce((acc, stat) => {
            acc[stat._id.day] = {
                totalPages: stat.totalPages,
                renderedPages: stat.renderedPages,
                notRenderedPages: stat.notRenderedPages,
            }
            return acc;
        }, {});

        const response = dateRange.map((currentDate) => ({
            day: currentDate,
            totalPages: statsMap[currentDate]?.totalPages || 0,
            renderedPages: statsMap[currentDate]?.renderedPages || 0,
            notRenderedPages: statsMap[currentDate]?.notRenderedPages || 0,
            error400Count: error400[currentDate] || 0,
            error500Count: error500[currentDate] || 0,
            activityCount: activity[currentDate] || 0,
        }))

        res.json({
            id,
            response,
        });
    } catch (error) {
        console.error('Error details:', error.stack);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

const getUrlData = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Start date and end date are required." });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setDate(start.getDate() + 1); 
        // end.setDate(end.getDate() + (7 - end.getDay()));
        // end.setHours(23, 59, 59, 999);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ success: false, message: "Invalid date format." });
        }

        const websites = await Website.find({}, { name: 1, url: 1 })
        const websiteIds = websites.map(website => new ObjectId(website._id));
        // console.log("Website IDs:", websiteIds);

        const days = [];
        let currentDate = new Date(start);
        while (currentDate <= end) {
            days.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const websiteUrlsData = await WebsiteUrl.aggregate([
            {
                $match: {
                    created_at: { $gte: start, $lte: end },
                    website_id: { $in: websiteIds }
                }
            },
            {
                $group: {
                    _id: {
                        website_id: '$website_id',
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }
                    },
                    totalUrl: { $sum: 1 },
                    renderedUrl: { $sum: { $cond: [{ $eq: ['$status', 'Rendered'] }, 1, 0] } },
                    notRenderedUrl: { $sum: { $cond: [{ $ne: ['$status', 'Rendered'] }, 1, 0] } }
                }
            },
        ]);

        const error400Counts = await Error400Website.aggregate([
            {
                $match: {
                    timestamp: { $gte: start, $lte: end },
                    website_id: { $in: websiteIds },
                },
            },
            {
                $group: {
                    _id: {
                        website_id: '$website_id',
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
                    },
                    error400Count: { $sum: 1 },
                }
            }
        ])

        const error500Counts = await Error500Website.aggregate([
            {
                $match: {
                    timestamp: { $gte: start, $lte: end },
                    website_id: { $in: websiteIds },
                },
            },
            {
                $group: {
                    _id: {
                        website_id: '$website_id',
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
                    },
                    error500Count: { $sum: 1 },
                }
            }
        ])

        const response = websites.map(website => {
            const websiteData = {
                id: website._id,
                name: website.name,
                url: website.url,
                data: days.map(day => {
                    const websiteUrlData = websiteUrlsData.find(w =>
                        String(w._id.website_id) === String(website._id) && w._id.date === day
                    ) || {};

                    const error400Data = error400Counts.find(e =>
                        String(e._id.website_id) === String(website._id) && e._id.date === day
                    ) || {};

                    const error500Data = error500Counts.find(e =>
                        String(e._id.website_id) === String(website._id) && e._id.date === day
                    ) || {};

                    return {
                        days: day,
                        totalUrl: websiteUrlData.totalUrl || 0,
                        renderedUrl: websiteUrlData.renderedUrl || 0,
                        notRenderedUrl: websiteUrlData.notRenderedUrl || 0,
                        error400Count: error400Data.error400Count || 0,
                        error500Count: error500Data.error500Count || 0
                    };
                })
            };
            return websiteData;
        });

        // console.log(response)
        res.status(200).json({
            success: true,
            items: response
        })
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
}
module.exports = { getChartData, getUrlData }