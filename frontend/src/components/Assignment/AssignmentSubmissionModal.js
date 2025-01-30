import React, { useState } from 'react';
import axios from 'axios';

const AssignmentSubmissionModal = ({ assignment, onClose }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            if (selectedFile.size <= 5 * 1024 * 1024) { // 5MB limit
                setFile(selectedFile);
                setError('');
            } else {
                setError('File size should be less than 5MB');
            }
        } else {
            setError('Please select a PDF file');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            // First upload the file
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await axios.post(
                'http://localhost:9000/api/student/upload',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Session-ID': sessionId,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (uploadResponse.data.success) {
                // Then submit the assignment with the file URL
                const submitResponse = await axios.post(
                    `http://localhost:9000/api/student/assignments/${assignment._id}/submit`,
                    {
                        submissionFile: uploadResponse.data.fileUrl
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'X-Session-ID': sessionId
                        }
                    }
                );

                if (submitResponse.data.success) {
                    setSuccess('Assignment submitted successfully!');
                    setTimeout(() => {
                        onClose();
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Submission error:', error);
            setError(error.response?.data?.message || 'Failed to submit assignment');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Submit Assignment</h2>
                <p className="text-gray-600 mb-4">Assignment: {assignment.title}</p>
                <p className="text-gray-600 mb-4">Due Date: {new Date(assignment.dueDate).toLocaleString()}</p>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Upload PDF File (Max 5MB)
                            </label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                required
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-1">{error}</p>
                            )}
                            {success && (
                                <p className="text-green-500 text-sm mt-1">{success}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                            disabled={uploading || !file}
                        >
                            {uploading ? 'Submitting...' : 'Submit Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignmentSubmissionModal; 