function customMetaphone(word) {
  if (!word) {
    return "";
  }

  // Convertir en minuscules et supprimer les accents
  word = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Règles de transformation
  const rules = [
    { from: ["ph"], to: "f" },
    { from: ["sh", "ch"], to: "x" },
    { from: ["qu"], to: "k" },
    { from: ["ing", "ings"], to: "" }
  ];

  // Appliquer les transformations
  rules.forEach((rule) => {
    rule.from.forEach((pattern) => {
      word = word.replace(new RegExp(pattern, "g"), rule.to);
    });
  });

  // Supprimer les consonnes doubles
  word = word.replace(/([bcdfghjklmnpqrstvwxz])\1/g, "$1");

  // Convertir les voyelles
  word = word.replace(/[aeiou]/g, "A");

  // Ne garder que les premières consonnes significatives
  word = word.replace(/^[aeiou]+/, "").replace(/[aeiou]/g, "");

  return word.slice(0, 4).toUpperCase();
}

function customLevenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // Suppression
        dp[i][j - 1] + 1, // Insertion
        dp[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return dp[m][n];
}

module.exports = {
  customMetaphone,
  customLevenshteinDistance
};
