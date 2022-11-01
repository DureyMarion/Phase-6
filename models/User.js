// Modules
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // S'assure de ne pas avoir deux mêmes adresses mail

// Schéma de l'utilisateur
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);