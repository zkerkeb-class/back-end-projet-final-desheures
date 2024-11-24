const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artist.controller');
const middlewares = require('../middlewares/');

router.post('/', middlewares.isAuth, artistController.createArtist);
router.put('/:id', middlewares.isAuth, artistController.updateArtist);
router.delete('/:id', middlewares.isAuth, artistController.deleteArtist);
router.get('/', artistController.getAllArtists);
router.get('/:id', artistController.getArtistById);

module.exports = router;
