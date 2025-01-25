const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const config = require("../../config");
const backupConfig = require("./backup.config");
const { promisify } = require("util");
const AdmZip = require("adm-zip");
const archiver = require("archiver");
const execAsync = promisify(exec);

const backupMongoDB = async (timestamp) => {
  const backupPath = path.join(
    backupConfig.paths.temp,
    `mongo_backup_${timestamp}`
  );
  const zipPath = `${backupPath}.zip`;
  config.logger.info(`Début du backup MongoDB vers: ${backupPath}`);

  try {
    const dumpCommand = `mongodump --uri="${config.env.mongo_uri}" --out="${backupPath}"`;

    // eslint-disable-next-line no-unused-vars
    const { stdout, stderr } = await execAsync(dumpCommand);
    config.logger.info(stdout);
    if (stderr) {
      config.logger.error("Erreurs mongodump:", stderr);
    }

    config.logger.info("Création du zip du backup MongoDB");

    // Vérification de l'existence du dossier avant compression
    if (!fs.existsSync(backupPath)) {
      throw new Error("Le dossier de backup n'existe pas");
    }

    // Utilisation d'une méthode de compression plus robuste
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", {
      zlib: { level: 9 } // Compression maximale
    });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(backupPath, false);
    await archive.finalize();

    // Attendre la fin de l'écriture
    await new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
    });

    // Supprimer le dossier original après compression
    fs.rmSync(backupPath, { recursive: true, force: true });

    // Vérification finale du ZIP
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    if (zipEntries.length === 0) {
      throw new Error("Le fichier ZIP est vide");
    }

    config.logger.info(`Backup MongoDB compressé : ${zipPath}`);
    return zipPath;
  } catch (error) {
    config.logger.error("Erreur de backup MongoDB:", error);
    throw new Error(`Erreur lors du backup MongoDB: ${error.message}`);
  }
};

const testRestore = async (mongoBackupPath) => {
  const testDbName = `test_backup_${Date.now()}`;
  const extractPath = path.join(
    backupConfig.paths.temp,
    `test_restore_${Date.now()}`
  );

  try {
    const zip = new AdmZip(mongoBackupPath);
    zip.extractAllTo(extractPath, true);

    const findMongoData = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
          const subItems = fs.readdirSync(itemPath);
          if (subItems.some((subItem) => subItem.endsWith(".bson"))) {
            return itemPath;
          }
          const found = findMongoData(itemPath);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const dumpDir = findMongoData(extractPath);
    if (!dumpDir) {
      throw new Error("Dossier de dump MongoDB non trouvé");
    }

    config.logger.info(`Test de restauration vers ${testDbName}`);

    // Restaurer vers la base de test
    const restoreCommand = `mongorestore --uri="${config.env.mongo_uri}" --nsFrom="${backupConfig.mongodb.database}.*" --nsTo="${testDbName}.*" "${dumpDir}"`;
    const { stderr } = await execAsync(restoreCommand);

    if (stderr) {
      config.logger.error("Erreurs mongorestore:", stderr);
    }

    // On ne fait pas le drop de la base de test ici
    // Elle sera automatiquement écrasée au prochain test

    fs.rmSync(extractPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
    throw new Error(`Erreur lors du test de restauration: ${error.message}`);
  }
};

module.exports = { backupMongoDB, testRestore };
