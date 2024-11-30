const WebsiteUrl = require('../../models/WebsiteUrl');
const Error400Website = require('../../models/error400Website');
const Error500Website = require('../../models/error500Websites');

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
            // const now = new Date();
            const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            startDate = new Date(twoMonthsAgo.setHours(0, 0, 0, 0));
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'yearly':
            const currentYear = new Date().getFullYear();
            startDate = new Date(currentYear - 3, 0, 1, 0, 0, 0, 0); // January 1, 3 years ago
            endDate = new Date(currentYear + 1, 0, 0, 23, 59, 59, 999); // December 31, current year
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

const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

const getChartData = async (req, res) => {
    const { parent_url, filterType, monthCount } = req.query;

    if (!parent_url || !filterType) {
        return res.status(400).json({ error: 'URL and filterType query parameters are required' });
    }

    const monthsToInclude = parseInt(monthCount, 10) || 5;

    try {
        const { startDate, endDate } = getDateRange(filterType);

        const urlDetails = await WebsiteUrl.findOne({ parent_url });

        if (!urlDetails) {
            return res.status(404).json({ error: 'URL not found' });
        }

        const totalItems = await WebsiteUrl.countDocuments({ parent_url });

        const totalRenderedPages = await WebsiteUrl.countDocuments({ parent_url, status: 'Rendered' })

        const totalNotRenderedPages = await WebsiteUrl.countDocuments({
            parent_url,
            status: { $ne: 'Rendered' }
        })

        const error500Total = await Error500Website.countDocuments({ website_url: parent_url })

        const error400Data = await Error400Website.aggregate([
            { $match: { website_url: parent_url } },
            {
                $group: {
                    _id: '$website_id',
                    count: { $sum: 1 },
                }
            }
        ]);

        const error400Total = error400Data.reduce((acc, item) => acc + item.count, 0);

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
            const currentYear = new Date().getFullYear();

            // Create placeholders for the last 4 years
            const years = [];
            for (let i = 0; i < 4; i++) {
                const year = currentYear - i;
                years.push({
                    year,
                    total_pages: 0,
                    rendered_pages: 0,
                    not_rendered_pages: 0,
                });
            }

            // Map stats from the database
            const statsMap = new Map();
            stats.forEach((stat) => {
                statsMap.set(stat._id.year, {
                    year: stat._id.year,
                    total_pages: stat.totalPages,
                    rendered_pages: stat.renderedPages,
                    not_rendered_pages: stat.notRenderedPages,
                });
            });

            // Merge stats into years, replacing placeholders with actual data
            const mergedYears = years.map((yearData) => {
                return statsMap.get(yearData.year) || yearData; // Replace placeholder if stat exists
            });

            mergedYears.sort((a, b) => a.year - b.year);

            response = {
                yearly: {
                    details: mergedYears,
                },
            };
        } else if (filterType === 'daily') {
            const allDates = generateDateRange(startDate, endDate);

            const today = new Date().toISOString().split('T')[0];
            if (!allDates.includes(today)) {
                allDates.push(today);
            }

            const statsMap = stats.reduce((acc, stat) => {
                acc[stat._id.date] = {
                    total_pages: stat.totalPages,
                    rendered_pages: stat.renderedPages,
                    not_rendered_pages: stat.notRenderedPages,
                };
                return acc;
            }, {});

            const lastSixDays = allDates.slice(-6);

            response = {
                daily: {
                    date_range: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
                    details: lastSixDays.map((date) => ({
                        date,
                        total_pages: statsMap[date]?.total_pages || 0,
                        rendered_pages: statsMap[date]?.rendered_pages || 0,
                        not_rendered_pages: statsMap[date]?.not_rendered_pages || 0,
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
            const now = new Date();
            const months = [];
            for (let i = 0; i < monthsToInclude; i++) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1); // Current and previous month
                months.push({
                    month: date.toLocaleString('default', { month: 'long' }),
                    year: date.getFullYear(),
                    total_pages: 0,
                    rendered_pages: 0,
                    not_rendered_pages: 0,
                });
            }

            // Map stats to the months
            const statsMap = new Map();
            stats.forEach((stat) => {
                const key = `${stat._id.year}-${stat._id.month}`;
                statsMap.set(key, {
                    month: new Date(stat._id.year, stat._id.month - 1).toLocaleString('default', { month: 'long' }),
                    year: stat._id.year,
                    total_pages: stat.totalPages,
                    rendered_pages: stat.renderedPages,
                    not_rendered_pages: stat.notRenderedPages,
                });
            });

            // Replace placeholders with actual data where available
            const mergedMonths = months.map((monthData) => {
                const key = `${monthData.year}-${new Date(Date.parse(monthData.month + " 1, " + monthData.year)).getMonth() + 1}`;
                return statsMap.get(key) || monthData;
            });

            mergedMonths.sort((a, b) => {
                const monthA = new Date(Date.parse(a.month + " 1, " + a.year)).getMonth();
                const monthB = new Date(Date.parse(b.month + " 1, " + b.year)).getMonth();
                return monthA - monthB;
            });

            response = {
                monthly: {
                    year: new Date().getFullYear(),
                    details: mergedMonths,
                },
            };
        }

        res.json({
            filterType,
            totalItems,
            renderedPages: totalRenderedPages,
            notRenderedPages: totalNotRenderedPages,
            error400Total,
            error500Total,
            error400Data,
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