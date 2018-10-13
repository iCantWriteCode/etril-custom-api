const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    title      : {
        type: String
    },
    description: {
        type: String
    },
    language   : {
        type: String
    },
    status     : {
        type   : Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);
