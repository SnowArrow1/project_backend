const mongoose = require('mongoose');
const Company = require('./Company');

const InterviewSchema = new mongoose.Schema({
    
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    company:{
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: [true, 'Please add the company']
    },
    interviewDate: {
        type: Date,
        required: [true, 'Please add Interview Date'],
        validate: {
            validator: function(value) {
                const startDate = new Date('2022-05-10');
                const endDate = new Date('2022-05-13');
                return value >= startDate && value <= endDate;
            },
            message: 'Date must be between 10 May 2022 and 13 May 2022'
        }
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Interview',InterviewSchema);