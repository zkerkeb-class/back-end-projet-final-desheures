const si = require("systeminformation");
const config = require("../config");

module.exports = {
  serverMetrics: async (req, res) => {
    try {
      const cpu = await si.currentLoad();
      const memory = await si.mem();
      const disk = await si.fsSize();
      const metrics = {
        cpu: {
          usage: `${cpu.currentLoad.toFixed(2)}%`
        },
        memory: {
          total: `${(memory.total / 1e9).toFixed(2)} GB`,
          used: `${(memory.active / 1e9).toFixed(2)} GB`,
          free: `${(memory.available / 1e9).toFixed(2)} GB`
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
      config.logger.error(
        "Erreur lors de la collecte des métriques serveur :",
        err
      );
      res
        .status(500)
        .json({ error: "Impossible de récupérer les métriques serveur" });
    }
  }
};
