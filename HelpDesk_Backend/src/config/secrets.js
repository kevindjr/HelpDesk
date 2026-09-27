const { getSecret } = require("./keyVault");

const loadSecrets = async () => {
  // Get secrets from Azure Key Vault
  const databaseUrl = await getSecret("database-url");
  const jwtSecret = await getSecret("jwt-secret");
  const geminiApiKey = await getSecret("gemini-api-key");

  // Parse the MySQL connection URL
  const dbUrl = new URL(databaseUrl);

  process.env.DB_HOST = dbUrl.hostname;
  process.env.DB_PORT = dbUrl.port || "3306";
  process.env.DB_USER = decodeURIComponent(dbUrl.username);
  process.env.DB_PASSWORD = decodeURIComponent(dbUrl.password);
  process.env.DB_NAME = dbUrl.pathname.replace("/", "");

  // Other application secrets
  process.env.JWT_SECRET = jwtSecret;
  process.env.GEMINI_API_KEY = geminiApiKey;

  console.log("Azure Key Vault secrets loaded successfully");
};

module.exports = {
  loadSecrets
};