// lib/secrets.ts
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const vaultName = "careplusKeyVault";
const url = `https://${vaultName}.vault.azure.net`;

const credential = new DefaultAzureCredential();
const client = new SecretClient(url, credential);

export async function getSecret(name: string): Promise<string> {
  try {
    const secret = await client.getSecret(name);
    return secret.value || "";
  } catch (error) {
    console.warn(
      `Secret "${name}" not found in Key Vault. Falling back to .env`
    );
    return process.env[name.toUpperCase().replace(/-/g, "_")] || "";
  }
}
