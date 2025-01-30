import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AssignmentStatistics = ({ statistics }) => {
    const gradeData = {
        labels: Object.keys(statistics.gradeDistribution),
        datasets: [
            {
                label: 'Number of Students',
                data: Object.values(statistics.gradeDistribution),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Assignment Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded">
                    <h3 className="font-semibold text-gray-700">Submission Status</h3>
                    <p className="text-gray-600">
                        Total Students: {statistics.totalStudents}
                    </p>
                    <p className="text-gray-600">
                        Submissions: {statistics.totalSubmissions} ({Math.round(statistics.submissionRate)}%)
                    </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded">
                    <h3 className="font-semibold text-gray-700">Grading Progress</h3>
                    <p className="text-gray-600">
                        Graded: {statistics.gradedSubmissions} ({Math.round(statistics.gradingProgress)}%)
                    </p>
                    <p className="text-gray-600">
                        Average Grade: {Math.round(statistics.averageGrade * 10) / 10}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-4">Grade Distribution</h3>
                <Bar 
                    data={gradeData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Grade Distribution'
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default AssignmentStatistics; 