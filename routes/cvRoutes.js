const express = require('express');
const router = express.Router();
const {
    createCV,
    getCVs,
    getCVById,
    updateCV,
    deleteCV,
    getPublicCV,
} = require('../controllers/cvController');
const { protect } = require('../middleware/auth');

// Public route for sharing
router.get('/public/:id', getPublicCV);

// Protected routes
router.route('/').post(protect, createCV).get(protect, getCVs);
router
    .route('/:id')
    .get(protect, getCVById)
    .put(protect, updateCV)
    .delete(protect, deleteCV);

module.exports = router;
