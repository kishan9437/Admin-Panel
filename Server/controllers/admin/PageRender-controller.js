const PageRender = require('../../models/PageRender');

const getDateRange = (type) => {
    const now = new Date();
    let startDate;

    if (type === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (type === 'weekly') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    } else if (type === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (type === 'yearly') {
        startDate = new Date(now.getFullYear(), 0, 1);
    }
    return {
        startDate,
        endDate: now
    }
}

const getPageRenderData = async (req, res) => {
    const { period } = req.params;
    const { startDate, endDate } = getDateRange(period);

    try {
        const data = await PageRender.aggregate([
            {
                $match: {
                    renderDate: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: '$pageName',
                    totalRenders: { $sum: { $cond: ['$isRendered', 1, 0] } },
                    totalNotRendered: { $sum: { $cond: ['$isRendered', 0, 1] } },
                },
            },
        ]);
        res.status(200).json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
}

module.exports = {getPageRenderData};