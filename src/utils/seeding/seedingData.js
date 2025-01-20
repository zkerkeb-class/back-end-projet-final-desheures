const fs = require("fs");
const path = require("path");
const Artist = require("../../models/Artist");
const Album = require("../../models/Album");
const Audio = require("../../models/Audio");
const mongoose = require("mongoose");
const config = require("../../config");
mongoose
  .connect(config.env.mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch((err) => {
    config.logger.error("Erreur de connexion à MongoDB:", err);
    process.exit(1);
  });

const seedFromRealData = async () => {
  const filePath = path.join(__dirname, "../../../artists.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  for (const artistData of data.artists) {
    const artist = new Artist({
      name: artistData.name,
      namePhonetic: artistData.namePhonetic,
      genres: artistData.genres,
      bio: artistData.bio,
      imageUrl: artistData.imageUrl,
      socialLinks: artistData.socialLinks,
      popularity: artistData.popularity
    });
    const savedArtist = await artist.save();

    for (const albumData of artistData.albums) {
      const album = new Album({
        title: albumData.title,
        artist: savedArtist._id,
        releaseDate: new Date(albumData.releaseDate),
        genres: albumData.genres,
        coverUrl: albumData.coverUrl,
        popularity: albumData.popularity
      });
      const savedAlbum = await album.save();

      for (const trackData of albumData.tracks) {
        const audio = new Audio({
          title: trackData.title,
          album: savedAlbum._id,
          artist: savedArtist._id,
          duration: trackData.duration,
          audioUrl: trackData.fileUrl,
          genres: albumData.genres,
          popularity: trackData.popularity
        });
        const savedAudio = await audio.save();
        savedAlbum.tracks.push(savedAudio._id);
      }
      await savedAlbum.save();
      savedArtist.albums.push(savedAlbum._id);
    }
    await savedArtist.save();
  }

  config.logger.info("Données réelles importées avec succès !");
};

module.exports = seedFromRealData;
