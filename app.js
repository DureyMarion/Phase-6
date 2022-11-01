// Modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Importation des models
const Sauce = require('./models/Sauce');
const User = require('./models/User');

// Importation des routes
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

// Connexion à la base de donnée
mongoose.connect(process.env.DB,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
// Message de réussite
  .then(() => console.log('Connexion à MongoDB réussie !'))
// Message d'erreur
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Démarage express
const app = express();
app.use(express.json());


// Paramètrage des headers
app.use((req, res, next) => { // Evite les erreurs CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // * = tous les serveurs !NON! Http:...
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// bodyParser
// Rend le corps de la requête exploitable facilement
app.use(bodyParser.json());

// Gestionnaire des routes
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/api/sauces', sauceRoutes)
app.use('/api/auth', userRoutes)

module.exports = app;