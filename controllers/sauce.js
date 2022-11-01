// Import les models
const Sauce = require('../models/Sauce');
// Gère les fichiers stockés
const fs = require('fs');

// Création d'une sauce (POST)
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    // Compteur de like et de dislike mis à 0 lors de la création de la sauce
    sauce.likes = 0;
    sauce.dislikes = 0;
  
    // Sauce sauvegardée
    sauce.save()
    // Message de réussite
    .then(() => { res.status(201).json({message: 'Sauce enregistrée !'})})
    // Message d'erreur
    .catch(error => { res.status(400).json( { error })})
 };

// Affichage d'une sauce (GET)
 exports.getOneSauce = (req, res, next) => {
     Sauce.findOne({_id: req.params.id})
     // Message réussite
      .then((sauce) => res.status(200).json(sauce))
    // Message d'erreur
      .catch((error) => res.status(404).json({error: error}));
  };

// Modification d'une sauce (PUT)
 exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        // Modification image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
  // Sélection de la sauce à modifier grâce à l'id
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
          // Si l'id de l'utilisateur est différent de celui qui l'a créé, alors cette 
          // personne ne sera pas autorisée à modifier la sauce.
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                // Message réussite
                .then(() => res.status(200).json({message : 'Sauce modifiée!'}))
                // Message erreur
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

 // Supression d'une sauce (DELETE)
 exports.deleteSauce = (req, res, next) => {
  // Sélection d'une sauce précise (id de la sauce)
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
          // Si l'id de l'utilisateur est différent de celui qui l'a créé, alors cette 
          // personne ne sera pas autorisée à supprimer la sauce.
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
              // Suppression du fichier image en amont
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                      // Message réussite
                        .then(() => { res.status(200).json({message: 'Sauce supprimée !'})})
                      // Message erreur
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

 // LIKE & DISLIKE pour chaque sauce (POST)
 exports.likeOrNot = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
          if (req.body.like === 1) {
            // On ne peut pas rajouter un like sur une sauce car on l'a déjà fait
              if (sauce.usersLiked.includes(req.body.userId)) {
                res.status(401).json({error: 'Sauce déja liké'});
              }
            // On ajoute un like sur un produit précis (id)
              else {
                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } })
                  .then((sauce) => res.status(200).json({ message: 'Like ajouté !' }))
                  .catch(error => res.status(400).json({ error }))
              }
            }
          else if (req.body.like === -1) {
            // On ne peut pas rajouter un dislike sur une sauce car on l'a déjà fait
              if (sauce.usersDisliked.includes(req.body.userId)) {
                res.status(401).json({error: 'Sauce déja disliké'});
              }
              else {   
              // On ajoute un dislike sur un produit précis (id)
                Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: req.body.like-- }, $push: { usersDisliked: req.body.userId } })
                  .then((sauce) => res.status(200).json({ message: 'Dislike ajouté !' }))
                  .catch(error => res.status(400).json({ error }));
              }
          } 
          else {
            // On supprime un like sur une sauce
              if (sauce.usersLiked.includes(req.body.userId)) {
                Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                  .then((sauce) => { res.status(200).json({ message: 'Like supprimé !' }) })
                  .catch(error => res.status(400).json({ error }));
              } 
            // On supprime un dislike sur une sauce
              else if (sauce.usersDisliked.includes(req.body.userId)) {
                Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                  .then((sauce) => { res.status(200).json({ message: 'Dislike supprimé !' }) })
                  .catch(error => res.status(400).json({ error }));
              }
          }
      })
      .catch( error => {
        res.status(400).json({ error });
      }); 
}

// Affichage de toutes les sauces (GET)
 exports.getAllSauces = (req, res, next) => {
  // Message de réussite
  Sauce.find().then(
      (sauces) => {
        res.status(200).json(sauces);
      }
  // Message d'erreur
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

