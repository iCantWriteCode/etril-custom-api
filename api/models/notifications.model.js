const mongoose = require('mongoose');

const pushNotificationSchema = new mongoose.Schema({
    title    : {type: String},
    messageEn: {type: String},
    messageEl: {type: String},
    segments : []
}, {
    timestamps: true
});

module.exports = mongoose.model('PushNotification', pushNotificationSchema);
