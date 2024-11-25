const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audio.controller');
const middlewares = require('../middlewares/');

/**
 * @swagger
 * tags:
 *   name: Audio
 *   description: Gestion des audios
 */

router.get('/', audioController.getAllAudios);
router.get('/:id', audioController.getAudioById);
router.post('/', middlewares.isAuth, audioController.createAudio);
router.put('/:id', middlewares.isAuth, audioController.updateAudio);
router.delete('/:id', middlewares.isAuth, audioController.deleteAudio);

module.exports = router;
