import React, { useState } from 'react';

const AssignmentEditModal = ({ assignment, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: assignment.title,
        description: assignment.description,
        dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
        maxMarks: assignment.maxMarks
    });
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            if (selectedFile.size <= 5 * 1024 * 1024) {
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
        setUploading(true);

        try {
            let fileUrl = assignment.assignmentFile;

            if (file) {
                const formDataObj = new FormData();
                formDataObj.append('file', file);
                
                const sessionId = sessionStorage.getItem('sessionId');
                const token = sessionStorage.getItem(`token_${sessionId}`);
                
                const uploadResponse = await fetch('http://localhost:9000/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    },
                    body: formDataObj
                });

                const uploadResult = await uploadResponse.json();
                
                if (uploadResult.success) {
                    fileUrl = uploadResult.fileUrl;
                } else {
                    throw new Error(uploadResult.message);
                }
            }

            await onSubmit({
                ...formData,
                assignmentFile: fileUrl
            });
        } catch (error) {
            setError(error.message || 'Failed to update assignment');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Edit Assignment</h2>
                
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Update Assignment PDF (Optional)
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
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-1">{error}</p>
                            )}
                        </div>

                        <div>
                            <p className="text-sm text-gray-600">
                                Current file: <a href={assignment.assignmentFile} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">View</a>
                            </p>
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
                            disabled={uploading}
                        >
                            {uploading ? 'Updating...' : 'Update Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignmentEditModal; 