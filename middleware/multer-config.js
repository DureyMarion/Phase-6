// Module
const multer = require('multer');

// Dictionnaire pour le type d'image acceptée
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Fonction Storage
const storage = multer.diskStorage({ // Configuration de multer
  destination: (req, file, callback) => { // Indique où enregistrer les fichiers
    callback(null, 'images');
  },
  filename: (req, file, callback) => { // Indique le nom du fichier
    const name = file.originalname.split(' ').join('_'); // Retire les potentiels espaces
    const extension = MIME_TYPES[file.mimetype]; // Défini le type
    callback(null, name + Date.now() + '.' + extension); // Génère le nom unique
  }
});

// Nous exportons l'élément configuré Multer, on lui passe la constante Storage et
// indiquons que nous génerons uniquement les téléchargements de fichiers image
module.exports = multer({storage: storage}).single('image');