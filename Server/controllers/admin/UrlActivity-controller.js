const WebsiteUrl = require('../../models/WebsiteUrl');
const PrerenderActivity = require('../../models/Activity')
const { ObjectId } = require('mongodb');

const UrlActivity = async (req, res) => {
    try {
        const { website_id, startdate, enddate, url } = req.query;

        if (!website_id) {
            return res.status(400).json({ error: 'website_id is required' });
        }

        if (!startdate || !enddate) {
            return res.status(400).json({ error: "Both startdate and enddate are required" });
        }

        const startDate = new Date(startdate);
        const endDate = new Date(enddate);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({ error: "Invalid date format for startdate or enddate" });
        }

        const websiteurls = await WebsiteUrl.find({
            website_id,
            url,
            created_at: { $gte: startDate, $lte: endDate }
        });

        if (websiteurls.length === 0) {
            return res.status(404).json({ message: "No matching Website Urls found" });
        }

        const activityId = websiteurls.map((item) => item.website_id);
        const activities = await PrerenderActivity.find({ url_id: { $in: activityId } })

        const reponse = websiteurls.map((websiteUrl) => {
            const relatedActivities = activities.filter(act => act.url_id.toString() === websiteUrl.website_id.toString());
            const isRendered = websiteUrl.status === 'Rendered';

            const errorDetails = relatedActivities.map(activity => {
                const statusCode = activity.status_code;
                let errorCode = '';
                let errorType = ''

                if (statusCode >= 400 && statusCode < 500) {
                    errorCode = statusCode
                    errorType = activity.error || 'Unknown Error';
                } else if (statusCode >= 500) {
                    errorCode = statusCode
                    errorType = activity.error || 'Unknown Error';
                } else {
                    errorCode = statusCode
                    errorType = activity.error || 'Unknown Error';
                }

                return {
                    statusCode: errorCode,
                    errorType: errorType
                };
            });
            return {
                url: websiteUrl.url,
                status: websiteUrl.status,
                last_render_at: isRendered ? websiteUrl.last_render_at : null,
                pending: !isRendered ? websiteUrl.created_at : null,
                errors: errorDetails.map(err =>({
                    statusCode: err.statusCode,
                    errorType: err.errorType,
                })),
            };
        });

        res.status(200).json(reponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = UrlActivity;