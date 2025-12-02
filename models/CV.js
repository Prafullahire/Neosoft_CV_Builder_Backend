const mongoose = require('mongoose');

const cvSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        layout: {
            type: String,
            enum: ['professional', 'modern', 'creative'],
            default: 'professional',
        },
        basicDetails: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String },
            address: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
            image: { type: String }, // URL or base64
            intro: { type: String },
        },
        education: [
            {
                degree: { type: String, required: true },
                institution: { type: String, required: true },
                percentage: { type: Number },
                year: { type: String },
                startDate: { type: String },
                endDate: { type: String },
            },
        ],
        experience: [
            {
                company: { type: String, required: true },
                position: { type: String, required: true },
                location: { type: String },
                joiningDate: { type: String },
                leavingDate: { type: String },
                ctc: { type: String },
                technologies: [{ type: String }],
                description: { type: String },
            },
        ],
        projects: [
            {
                title: { type: String, required: true },
                description: { type: String },
                duration: { type: String },
                teamSize: { type: Number },
                technologies: [{ type: String }],
                role: { type: String },
            },
        ],
        skills: [
            {
                name: { type: String, required: true },
                proficiency: { type: Number, min: 0, max: 100 }, // percentage
            },
        ],
        socialProfiles: [
            {
                platform: { type: String, required: true },
                url: { type: String, required: true },
            },
        ],
        isPublic: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const CV = mongoose.model('CV', cvSchema);

module.exports = CV;
