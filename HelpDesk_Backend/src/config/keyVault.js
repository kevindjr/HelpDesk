const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

const credential = new DefaultAzureCredential();

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