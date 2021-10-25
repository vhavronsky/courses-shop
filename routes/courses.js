const {Router} = require('express');
const Course = require('../models/course');
const router = Router();
const {validationResult} = require('express-validator')
const {courseValidators} = require('../utils/validators')
const auth = require('../middleware/auth');

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString();
}

// courses page
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find() // inner method 'find'
        .populate('userId', 'email name') 
        .select('price title img'); 

        res.render('courses', {
            title: 'Courses',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        });
    } catch (e) { console.log(e); }
})

// edit course page
router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) res.redirect('/');

    try {
        const course = await Course.findById(req.params.id); // inner method 'findById'

        if (!isOwner(course, req)) {
            // protecting course from other users
            return res.redirect('/courses');
        }

        res.render('course-edit', {
            title: `Edit ${course.title}`,
            course
        })
    } catch(e) {console.log(e);}
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req);
    const {id} = req.body; // taking 'id' from 'body'

    if (!errors.isEmpty()) {
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }
    
    try {
        delete req.body.id; // deleting 'id' from 'body'

        const course = await Course.findById(id);
        if (!isOwner(course, req)) res.redirect('/courses');
    
        Object.assign(course, req.body);

        await course.save();
        res.redirect('/courses');
    } catch(e) {console.log(e);}
})

// new course page
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        res.render('course', {
            layout: 'empty',    // another layout
            title: `Course ${course.title}`,
            course
        });
    } catch(e) {console.log(e);}
})

// delete course
router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({  // inner method
            _id: req.body.id,
            userId: req.user._id
        }); 
        res.redirect('/courses');
    } catch(e) { console.log(e) }
})


module.exports = router;