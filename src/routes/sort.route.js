const express = require("express");
const router = express.Router();
const sortController = require("../controllers/sort.controller");

/**
 * @swagger
 * components:
 *   parameters:
 *     orderParam:
 *       in: query
 *       name: order
 *       schema:
 *         type: string
 *         enum: [asc, desc]
 *         default: asc
 *       required: false
 *       description: Sort order (ascending or descending)
 *
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         error:
 *           type: object
 *
 *     Audio:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         duration:
 *           type: number
 *         popularity:
 *           type: number
 *
 *     Album:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         releaseDate:
 *           type: string
 *           format: date
 *         trackCount:
 *           type: number
 *         popularity:
 *           type: number
 *
 *     Artist:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         popularity:
 *           type: number
 *
 *     Playlist:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         trackCount:
 *           type: number
 */

/**
 * @swagger
 * tags:
 *   name: Sorting
 *   description: API endpoints for sorting music-related data
 */

/**
 * @swagger
 * /api/sort/audios/duration:
 *   get:
 *     summary: Get audios sorted by duration
 *     tags: [Sorting]
 *     parameters:
 *       - $ref: '#/components/parameters/orderParam'
 *     responses:
 *       200:
 *         description: List of audios sorted by duration
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Audio'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/sort/albums/date:
 *   get:
 *     summary: Get albums sorted by release date
 *     tags: [Sorting]
 *     parameters:
 *       - $ref: '#/components/parameters/orderParam'
 *     responses:
 *       200:
 *         description: List of albums sorted by release date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/sort/artists/alphabetical:
 *   get:
 *     summary: Get artists sorted alphabetically
 *     tags: [Sorting]
 *     parameters:
 *       - $ref: '#/components/parameters/orderParam'
 *     responses:
 *       200:
 *         description: List of artists sorted by name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artist'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/sort/playlist/tracks:
 *   get:
 *     summary: Get playlists sorted by number of tracks
 *     tags: [Sorting]
 *     parameters:
 *       - $ref: '#/components/parameters/orderParam'
 *     responses:
 *       200:
 *         description: List of playlists sorted by track count
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Playlist'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/sort/audios/popularity:
 *   get:
 *     summary: Get audios sorted by popularity
 *     tags: [Sorting]
 *     parameters:
 *       - $ref: '#/components/parameters/orderParam'
 *     responses:
 *       200:
 *         description: List of audios sorted by popularity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Audio'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/sort/albums/popularity:
 *   get:
 *     summary: Get albums sorted by popularity
 *     tags: [Sorting]
 *     parameters:
 *       - $ref: '#/components/parameters/orderParam'
 *     responses:
 *       200:
 *         description: List of albums sorted by popularity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/sort/artists/popularity:
 *   get:
 *     summary: Get artists sorted by popularity
 *     tags: [Sorting]
 *     parameters:
 *       - $ref: '#/components/parameters/orderParam'
 *     responses:
 *       200:
 *         description: List of artists sorted by popularity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artist'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/sort/albums/tracks:
 *   get:
 *     summary: Get albums sorted by number of tracks
 *     tags: [Sorting]
 *     parameters:
 *       - $ref: '#/components/parameters/orderParam'
 *     responses:
 *       200:
 *         description: List of albums sorted by track count
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/sort/audios/alphabetical:
 *   get:
 *     summary: Get tracks sorted alphabetically by title
 *     tags: [Sorting]
 *     parameters:
 *       - $ref: '#/components/parameters/orderParam'
 *     responses:
 *       200:
 *         description: List of tracks sorted by title
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Audio'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/sort/albums/released:
 *   get:
 *     summary: Get albums sorted by release date
 *     tags: [Sorting]
 *     parameters:
 *       - $ref: '#/components/parameters/orderParam'
 *     responses:
 *       200:
 *         description: List of albums sorted by release date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get("/audios/duration/", sortController.getAudiosSortedByDuration);
router.get("/albums/date", sortController.getAlbumSortedByDate);
router.get("/artists/alphabetical", sortController.getArtistsSortedByAlphabet);
router.get(
  "/playlist/tracks",
  sortController.getPlaylistBySortedByNumberOfTracks
);
router.get("/audios/popularity", sortController.getAudiosSortedByPopularity);
router.get("/albums/popularity", sortController.getAlbumsSortedByPopularity);
router.get("/artists/popularity", sortController.getArtistsSortedByPopularity);
router.get("/albums/tracks", sortController.getAlbumsSortedByNumberOfTracks);
router.get(
  "/audios/alphabetical",
  sortController.getTracksSortedByAlphabetOfTheTitle
);
router.get("/albums/released", sortController.getAlbumsSortedByReleaseDate);
module.exports = router;
