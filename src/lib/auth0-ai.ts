import { Auth0AI, getAccessTokenFromTokenVault } from "@auth0/ai-vercel";
import { auth0 } from "./auth0";

const auth0AI = new Auth0AI({
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_TOKEN_VAULT_CLIENT_ID!,
    clientSecret: process.env.AUTH0_TOKEN_VAULT_CLIENT_SECRET!,
  },
});

async function getRefreshToken() {
  const session = await auth0.getSession();
  return session?.tokenSet.refreshToken ?? "";
}

// Token Vault connection wrappers
export const withGitHubConnection = auth0AI.withTokenVault({
  connection: "github",
  scopes: ["read:user", "repo"],
  refreshToken: getRefreshToken,
});

export const withGoogleCalendarConnection = auth0AI.withTokenVault({
  connection: "google-oauth2",
  scopes: [
    "openid",
    "https://www.googleapis.com/auth/calendar.readonly",
  ],
  refreshToken: getRefreshToken,
});

export const withGmailConnection = auth0AI.withTokenVault({
  connection: "google-oauth2",
  scopes: [
    "openid",
    "https://www.googleapis.com/auth/gmail.readonly",
  ],
  refreshToken: getRefreshToken,
});

export const getAccessToken = async () => getAccessTokenFromTokenVault();
