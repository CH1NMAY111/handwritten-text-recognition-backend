const express = require('express');
const fileUpload = require('express-fileupload');
const tesseract = require('node-tesseract-ocr');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware for file upload and CORS
app.use(fileUpload());
app.use(cors());

// Endpoint to upload image and perform OCR
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const imageFile = req.files.image;
    const uploadPath = path.join(__dirname, 'uploads', imageFile.name);

    // Save the uploaded file to 'uploads' directory
    imageFile.mv(uploadPath, (err) => {
        if (err) return res.status(500).send(err);

        const config = {
            lang: 'eng',
            oem: 1,
            psm: 3,
        };

        // Perform OCR on the uploaded image
        tesseract
            .recognize(uploadPath, config)
            .then((text) => {
                console.log('Recognized text:', text);
                res.json({ text });
            })
            .catch((err) => {
                console.error('Error:', err);
                res.status(500).send('Error processing image');
            })
            .finally(() => {
                // Optional: delete the file after OCR
                fs.unlinkSync(uploadPath);
            });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
