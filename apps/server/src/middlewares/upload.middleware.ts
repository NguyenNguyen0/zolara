import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Create multer instance
const upload = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (req, file, callback) => {
		// Only allow images
		if (!file.mimetype.startsWith('image/')) {
			return callback(new Error('Only image files are allowed'));
		}
		callback(null, true);
	},
});

// Middleware for single file upload
export const uploadImage = upload.single('image');

// Error handler middleware
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
	if (err instanceof multer.MulterError) {
		// A Multer error occurred when uploading
		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({
				status: 'error',
				message: 'File too large. Maximum size is 5MB',
			});
		}
		return res.status(400).json({
			status: 'error',
			message: `Upload error: ${err.message}`,
		});
	} else if (err) {
		// An unknown error occurred
		return res.status(400).json({
			status: 'error',
			message: err.message || 'File upload failed',
		});
	}
	next();
};
