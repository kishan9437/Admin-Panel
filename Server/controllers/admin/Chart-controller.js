const WebsiteUrl = require('../../models/WebsiteUrl');

const getDateRange = (type) => {
    const now = new Date();
    let startDate, endDate;

    switch (type) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'weekly':
            const sixWeeksAgo = new Date(now.getTime() - 6 * 7 * 24 * 60 * 60 * 1000);
            startDate = new Date(sixWeeksAgo.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'monthly':
            const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            startDate = new Date(twoMonthsAgo.setHours(0, 0, 0, 0));
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
        case 'daily':
            startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); 
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        default:
            throw new Error('Invalid type');
    }
    return { startDate, endDate };
};

const getChartData = async (req, res) => {
    const { parent_url, filterType } = req.query;

    if (!parent_url || !filterType) {
        return res.status(400).json({ error: 'URL and filterType query parameters are required' });
    }

    try {
        const { startDate, endDate } = getDateRange(filterType);

        const urlDetails = await WebsiteUrl.findOne({ parent_url });

        if (!urlDetails) {
            return res.status(404).json({ error: 'URL not found' });
        }

        const groupKey =
            filterType === 'weekly'
                ? {
                    weekStart: { $dateTrunc: { date: '$created_at', unit: 'week', binSize: 1, timezone: 'UTC' } },
                }
                : filterType === 'monthly'
                    ? { month: { $month: '$created_at' }, year: { $year: '$created_at' } }
                    : filterType === 'daily'
                        ? { date: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } } }
                        : filterType === 'yearly'
                            ? { year: { $year: '$created_at' } }
                            : filterType === 'today'
                                ? null
                                : null;

        const matchQuery = {
            parent_url,
            created_at: { $gte: startDate, $lte: endDate },
        };

        const stats = await WebsiteUrl.aggregate([
            {
                $match: matchQuery
            },
            ...(groupKey
                ? [
                    {
                        $group: {
                            _id: groupKey,
                            totalPages: { $sum: 1 },
                            renderedPages: {
                                $sum: { $cond: [{ $eq: ['$status', 'Rendered'] }, 1, 0] },
                            },
                            notRenderedPages: {
                                $sum: { $cond: [{ $ne: ['$status', 'Rendered'] }, 1, 0] },
                            },
                        },
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1, '_id.weekStart': 1 } },
                ]
                : [{
                    $group: {
                        _id: null,
                        totalPages: { $sum: 1 },
                        renderedPages: {
                            $sum: { $cond: [{ $eq: ['$status', 'Rendered'] }, 1, 0] },
                        },
                        notRenderedPages: {
                            $sum: { $cond: [{ $ne: ['$status', 'Rendered'] }, 1, 0] },
                        },
                    },
                },
                ]),
        ]);

        let response;

        if (filterType === 'yearly') {
            response = {
                yearly: {
                    details: stats.map((stat) => ({
                        year: stat._id.year,
                        total_pages: stat.totalPages,
                        rendered_pages: stat.renderedPages,
                        not_rendered_pages: stat.notRenderedPages,
                    })),
                },
            };
        }
        else if (filterType === 'daily') {
            response = {
                daily: {
                    date_range: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
                    details: stats.map((stat) => ({
                        date: stat._id.date,
                        total_pages: stat.totalPages,
                        rendered_pages: stat.renderedPages,
                        not_rendered_pages: stat.notRenderedPages,
                    })),
                },
            };
        } else if (filterType === 'today') {
            const stat = stats[0] || {
                totalPages: 0,
                renderedPages: 0,
                notRenderedPages: 0,
            };

            response = {
                today: {
                    date: new Date().toISOString().split('T')[0],
                    total_pages: stat.totalPages,
                    rendered_pages: stat.renderedPages,
                    not_rendered_pages: stat.notRenderedPages,
                },
            };
        } else if (filterType === 'weekly') {
            response = {
                weekly: {
                    details: stats.map((stat) => ({
                        week_start: new Date(stat._id.weekStart),
                        week_end: new Date(new Date(stat._id.weekStart).getTime() + 6 * 24 * 60 * 60 * 1000),
                        total_pages: stat.totalPages,
                        rendered_pages: stat.renderedPages,
                        not_rendered_pages: stat.notRenderedPages,
                    })),
                },
            };
        } else if (filterType === 'monthly') {
            response = {
                monthly: {
                    year: new Date().getFullYear(),
                    details: stats.map((stat) => ({
                        month: new Date(stat._id.year, stat._id.month - 1).toLocaleString('default', {
                            month: 'long',
                        }),
                        total_pages: stat.totalPages,
                        rendered_pages: stat.renderedPages,
                        not_rendered_pages: stat.notRenderedPages,
                    })),
                },
            };
        }

        res.json({
            filterType,
            lastRenderedAt: urlDetails.last_render_at,
            parent_url,
            ...response,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
module.exports = { getChartData }