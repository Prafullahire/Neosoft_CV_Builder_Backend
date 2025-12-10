const CV = require('../models/CV');


const createCV = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const cv = await CV.create({
            user: req.user._id,
            ...req.body,
        });

        res.status(201).json(cv);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map((key) => ({
                field: key,
                message: error.errors[key].message,
            }));
            console.error('ValidationError creating CV:', errors);
            return res.status(400).json({ message: 'Validation error', errors });
        }

        if (error.code && error.code === 11000) {
            console.error('Duplicate key error creating CV:', error.keyValue);
            return res.status(400).json({ message: 'Duplicate value', details: error.keyValue });
        }

        console.error('Error creating CV:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const getCVs = async (req, res) => {
    try {
        const cvs = await CV.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(cvs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getCVById = async (req, res) => {
    try {
        const cv = await CV.findById(req.params.id);

        if (!cv) {
            return res.status(404).json({ message: 'CV not found' });
        }

        if (cv.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(cv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
