const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    rooms: [

    ],

}, {
        timestamps: true
    });

userSchema.pre('save', function (next) {
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

userSchema.pre('findOneAndUpdate', function () {
    if (this.getUpdate().password !== undefined) {
        this.findOneAndUpdate(
            {},
            { password: encryptPassword(this.getUpdate().password) }
        );
    }
});

userSchema.methods.comparePassword = function (candidatePassword, callBack) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return callBack(err);
        callBack(null, isMatch);
    });
};

encryptPassword = password => {
    let salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    let hash = bcrypt.hashSync(password, salt);
    return hash;
};

module.exports = mongoose.model('User', userSchema);
