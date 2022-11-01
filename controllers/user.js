// Modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // Hachage et salage du mot de passe
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // Création d'un nouveau utilisateur
        user.save() // Sauvegarder l'utilisateur dans la base de données
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) // Recherche de l'utilisateur dans la base de données
        .then(user => {
            if (!user) {
                // Retourner une erreur si l'utilisateur n'est pas trouvé un DB
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password) // Comparez le mot de passe testé au mot de passe stocké
                .then(valid => {
                    if (!valid) {
                        // Retourne une erreur si les mots de passe ne correspondent pas
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' } // Session de 24h
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };