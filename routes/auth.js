const {Router} = require('express');
const router = Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');
const {registerValidators} = require('../utils/validators');
const {loginValidators} = require('../utils/validators');
const User = require('../models/user');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');


const transporter = nodemailer.createTransport(sendgrid({
    auth: { api_key: keys.SENDGRID_API_KEY }
}));

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authentication',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
});

router.post('/login', loginValidators, async (req, res) => {
    try {
        const { email, password } = req.body;

        const candidate = await User.findOne({ email });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('loginError', errors.array()[0].msg); 
            return res.status(422).redirect('/auth/login#login')
        }

        req.session.user = candidate;
        req.session.isAuthenticated = true;
        await req.session.save(err => {
            if (err) throw err;
            res.redirect('/');
        })
        
    }catch(e) {console.log(e)}
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    });
});

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const candidate = await User.findOne({ email });

        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg); 
            return res.status(422).redirect('/auth/login#register')
        }
        // -------------

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email: email, // or just 'email'
            name,
            password: hashPassword,
            cart: {items: []}
        });
        await user.save();
        res.redirect('/auth/login#login');

        await transporter.sendMail(regEmail(email)); // send email (after redirect)
        
    } catch(e) { console.log(e) }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Forgot password?',
        error: req.flash('error')
    })
});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Something went wrong... repeat, please :)');
                return res.redirect('auth/reset');
            }

            const token = buffer.toString('hex');

            const candidate = await User.findOne({ email: req.body.email });
            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000; // -- 1 hour
                await candidate.save();

                await transporter.sendMail(resetEmail(candidate.email, token));

                res.redirect('/auth/login');
            } else {
                req.flash('error', 'no email in database');
                res.redirect('/auth/reset');
            }
        });
    } catch(e) { console.log(e) }
});

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) res.redirect('/auth/login');
    
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() } // greater than Date.now()
        })
        
        if (!user) { console.log('no token 2'); res.redirect('/auth/login') }
        else {
            res.render('auth/password', {
                title: 'New password',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            });
        }
    } catch(e) { console.log(e) }
});
    
router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() }  // greater than Date.now()
        });

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save(); 
            res.redirect('/auth/login');
        } else {
            req.flash('loginError', 'token expired');
            res.redirect('/auth/login');
        }

    } catch(e) { console.log(e) }
});
 
module.exports = router;