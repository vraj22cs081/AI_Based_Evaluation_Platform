const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const PDFParser = require('pdf2json');

/**
 * Extracts text from a PDF file using pdf2json
 * @param {String} pdfUrl - URL of the PDF file
 * @returns {Promise<String>} - Extracted text
 */
const extractTextFromPdf = async (pdfUrl) => {
    try {
        console.log('Downloading PDF from URL:', pdfUrl);
        
        // Download the PDF file
        const response = await axios({
            method: 'get',
            url: pdfUrl,
            responseType: 'arraybuffer'
        });
        
        if (!response.data || response.data.length === 0) {
            throw new Error('Empty PDF file received');
        }
        
        console.log('PDF downloaded successfully, size:', response.data.length, 'bytes');
        
        // Save the PDF to a temporary file
        const tempDir = path.join(__dirname, '..', 'temp');
        
        // Create temp directory if it doesn't exist
        try {
            await fs.mkdir(tempDir, { recursive: true });
        } catch (err) {
            console.log('Temp directory already exists or could not be created');
        }
        
        const tempFilePath = path.join(tempDir, `temp_${Date.now()}.pdf`);
        await fs.writeFile(tempFilePath, response.data);
        
        console.log('PDF saved temporarily at:', tempFilePath);
        
        // Use pdf2json to extract text
        const pdfText = await extractPDFTextWithParser(tempFilePath);
        console.log('Text extracted successfully, length:', pdfText.length, 'characters');
        
        // Clean up the temporary file
        try {
            await fs.unlink(tempFilePath);
            console.log('Temporary PDF file deleted');
        } catch (err) {
            console.error('Error deleting temporary file:', err);
        }
        
        return pdfText;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return "";
    }
};

/**
 * Helper function to extract text from PDF using pdf2json
 * @param {String} filePath - Path to the PDF file
 * @returns {Promise<String>} - Extracted text
 */
const extractPDFTextWithParser = async (filePath) => {
    try {
        const pdfParser = new PDFParser(null, 1);
        const pdfText = await new Promise((resolve, reject) => {
            pdfParser.on('pdfParser_dataReady', (pdfData) => {
                let text = '';
                for (let page of pdfData.Pages) {
                    for (let textItem of page.Texts) {
                        // Handle each text element properly
                        if (textItem.R && textItem.R.length > 0) {
                            text += textItem.R.map(r => decodeURIComponent(r.T)).join('') + ' ';
                        }
                    }
                    text += '\n'; // Add newline between pages
                }
                resolve(text.trim());
            });
            pdfParser.on('pdfParser_dataError', reject);
            pdfParser.loadPDF(filePath);
        });
        return pdfText;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw error;
    }
};

/**
 * Generates ideal answers using GROQ API
 * @param {String} title - Assignment title
 * @param {String} description - Assignment description
 * @param {String} assignmentText - Text extracted from PDF
 * @param {Number} maxMarks - Maximum marks for the assignment
 * @returns {Object} - Ideal answers object
 */
