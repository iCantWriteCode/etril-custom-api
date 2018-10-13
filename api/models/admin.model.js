const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    typeOfUser: {
        type: String
    }
});

adminSchema.pre('save', function (next) {
    let user = this;
    // generate a salt
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

adminSchema.pre('findOneAndUpdate', function () {
    if (this.getUpdate().password !== undefined) {
        this.findOneAndUpdate({}, {password: encryptPassword(this.getUpdate().password)});
    }
});

adminSchema.methods.comparePassword = function (candidatePassword, callBack) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return callBack(err);
        callBack(null, isMatch);
    });
};

encryptPassword = (password) => {
    let salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    let hash = bcrypt.hashSync(password, salt);
    return hash;
};

module.exports = mongoose.model('Admin', adminSchema)