const keys = require('../keys');

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Access recovery',
        html: `
            <h1>Forgot password?</h1>
            <p>If no, ignore it</p>
            <p>Otherwise, click on link below:</p>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Recover access</a></p>
            <hr />
            <a href="${keys.BASE_URL}">Courses shop</a>
        `
    }
}