const generateIdealAnswers = async (title, description, assignmentText, maxMarks) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY environment variable is not set');
        }

        console.log('Generating ideal answers via GROQ API');
        console.log('Assignment text length:', assignmentText?.length || 0, 'characters');
        
        // Limit the length of assignment text to avoid token limits
        const truncatedText = assignmentText?.substring(0, 10000) || '';
        
        const idealAnswersResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "You are a subject matter expert creating ideal answers and marking criteria. Keep answers concise and within token limits."
                    },
                    {
                        role: "user",
                        content: `
                            Based on this assignment:
                            Title: ${title}
                            Description: ${description}
                            Content: ${truncatedText}

                            Create a concise ideal answer sheet with marking criteria.
                            Keep each answer under 200 words.
                            
                            Respond ONLY with this exact JSON structure:
                            {
                                "questions": [
                                    {
                                        "questionNumber": number,
                                        "idealAnswer": "brief answer",
                                        "keyPoints": ["point1", "point2"],
                                        "maxMarks": number,
                                        "markingCriteria": ["criteria1", "criteria2"]
                                    }
                                ],
                                "totalMarks": ${maxMarks}
                            }
                        `
                    }
                ],
                max_tokens: 4000,
                temperature: 0.1
            },
            {
                headers: { 
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Parse and validate the response
        let idealAnswers;
        try {
            const responseContent = idealAnswersResponse.data.choices[0].message.content.trim();
            console.log('Raw AI Response received, length:', responseContent.length, 'characters');
            
            // Clean the response string before parsing
            const cleanedContent = responseContent
                .replace(/[\n\r]/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/\\./g, '')
                .replace(/[^\x20-\x7E]/g, '')
                .replace(/```[^`]*```/g, ''); // Remove code blocks
            
            // Try to extract valid JSON
            const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                idealAnswers = JSON.parse(jsonMatch[0]);
                console.log('Successfully parsed GROQ response into JSON');
            } else {
                throw new Error('No valid JSON found in response');
            }

            // Validate the structure
            if (!idealAnswers.questions || !Array.isArray(idealAnswers.questions)) {
                throw new Error('Invalid response structure');
            }
            
            console.log('Generated ideal answers with', idealAnswers.questions.length, 'questions');
            return idealAnswers;
            
        } catch (parseError) {
            console.error('AI response parsing error:', parseError);
            throw new Error('Failed to parse GROQ response');
        }
    } catch (error) {
        console.error('Error generating ideal answers with GROQ:', error);
        
        // Return default structure if generation fails
        return {
            questions: [{
                questionNumber: 1,
                idealAnswer: "Please review manually. AI generation failed: " + error.message,
                keyPoints: ["Manual review required"],
                maxMarks: maxMarks || 100,
                markingCriteria: ["Review submission thoroughly"]
            }],
            totalMarks: maxMarks || 100
        };
    }
};

/**
 * Fallback question analysis if GROQ API fails
 * @param {String} pdfText - Extracted text from PDF
 * @returns {Array} - Array of question objects
 */
const analyzeQuestions = (pdfText) => {
    // Simple question identification - look for lines with question patterns
    const lines = pdfText.split('\n').filter(line => line.trim() !== '');
    const questions = [];
    let currentQuestion = null;
    let questionNumber = 1;

    // Regular expressions for identifying questions
    const questionPatterns = [
        /^Q(\d+)[.:)]\s*(.*)/i,  // Q1. or Q1) pattern
        /^(\d+)[.:)]\s*(.*)/,    // 1. or 1) pattern
        /question\s*(\d+)[.:)]\s*(.*)/i  // Question 1. pattern
    ];

    // Loop through lines to identify questions
    for (const line of lines) {
        let foundQuestion = false;
        
        // Try to match line against question patterns
        for (const pattern of questionPatterns) {
            const match = line.match(pattern);
            if (match) {
                // If already processing a question, save it
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                
                // Start a new question
                currentQuestion = {
                    questionNumber: parseInt(match[1]) || questionNumber,
                    question: match[2] || line,
                    content: [line],
                    idealAnswer: ""
                };
                
                questionNumber = currentQuestion.questionNumber + 1;
                foundQuestion = true;
                break;
            }
        }
        
        // If not a new question and we're already processing one, add to content
        if (!foundQuestion && currentQuestion) {
            currentQuestion.content.push(line);
            currentQuestion.idealAnswer += line + "\n";
        }
    }
    
    // Add the last question if any
    if (currentQuestion) {
        questions.push(currentQuestion);
    }
    
    // If no questions identified, create a default one with all content
    if (questions.length === 0 && lines.length > 0) {
        questions.push({
            questionNumber: 1,
            question: "General Assignment",
            content: lines,
            idealAnswer: lines.join("\n").substring(0, 500) // Limit size
        });
    }

    return questions;
};

module.exports = {
    extractTextFromPdf,
    generateIdealAnswers,
    analyzeQuestions
}; 