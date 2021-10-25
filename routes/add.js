const {Router} = require('express');
const {validationResult} = require('express-validator')
const Course = require('../models/course');
const router = Router();
const auth = require('../middleware/auth');
const {courseValidators} = require('../utils/validators');

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Add course',
        isAdd: true
    });
});

router.post('/', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('add', {
            title: 'Add course',
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img
            }
        })
    }

    const courses = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        userId: req.user // connecting user with course
    })

    try {
        await courses.save(); // inner method 'save'
        res.redirect('/courses');
    } catch(e) {
        console.log(e);
    }
});

module.exports = router;