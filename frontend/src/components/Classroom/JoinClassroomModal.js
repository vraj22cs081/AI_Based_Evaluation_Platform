import React, { useState } from 'react';

const JoinClassroomModal = ({ onClose, onSubmit }) => {
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!roomCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        onSubmit(roomCode.trim().toUpperCase());
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Join Classroom</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Room Code</label>
                            <input
                                type="text"
                                value={roomCode}
                                onChange={(e) => {
                                    setRoomCode(e.target.value);
                                    setError('');
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter room code"
                                required
                            />
                            {error && (
                                <p className="mt-1 text-sm text-red-600">{error}</p>
                            )}
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
                            Join Classroom
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinClassroomModal; 