const si = require("systeminformation");

module.exports = {
// Middleware pour surveiller les ressources du serveur
  serverMetrics: async(req, res) => {
    try {
      const cpu = await si.currentLoad(); // Charge du CPU
      const memory = await si.mem(); // Utilisation mémoire
      const disk = await si.fsSize(); // Utilisation disque

      const metrics = {
        cpu: {
          usage: `${cpu.currentLoad.toFixed(2)}%` // Pourcentage d'utilisation CPU
        },
        memory: {
          total: `${(memory.total / 1e9).toFixed(2)} GB`, // Mémoire totale
          used: `${(memory.active / 1e9).toFixed(2)} GB`, // Mémoire utilisée
          free: `${(memory.available / 1e9).toFixed(2)} GB` // Mémoire disponible
        },
        disk: disk.map((d) => ({
          filesystem: d.fs,
          total: `${(d.size / 1e9).toFixed(2)} GB`,
          used: `${(d.used / 1e9).toFixed(2)} GB`,
          usage: `${((d.used / d.size) * 100).toFixed(2)}%`
        }))
      };

      res.status(200).json(metrics);
    } catch (err) {
      console.error("Erreur lors de la collecte des métriques serveur :", err);
      res.status(500).json({ error: "Impossible de récupérer les métriques serveur" });
    }
  }
}
