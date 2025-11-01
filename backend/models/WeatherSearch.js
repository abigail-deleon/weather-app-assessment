const mongoose = require('mongoose');

const weatherSearchSchema = new mongoose.Schema({
    location: {
        type: String,
        require: true,
        trim: true
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    temperature: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    humidity: {
        type: Number,
        reuired: true
    },
    windSpeed: {
        type: Number,
        required: true
    },
    feelsLike: Number,
    country: String,
    icon: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Validation: end date must be after start date
weatherSearchSchema.pre('save', function(next) {
    if(this.startDate && this.endDate && this.startDate > this.endDate){
        next(new Error('End date must be after the start date'));
    }
    next();
});

module.exports = mongoose.model('WeatherSearch', weatherSearchSchema);