import React, { useState } from 'react';
import axios from 'axios';

const GradeSubmissionModal = ({ submission, assignment, onClose, onGraded }) => {
    const [formData, setFormData] = useState({
        grade: submission.grade || '',
        feedback: submission.feedback || ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.post(
                `http://localhost:9000/api/faculty/assignments/${assignment._id}/submissions/${submission._id}/grade`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                if (onGraded) onGraded(response.data.submission);
                onClose();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit grade');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Grade Submission</h2>
                <div className="mb-4">
                    <p className="text-gray-600">Assignment: {assignment.title}</p>
                    <p className="text-gray-600">Student: {submission.student.name}</p>
                    <a 
                        href={submission.submissionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                    >
                        View Submission
                    </a>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Grade (Max: {assignment.maxMarks})
                            </label>
                            <input
                                type="number"
                                value={formData.grade}
                                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                                min="0"
                                max={assignment.maxMarks}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Feedback</label>
                            <textarea
                                value={formData.feedback}
                                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows="4"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Submit Grade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GradeSubmissionModal; 