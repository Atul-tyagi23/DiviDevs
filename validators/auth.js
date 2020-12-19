const { check } = require('express-validator');

const signupValidator = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password of length greater than six').isLength(
        {min: 6}
    )
]

const loginValidator = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
]

const profileValidator = [
    check('status','status is required').not().isEmpty(),
    check('skills', 'skills is required').not().isEmpty()
]

const experienceValidator = [
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'from Date is required').not().isEmpty(),
]

const educationValidator = [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'field of study is required').not().isEmpty(),
    check('from', 'from is required').not().isEmpty()
];

const postValidator = [
    check('text', 'Text is required').not().isEmpty(),
];




module.exports = {signupValidator, loginValidator, profileValidator, experienceValidator,
    educationValidator, postValidator
}