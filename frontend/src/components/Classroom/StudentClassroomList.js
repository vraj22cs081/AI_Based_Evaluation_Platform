// // components/classroom/StudentClassroomList.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// const StudentClassroomList = () => {
//     const { user } = useAuth();
//     const [classrooms, setClassrooms] = useState([]);
//     const [roomCode, setRoomCode] = useState('');
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [message, setMessage] = useState('');
//     const navigate = useNavigate();

//     const fetchStudentClassrooms = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get('http://localhost:9000/api/classrooms/student-classes', {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });
//             setClassrooms(response.data.classrooms);
//             setIsLoading(false);
//         } catch (error) {
//             console.error('Fetch classrooms error:', error);
//             setError(error.response?.data?.message || 'Failed to fetch classrooms');
//             setIsLoading(false);
//         }
//     };

//     const handleJoinClassroom = async (e) => {
//         e.preventDefault();
//         setError('');
//         setMessage('');

//         try {
//             const response = await axios.post(
//                 'http://localhost:9000/api/classrooms/join',
//                 { roomCode },
//                 { withCredentials: true }
//             );

//             if (response.data.success) {
//                 setMessage('Successfully joined classroom!');
//                 setRoomCode('');
//                 // Fetch updated classroom list after joining
//                 await fetchStudentClassrooms();
//             }
//         } catch (error) {
//             console.error('Join classroom error:', error);
//             setError(error.response?.data?.message || 'Error joining classroom');
//         }
//     };

//     useEffect(() => {
//         fetchStudentClassrooms();
//     }, []);

//     const handleClassroomClick = (classroomId) => {
//         navigate(`/classroom/${classroomId}/assignments`);
//     };

//     return (
//         <div className="max-w-6xl mx-auto">
//             {/* Join Classroom Form */}
//             <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//                 <div className="border-b pb-4 mb-4">
//                     <h2 className="text-2xl font-bold text-gray-800">Join a Classroom</h2>
//                 </div>
//                 <form onSubmit={handleJoinClassroom} className="space-y-4">
//                     <div className="flex gap-4">
//                         <input
//                             type="text"
//                             value={roomCode}
//                             onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
//                             placeholder="Enter room code"
//                             className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                             required
//                         />
//                         <button
//                             type="submit"
//                             className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//                         >
//                             Join Class
//                         </button>
//                     </div>
//                     {error && <p className="text-red-600 mt-2">{error}</p>}
//                     {message && <p className="text-green-600 mt-2">{message}</p>}
//                 </form>
//             </div>

//             {/* Enrolled Classrooms List */}
//             <div className="bg-white rounded-lg shadow-md p-6">
//                 <div className="border-b pb-4 mb-6">
//                     <h2 className="text-2xl font-bold text-gray-800">Your Enrolled Classes</h2>
//                 </div>
                
//                 {isLoading ? (
//                     <div className="text-center py-8">
//                         <div className="text-gray-600">Loading classrooms...</div>
//                     </div>
//                 ) : error ? (
//                     <div className="text-center py-8 bg-gray-50 rounded-lg">
//                         <p className="text-gray-600">{error}</p>
//                     </div>
//                 ) : classrooms.length === 0 ? (
//                     <div className="text-center py-8 bg-gray-50 rounded-lg">
//                         <p className="text-gray-600">You haven't joined any classrooms yet.</p>
//                     </div>
//                 ) : (
//                     <div className="grid gap-6 md:grid-cols-2">
//                         {classrooms.map(classroom => (
//                             <div 
//                                 key={classroom._id} 
//                                 className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
//                                 onClick={() => handleClassroomClick(classroom._id)}
//                             >
//                                 <div className="bg-white p-4">
//                                     <h3 className="text-xl font-semibold text-gray-800 mb-4">
//                                         {classroom.name}
//                                     </h3>
//                                     <div className="space-y-3">
//                                         <p className="text-gray-600 flex items-center">
//                                             <span className="font-medium mr-2">Subject:</span>
//                                             {classroom.subject}
//                                         </p>
//                                         <p className="text-gray-600 flex items-center">
//                                             <span className="font-medium mr-2">Faculty:</span>
//                                             {classroom.faculty.name}
//                                         </p>
//                                         <p className="text-gray-500 text-sm">
//                                             <span className="font-medium mr-2">Contact:</span>
//                                             {classroom.faculty.email}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default StudentClassroomList;