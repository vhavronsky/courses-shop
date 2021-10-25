const {body} = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('incorrect email')
        .custom(async (value, {req}) => {
            try {
                const candidateUser = await User.findOne({ email: value });
                if (candidateUser) {
                    return Promise.reject('this email is already used');
                }
            } catch(e) { console.log(e) }
    })
    .normalizeEmail(), // sanitizer

    body('password', 'the password must be between 6 and 56')
        .isLength({min: 6, max: 56})
        .isAlphanumeric()
        .trim(),        // sanitizer

    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords must match')
            }
            return true;
    })
    .trim(),

    body('name', 'name must be at least 3 symbols')
        .isLength({min: 3})
        .trim()
]

exports.loginValidators = [
    body('email')
     .isEmail().withMessage('incorrect email')
     .custom(async (value, {req}) => {
        try {
            const candidateUser = await User.findOne({ email: value });
            if (!candidateUser) {
                return Promise.reject("this email doesn't exist");
            }
        } catch(e) { console.log(e) }
    })
     .normalizeEmail(), // sanitizer

    body('password')
     .custom(async (value, {req}) => {
        try {
            const user = await User.findOne({ email: req.body.email });

            const areSame = await bcrypt.compare(value, user.password);
            if (!areSame) {
                return Promise.reject("incorrect password")
            } 

            return true;

        } catch(e) {console.log(e);}
     })
     .trim(),        // sanitizer
]


exports.courseValidators = [
    body('title', 'minimal length must be 3 characters')
     .isLength({min: 3})
     .trim(),

    body('price', 'incorrect price')
     .isNumeric(),
    
    body('img', 'incorrect image url')
     .isURL()
]