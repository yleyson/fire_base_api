
const TextRouter = require('express').Router();

require('dotenv').config();

const admin = require('firebase-admin');

const { getStorage } = require('firebase-admin/storage');

const uuid = require('uuid-v4');

const multer = require('multer');

const upload = multer({
    limits: {
        fileSize: 1024 * 1024 * 5,
    }
});

const stream = require("stream");

const firebaseConfig = {
    "type": process.env.TYPE,
    "project_id": process.env.PROJECT_ID,
    "private_key_id": process.env.PRIVATE_KEY_ID,
    "private_key": process.env.PRIVATE_KEY,
    "client_email": process.env.CLIENT_EMAIL,
    "client_id": process.env.CLIENT_ID,
    "auth_uri": process.env.AUTH_URI,
    "token_uri": process.env.TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
}


const app = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: process.env.STORAGE_BUCKET
});

const bucket = getStorage(app).bucket();

TextRouter.post('/', upload.single('file'), async (req, res) => {

    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    let file_name = `images/${req.file.originalname},${new Date()}`

    const bufferStream = new stream.PassThrough();

    bufferStream.end(req.file.buffer);

    const file = bucket.file(`${file_name}.png`);

    const options = {
        destination: `${file_name}.png`,
        contentType: 'image/png',
        metadata: {
            metadata: {
                firebaseStorageDownloadTokens: uuid(),
            }
        }
    }

    bufferStream
        .pipe(file.createWriteStream(options))
        .on('error', (error) => res.status(400).send(error))
        .on('finish', async () => {
            const downloadPath = encodeURIComponent(`${file_name}.png`);
            const downloadUrl = `${process.env.IMAGE_BASE_URL}${downloadPath}?alt=media&token=${uuid()}`
            console.log('fgfgfgfgfgfgf', downloadUrl)
            res.status(201).json(downloadUrl);

        });

});

module.exports = TextRouter;
