const { bucket } = require('../config/firebase.config');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const uploadToFirebase = async (file, folder) => {
    try {
        // Generate a unique filename
        const dateString = new Date().toISOString().replace(/[:.]/g, '-');
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'); // Sanitize filename
        const fileName = `${folder}/${dateString}-${originalName}`;
        const fileBuffer = file.buffer;

        console.log('Uploading to Firebase:', fileName);

        // Create file in bucket
        const blob = bucket.file(fileName);
        
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype
            }
        });

        return new Promise((resolve, reject) => {
            blobStream.on('error', (error) => {
                console.error('Upload stream error:', error);
                reject(new Error(`Unable to upload file: ${error.message}`));
            });

            blobStream.on('finish', async () => {
                try {
                    // Make the file public
                    await blob.makePublic();

                    // Get the public URL
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                    
                    console.log('File uploaded successfully:', {
                        fileName,
                        publicUrl
                    });
                    
                    resolve({
                        success: true,
                        fileUrl: publicUrl,
                        path: fileName // This is the filePath that will be stored in the database
                    });
                } catch (error) {
                    console.error('Error making file public:', error);
                    reject(new Error('Unable to make file public'));
                }
            });

            blobStream.end(fileBuffer);
        });
    } catch (error) {
        console.error('Firebase upload error:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};

const deleteFromFirebase = async (filePath) => {
    try {
        if (!filePath || filePath === 'undefined') {
            console.warn('Invalid file path for deletion:', filePath);
            return { success: false, message: 'Invalid file path' };
        }

        console.log('Deleting file from Firebase:', filePath);
        
        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        
        if (!exists) {
            console.warn('File does not exist:', filePath);
            return { success: true, message: 'File does not exist' };
        }

        await file.delete();
        console.log('File deleted successfully:', filePath);
        
        return { success: true, message: 'File deleted successfully' };
    } catch (error) {
        console.error('Firebase delete error:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};

// Function to delete the uploads folder
const deleteUploadsFolder = () => {
    try {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        
        if (fs.existsSync(uploadsDir)) {
            console.log('Deleting uploads folder...');
            
            // Read directory contents
            const files = fs.readdirSync(uploadsDir);
            
            // Delete each file
            for (const file of files) {
                const filePath = path.join(uploadsDir, file);
                fs.unlinkSync(filePath);
                console.log('Deleted file:', filePath);
            }
            
            // Delete the directory
            fs.rmdirSync(uploadsDir);
            console.log('Uploads folder deleted successfully');
        } else {
            console.log('Uploads folder does not exist');
        }
        
        return { success: true, message: 'Uploads folder deleted successfully' };
    } catch (error) {
        console.error('Error deleting uploads folder:', error);
        return { success: false, message: error.message };
    }
};

/**
 * Downloads a file from Firebase Storage to a local temporary directory
 * @param {String} fileUrl - The Firebase URL of the file to download
 * @param {String} fileName - The name to give the downloaded file
 * @returns {Promise<String>} - The path to the downloaded file
 */
const downloadFromFirebase = async (fileUrl, fileName) => {
    try {
        if (!fileUrl) {
            throw new Error('No file URL provided');
        }

        console.log('Downloading file from Firebase:', fileUrl);
        
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, '..', 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        
        // Generate a temporary file path
        const tempFilePath = path.join(tempDir, fileName || `temp_${Date.now()}.pdf`);
        
        // Download the file from Firebase URL
        const response = await axios({
            method: 'get',
            url: fileUrl,
            responseType: 'arraybuffer'
        });
        
        // Save the file to disk
        fs.writeFileSync(tempFilePath, response.data);
        
        console.log('File downloaded and saved to:', tempFilePath);
        
        return tempFilePath;
    } catch (error) {
        console.error('Error downloading file from Firebase:', error);
        throw error;
    }
};

module.exports = { 
    uploadToFirebase, 
    deleteFromFirebase,
    deleteUploadsFolder,
    downloadFromFirebase
}; 