const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controller');

/**
 * @swagger
 * tags:
 *   name: Playlist
 *   description: Gestion des playlist
 */

router.get('/', playlistController.getAllPlaylists);
router.get('/:id', playlistController.getPlaylistById);
router.post('/', playlistController.createPlaylist);
router.put('/:id', playlistController.updatePlaylist);
router.put('/:id/addTrack', playlistController.addTrackToPlaylist);
router.put('/:id/removeTrack', playlistController.removeTrackFromPlaylist);
router.delete('/:id', playlistController.deletePlaylist);

module.exports = router;
