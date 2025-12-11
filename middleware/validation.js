const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Please fill in all required fields',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

const validateRegister = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 2 }).withMessage('Username must be at least 2 characters'),
    
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email address')
        .toLowerCase(),
    
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and numbers'),
    
    body('contactNumber')
        .optional()
        .trim()
        .matches(/^[0-9\+\-\(\)\s]{7,}$/).withMessage('Please provide a valid phone number'),
    
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email address')
        .toLowerCase(),
    
    body('password')
        .notEmpty().withMessage('Password is required'),
    
    handleValidationErrors
];

const validateGoogleAuth = [
    body('tokenId')
        .notEmpty().withMessage('Google token is required')
        .isString().withMessage('Token must be a string'),
    
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateGoogleAuth,
    handleValidationErrors
};
