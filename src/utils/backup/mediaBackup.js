const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const config = require("../../config");
const { getAllFiles } = require("./fileUtils");
const backupConfig = require("./backup.config");

const archiveMediaFiles = async (timestamp) => {
  const archiveName = `media_backup_${timestamp}.zip`;
  const archivePath = path.join(backupConfig.paths.temp, archiveName);
  config.logger.info(`Création de l'archive média: ${archivePath}`);

  try {
    const output = fs.createWriteStream(archivePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw new Error(`Erreur d'archivage: ${err.message}`);
    });

    const archiveFinished = new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
    });

    archive.pipe(output);

    const processedPaths = new Set();
    for (const [key, mediaPath] of Object.entries(backupConfig.paths.media)) {
      if (fs.existsSync(mediaPath) && !processedPaths.has(mediaPath)) {
        processedPaths.add(mediaPath);

        const safeFolderName = key.replace(/[<>:"/\\|?*]/g, "_");
        const files = getAllFiles(mediaPath);

        for (const filePath of files) {
          const relativePath = path
            .relative(mediaPath, filePath)
            .split(path.sep)
            .map((part) => part.replace(/[<>:"/\\|?*]/g, "_"))
            .join("/");

          archive.append(fs.createReadStream(filePath), {
            name: `${safeFolderName}/${relativePath}`,
            date: new Date()
          });
        }
      }
    }

    await archive.finalize();
    await archiveFinished;

    return archivePath;
  } catch (error) {
    throw new Error(
      `Erreur lors de l'archivage des fichiers média: ${error.message}`
    );
  }
};

module.exports = { archiveMediaFiles };
