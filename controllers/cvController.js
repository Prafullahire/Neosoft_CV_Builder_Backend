const CV = require('../models/CV');

// @desc    Create new CV
// @route   POST /api/cvs
// @access  Private
const createCV = async (req, res) => {
    try {
        const cv = await CV.create({
            user: req.user._id,
            ...req.body,
        });

        res.status(201).json(cv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all CVs for logged in user
// @route   GET /api/cvs
// @access  Private
const getCVs = async (req, res) => {
    try {
        const cvs = await CV.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(cvs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single CV by ID
// @route   GET /api/cvs/:id
// @access  Private
const getCVById = async (req, res) => {
    try {
        const cv = await CV.findById(req.params.id);

        if (!cv) {
            return res.status(404).json({ message: 'CV not found' });
        }

        // Check if user owns this CV
        if (cv.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(cv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update CV
// @route   PUT /api/cvs/:id
// @access  Private
const updateCV = async (req, res) => {
    try {
        const cv = await CV.findById(req.params.id);

        if (!cv) {
            return res.status(404).json({ message: 'CV not found' });
        }

        // Check if user owns this CV
        if (cv.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedCV = await CV.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedCV);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete CV
// @route   DELETE /api/cvs/:id
// @access  Private
const deleteCV = async (req, res) => {
    try {
        const cv = await CV.findById(req.params.id);

        if (!cv) {
            return res.status(404).json({ message: 'CV not found' });
        }

        // Check if user owns this CV
        if (cv.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await CV.findByIdAndDelete(req.params.id);

        res.json({ message: 'CV removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get public CV (for sharing)
// @route   GET /api/cvs/public/:id
// @access  Public
const getPublicCV = async (req, res) => {
    try {
        const cv = await CV.findById(req.params.id);

        if (!cv) {
            return res.status(404).json({ message: 'CV not found' });
        }

        if (!cv.isPublic) {
            return res.status(403).json({ message: 'This CV is not public' });
        }

        res.json(cv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCV,
    getCVs,
    getCVById,
    updateCV,
    deleteCV,
    getPublicCV,
};
