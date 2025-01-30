import React, { useState, useEffect } from 'react';

const CreateClassroomModal = ({ onClose, onSubmit, classroom = null, isEditing = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        description: '',
        studentEmails: ''
    });

    useEffect(() => {
        if (classroom) {
            setFormData({
                name: classroom.name || '',
                subject: classroom.subject || '',
                description: classroom.description || '',
                studentEmails: classroom.studentEmails?.join(', ') || ''
            });
        }
    }, [classroom]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Split emails by comma and trim whitespace
        const studentEmails = formData.studentEmails
            .split(',')
            .map(email => email.trim())
            .filter(email => email);
        
        onSubmit({
            ...formData,
            studentEmails
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">
                    {isEditing ? 'Edit Classroom' : 'Create New Classroom'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
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
                                rows="3"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Student Emails (comma-separated)
                            </label>
                            <textarea
                                value={formData.studentEmails}
                                onChange={(e) => setFormData({...formData, studentEmails: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows="3"
                                placeholder="student1@example.com, student2@example.com"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Optional: Enter student emails to send invitations
                            </p>
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
                            {isEditing ? 'Update Classroom' : 'Create Classroom'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateClassroomModal; 