import { Auth0AI, getAccessTokenFromTokenVault } from "@auth0/ai-vercel";
import { auth0 } from "./auth0";

const auth0AI = new Auth0AI({
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_TOKEN_VAULT_CLIENT_ID!,
    clientSecret: process.env.AUTH0_TOKEN_VAULT_CLIENT_SECRET!,
  },
});

// Token Vault connection wrappers
export const withGitHubConnection = auth0AI.withTokenVault({
  connection: "github",
  scopes: ["read:user", "repo"],
  refreshToken: async () => {
    const session = await auth0.getSession();
    return session?.tokenSet.refreshToken ?? "";
  },
});

export const withGoogleCalendarConnection = auth0AI.withTokenVault({
  connection: "google-oauth2",
  scopes: [
    "openid",
    "https://www.googleapis.com/auth/calendar.readonly",
  ],
  refreshToken: async () => {
    const session = await auth0.getSession();
    return session?.tokenSet.refreshToken ?? "";
  },
});

export const withGmailConnection = auth0AI.withTokenVault({
  connection: "google-oauth2",
  scopes: [
    "openid",
    "https://www.googleapis.com/auth/gmail.readonly",
  ],
  refreshToken: async () => {
    const session = await auth0.getSession();
    return session?.tokenSet.refreshToken ?? "";
  },
});

export const getAccessToken = async () => getAccessTokenFromTokenVault();
