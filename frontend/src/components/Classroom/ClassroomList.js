// // components/classroom/ClassroomList.jsx
// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const ClassroomList = ({ classrooms, onRefresh }) => {
//     const navigate = useNavigate();

//     const handleClassroomClick = (classroomId) => {
//         navigate(`/classroom/${classroomId}/assignments`);
//     };

//     return (
//         <div className="max-w-6xl mx-auto">
//             {/* Classrooms List */}
//             <div className="bg-white rounded-lg shadow-md p-6">
//                 <div className="flex justify-between items-center mb-6 border-b pb-4">
//                     <h2 className="text-2xl font-bold text-gray-800">Your Classrooms</h2>
//                     <button 
//                         onClick={onRefresh}
//                         className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//                     >
//                         Refresh List
//                     </button>
//                 </div>
                
//                 {classrooms.length === 0 ? (
//                     <div className="text-center py-8 bg-gray-50 rounded-lg">
//                         <p className="text-gray-600">No classrooms created yet.</p>
//                     </div>
//                 ) : (
//                     <div className="grid gap-6 md:grid-cols-2">
//                         {classrooms.map(classroom => (
//                             <div 
//                                 key={classroom._id} 
//                                 className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
//                                 onClick={() => handleClassroomClick(classroom._id)}
//                             >
//                                 {/* Classroom Header */}
//                                 <div className="bg-white p-4 border-b border-gray-200">
//                                     <h3 className="text-xl font-semibold text-gray-800 mb-3">
//                                         {classroom.name}
//                                     </h3>
//                                     <div className="space-y-3">
//                                         <p className="text-gray-600 flex items-center">
//                                             <span className="font-medium mr-2">Subject:</span>
//                                             {classroom.subject}
//                                         </p>
//                                         <div className="bg-blue-50 p-2 rounded-md inline-block">
//                                             <p className="text-gray-700">
//                                                 <span className="font-medium mr-2">Room Code:</span>
//                                                 <span className="font-mono">{classroom.roomCode}</span>
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
                                
//                                 {/* Students Section */}
//                                 <div className="p-4 border-b border-gray-200">
//                                     <h4 className="font-medium text-gray-700 mb-3">Students</h4>
//                                     {classroom.students?.length === 0 ? (
//                                         <p className="text-gray-500 italic">No students joined yet</p>
//                                     ) : (
//                                         <ul className="space-y-2">
//                                             {classroom.students?.map(student => (
//                                                 <li key={student._id} className="text-gray-600">
//                                                     <div className="flex items-center">
//                                                         <span className="mr-2">•</span>
//                                                         <span className="font-medium">{student.name}</span>
//                                                         <span className="text-gray-400 text-sm ml-2">
//                                                             ({student.email})
//                                                         </span>
//                                                     </div>
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     )}
//                                 </div>
                                
//                                 {/* Pending Invites Section */}
//                                 <div className="p-4 bg-white">
//                                     <h4 className="font-medium text-gray-700 mb-3">Pending Invites</h4>
//                                     {classroom.invitedEmails?.filter(invite => invite.status === 'pending').length === 0 ? (
//                                         <p className="text-gray-500 italic">No pending invites</p>
//                                     ) : (
//                                         <ul className="space-y-2">
//                                             {classroom.invitedEmails
//                                                 ?.filter(invite => invite.status === 'pending')
//                                                 .map((invite, index) => (
//                                                     <li key={index} className="text-gray-600">
//                                                         <div className="flex items-center">
//                                                             <span className="mr-2">•</span>
//                                                             {invite.email}
//                                                         </div>
//                                                     </li>
//                                                 ))
//                                             }
//                                         </ul>
//                                     )}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ClassroomList;