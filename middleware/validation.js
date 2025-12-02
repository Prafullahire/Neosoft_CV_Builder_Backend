const { body, validationResult } = require('express-validator');

// Validation middleware to handle errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation error',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// Register validation rules
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

// Login validation rules
const validateLogin = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email address')
        .toLowerCase(),
    
    body('password')
        .notEmpty().withMessage('Password is required'),
    
    handleValidationErrors
];

// Google OAuth validation rules
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
