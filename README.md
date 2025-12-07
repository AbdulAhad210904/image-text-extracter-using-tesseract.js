# Image Text Detection API

A production-ready REST API for extracting text from images using OCR (Optical Character Recognition) powered by Tesseract.js.

## Features

- ✅ Image text recognition using Tesseract.js
- ✅ Support for multiple image formats (JPEG, PNG, GIF, BMP, WEBP, TIFF)
- ✅ Multi-language support
- ✅ File upload with validation
- ✅ Error handling and validation
- ✅ CORS enabled for cross-origin requests
- ✅ Production-ready code structure

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Usage

### Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in the PORT environment variable).

### API Endpoints

#### 1. Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Text Recognition

**POST** `/api/recognize-text`

Extract text from an uploaded image.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `image` (file, required): The image file to process
  - `language` (string, optional): Language code for OCR (default: "eng")
    - Examples: "eng" (English), "fra" (French), "spa" (Spanish), "deu" (German), etc.

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "text": "Extracted text from image",
    "confidence": 95.5,
    "wordCount": 10,
    "language": "eng",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Testing with Postman

1. **Open Postman** and create a new request
2. **Set method to POST**
3. **URL:** `http://localhost:3000/api/recognize-text`
4. **Go to Body tab** → Select `form-data`
5. **Add a key named `image`** → Change type to `File` → Select your image file
6. **Optionally add a key named `language`** → Set value (e.g., "eng", "fra", "spa")
7. **Click Send**

### Example Postman Setup:

- **Method:** POST
- **URL:** `http://localhost:3000/api/recognize-text`
- **Body (form-data):**
  - `image`: [Select File] (type: File)
  - `language`: `eng` (type: Text, optional)

## Supported Languages

Tesseract.js supports 100+ languages. Common language codes:
- `eng` - English
- `fra` - French
- `spa` - Spanish
- `deu` - German
- `ita` - Italian
- `por` - Portuguese
- `chi_sim` - Chinese (Simplified)
- `jpn` - Japanese
- `kor` - Korean
- `ara` - Arabic

For a complete list, visit: https://tesseract-ocr.github.io/tessdoc/Data-Files

## File Limits

- **Maximum file size:** 10MB
- **Supported formats:** JPEG, JPG, PNG, GIF, BMP, WEBP, TIFF

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid file, missing file, etc.)
- `404` - Endpoint not found
- `500` - Internal server error

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Project Structure

```
Image-Text-Detection/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── uploads/          # Temporary upload directory
└── README.md         # This file
```

## Notes

- Uploaded files are automatically deleted after processing
- The API uses Tesseract.js workers which are initialized per request
- For production deployment, consider adding:
  - Rate limiting
  - Authentication/Authorization
  - Logging service
  - Database for storing results (optional)
  - Load balancing for high traffic

