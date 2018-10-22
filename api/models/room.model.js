const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const roomSchema = Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true },
    gm: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    users: [],
    maps: {}
});

module.exports = mongoose.model('Room', roomSchema)