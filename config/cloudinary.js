const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configura o Cloudinary com as suas chaves do .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configura o armazenamento (onde e como vai salvar a foto)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'izejet_catalogo', // Cria uma pasta organizada lá no Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }] // Já compacta a imagem sozinho!
  }
});

const upload = multer({ storage: storage });

module.exports = upload;