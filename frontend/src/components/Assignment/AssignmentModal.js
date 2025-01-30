import React, { useState } from 'react';
import axios from 'axios';

const AssignmentModal = ({ classroom, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        maxMarks: ''
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

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
            const formDataObj = new FormData();
            formDataObj.append('file', file);

            const uploadResponse = await axios.post(
                'http://localhost:9000/api/faculty/upload',
                formDataObj,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Session-ID': sessionId,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (uploadResponse.data.success) {
                // Then create the assignment with the file URL
                const assignmentData = {
                    title: formData.title,
                    description: formData.description,
                    dueDate: formData.dueDate,
                    maxMarks: parseInt(formData.maxMarks),
                    assignmentFile: uploadResponse.data.fileUrl
                };

                // Updated URL to match the backend route
                const response = await axios.post(
                    `http://localhost:9000/api/faculty/classrooms/${classroom._id}/assignments`,
                    assignmentData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'X-Session-ID': sessionId
                        }
                    }
                );

                if (response.data.success) {
                    onClose();
                }
            }
        } catch (error) {
            console.error('Assignment creation error:', error);
            setError(error.response?.data?.message || 'Failed to create assignment');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
                <p className="text-gray-600 mb-4">For: {classroom.name}</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows="4"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Maximum Marks</label>
                            <input
                                type="number"
                                value={formData.maxMarks}
                                onChange={(e) => setFormData({...formData, maxMarks: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                                min="0"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Upload Assignment PDF (Max 5MB)
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
                            {uploading ? 'Creating...' : 'Create Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignmentModal; 