const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChartDataSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    data:{
        type: [Number],
        required: true,
    },
    categories: {
        type:[String],
        required: true,
    } ,
    createdAt: { type: Date, default: Date.now },
});

const Chart = mongoose.model('Chart',ChartDataSchema);

module.exports = Chart;