const express = require('express');
const router = express.Router();
const albumController = require('../controllers/album.controller');
const middlewares = require('../middlewares/');

/**
 * @swagger
 * tags:
 *   name: Album
 *   description: Gestion des albums
 */

router.get('/', albumController.getAllAlbums);
router.get('/:id', albumController.getAlbumById);
router.post('/', middlewares.isAuth, albumController.createAlbum);
router.put('/:id', middlewares.isAuth, albumController.updateAlbum);
router.delete('/:id', middlewares.isAuth, albumController.deleteAlbum);

module.exports = router;
