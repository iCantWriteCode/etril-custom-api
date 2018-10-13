const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    gm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    users: [],
}, {
        timestamps: true
    });



module.exports = mongoose.model('Room', roomSchema);