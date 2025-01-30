// // components/classroom/CreateClassroom.jsx
// import React, { useState } from 'react';
// import axios from 'axios';

// const CreateClassroom = ({ onClassroomCreated }) => {
//     const [formData, setFormData] = useState({
//         name: '',
//         subject: '',
//         description: '',
//         studentEmails: ''
//     });
//     const [isLoading, setIsLoading] = useState(false);
//     const [message, setMessage] = useState('');
//     const [messageType, setMessageType] = useState(''); // 'success' or 'error'

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setMessage('');
        
//         try {
//             const studentEmailList = formData.studentEmails
//                 .split(',')
//                 .map(email => email.trim())
//                 .filter(email => email); // Remove empty entries

//             const token = localStorage.getItem('token');
//             const response = await axios.post(
//                 'http://localhost:9000/api/classrooms/create',
//                 {
//                     ...formData,
//                     studentEmails: studentEmailList
//                 },
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                     withCredentials: true
//                 }
//             );

//             if (response.data.success) {
//                 setMessageType('success');
//                 setMessage('Classroom created successfully!');
//                 setFormData({
//                     name: '',
//                     subject: '',
//                     description: '',
//                     studentEmails: ''
//                 });
//                 // Call the callback function to refresh the classroom list
//                 if (onClassroomCreated) {
//                     onClassroomCreated();
//                 }
//             }
//         } catch (error) {
//             setMessageType('error');
//             setMessage(error.response?.data?.message || 'Failed to create classroom');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold mb-6">Create a Classroom</h2>
//             <form onSubmit={handleSubmit}>
//                 <div className="mb-4">
//                     <label className="block text-sm font-medium mb-2">Classroom Name</label>
//                     <input
//                         type="text"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//                         required
//                     />
//                 </div>

//                 <div className="mb-4">
//                     <label className="block text-sm font-medium mb-2">Subject</label>
//                     <input
//                         type="text"
//                         name="subject"
//                         value={formData.subject}
//                         onChange={handleChange}
//                         className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//                         required
//                     />
//                 </div>

//                 <div className="mb-4">
//                     <label className="block text-sm font-medium mb-2">Description</label>
//                     <textarea
//                         name="description"
//                         value={formData.description}
//                         onChange={handleChange}
//                         className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//                         rows="3"
//                     />
//                 </div>

//                 <div className="mb-4">
//                     <label className="block text-sm font-medium mb-2">
//                         Student Emails (comma-separated)
//                     </label>
//                     <textarea
//                         name="studentEmails"
//                         value={formData.studentEmails}
//                         onChange={handleChange}
//                         className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//                         rows="3"
//                         placeholder="student1@example.com, student2@example.com"
//                     />
//                 </div>

//                 {message && (
//                     <div className={`mb-4 p-3 rounded ${
//                         messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                     }`}>
//                         {message}
//                     </div>
//                 )}

//                 <button
//                     type="submit"
//                     className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
//                     disabled={isLoading}
//                 >
//                     {isLoading ? 'Creating...' : 'Create Classroom'}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default CreateClassroom;