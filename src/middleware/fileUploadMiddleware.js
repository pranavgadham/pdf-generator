import multer from 'multer';

export default function xlsxFileUpload(fileType) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads'); // Ensure the 'uploads' directory exists
        },
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .xlsx files are allowed!'), false);
        }
    };

    return multer({ storage, fileFilter }).single(fileType);
}