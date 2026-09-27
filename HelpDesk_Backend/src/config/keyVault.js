const { SecretClient } = require("@azure/keyvault-secrets");
const { ClientSecretCredential } = require("@azure/identity");

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

const client = new SecretClient(
  process.env.KEY_VAULT_URL,
  credential
);

const getSecret = async (secretName) => {
  const secret = await client.getSecret(secretName);

  if (!secret.value) {
    throw new Error(`Secret "${secretName}" has no value`);
  }

  return secret.value;
};

module.exports = {
  getSecret
};