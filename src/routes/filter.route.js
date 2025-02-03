const express = require("express");
const router = express.Router();
const filterController = require("../controllers/filter.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     Audio:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         duration:
 *           type: number
 *         releaseDate:
 *           type: string
 *           format: date
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         popularity:
 *           type: number
 *         artist:
 *           type: string
 *           description: Artist ID reference
 *         album:
 *           type: string
 *           description: Album ID reference
 *
 *     Album:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         releaseDate:
 *           type: string
 *           format: date
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         artist:
 *           type: string
 *           description: Artist ID reference
 *
 *     Artist:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         error:
 *           type: object
 */

/**
 * @swagger
 * tags:
 *   name: Filters
 *   description: API endpoints for filtering music data
 */

/**
 * @swagger
 * /api/filter/genres:
 *   get:
 *     summary: Get all unique genres across albums, tracks and artists
 *     tags: [Filters]
 *     responses:
 *       200:
 *         description: List of all unique genres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/filter/artists/genre/{genre}:
 *   get:
 *     summary: Get all artists of a specific genre
 *     tags: [Filters]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre to filter artists by
 *     responses:
 *       200:
 *         description: List of artists in the specified genre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artist'
 *       404:
 *         description: No artists found for this genre
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/filter/albums/artist/{artistId}:
 *   get:
 *     summary: Get all albums by a specific artist
 *     tags: [Filters]
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the artist
 *     responses:
 *       200:
 *         description: List of albums by the artist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 *       404:
 *         description: No albums found for this artist
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/filter/albums/year/{year}:
 *   get:
 *     summary: Get all albums released in a specific year
 *     tags: [Filters]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: Release year (YYYY)
 *     responses:
 *       200:
 *         description: List of albums from the specified year
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 *       404:
 *         description: No albums found for this year
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/filter/albums/genre/{genre}:
 *   get:
 *     summary: Get all albums of a specific genre
 *     tags: [Filters]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre to filter albums by
 *     responses:
 *       200:
 *         description: List of albums in the specified genre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Album'
 *       404:
 *         description: No albums found for this genre
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/filter/tracks/artist/{artistId}:
 *   get:
 *     summary: Get all tracks by a specific artist
 *     tags: [Filters]
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the artist
 *     responses:
 *       200:
 *         description: List of tracks by the artist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Audio'
 *       404:
 *         description: No tracks found for this artist
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/filter/tracks/album/{albumId}:
 *   get:
 *     summary: Get all tracks from a specific album
 *     tags: [Filters]
 *     parameters:
 *       - in: path
 *         name: albumId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the album
 *     responses:
 *       200:
 *         description: List of tracks in the album
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Audio'
 *       404:
 *         description: No tracks found for this album
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/filter/tracks/year/{year}:
 *   get:
 *     summary: Get all tracks released in a specific year
 *     tags: [Filters]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: Release year (YYYY)
 *     responses:
 *       200:
 *         description: List of tracks from the specified year
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Audio'
 *       404:
 *         description: No tracks found for this year
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/filter/tracks/genre/{genre}:
 *   get:
 *     summary: Get all tracks of a specific genre
 *     tags: [Filters]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre to filter tracks by
 *     responses:
 *       200:
 *         description: List of tracks in the specified genre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Audio'
 *       404:
 *         description: No tracks found for this genre
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/filter/tracks/duration/{range}:
 *   get:
 *     summary: Get tracks filtered by duration range
 *     tags: [Filters]
 *     parameters:
 *       - in: path
 *         name: range
 *         required: true
 *         schema:
 *           type: string
 *           enum: [short, medium, long]
 *         description: Duration range (short < 3min, medium 3-5min, long > 5min)
 *     responses:
 *       200:
 *         description: List of tracks within the specified duration range
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Audio'
 *       400:
 *         description: Invalid duration range
 *       404:
 *         description: No tracks found in this duration range
 *       500:
 *         description: Server error
 */

router.get("/genres", filterController.getAllGenres);
router.get("/artists/genre/:genre", filterController.getArtistsByGenre);

router.get("/albums/artist/:artistId", filterController.getAlbumsByArtist);
router.get("/albums/year/:year", filterController.getAlbumsByYear);
router.get("/albums/genre/:genre", filterController.getAlbumsByGenre);

router.get("/tracks/artist/:artistId", filterController.getTracksByArtist);
router.get("/tracks/album/:albumId", filterController.getTracksByAlbum);
router.get("/tracks/year/:year", filterController.getTracksByYear);
router.get("/tracks/genre/:genre", filterController.getTracksByGenre);
router.get("/tracks/duration/:range", filterController.getTracksByDuration);

module.exports = router;
