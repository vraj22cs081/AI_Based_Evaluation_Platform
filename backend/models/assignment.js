const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submissionUrl: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    grade: {
        type: Number
    },
    feedback: {
        type: String
    }
});

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    },
    assignmentFile: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: false
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submissions: [submissionSchema],
    idealAnswers: {
        type: Object,
        required: true,
        default: {
            questions: [{
                questionNumber: 1,
                idealAnswer: "Please review manually",
                keyPoints: ["Manual review required"],
                maxMarks: 100,
                markingCriteria: ["Review submission thoroughly"]
            }],
            totalMarks: 100
        }
    }
}, {
    timestamps: true
});

// Pre-save hook to ensure filePath is set
assignmentSchema.pre('save', function(next) {
    // If filePath is not set but assignmentFile is available, derive filePath from URL
    if ((!this.filePath || this.filePath === 'undefined') && this.assignmentFile) {
        const urlParts = this.assignmentFile.split('/');
        this.filePath = `assignments/${urlParts[urlParts.length - 1]}`;
        console.log('Derived filePath before save:', this.filePath);
    }
    next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);