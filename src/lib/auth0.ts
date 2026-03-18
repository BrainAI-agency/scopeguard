import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  enableConnectAccountEndpoint: true,
  authorizationParameters: {
    audience: `https://${process.env.AUTH0_DOMAIN}/me/`,
    scope: "openid profile email offline_access create:me:connected_accounts read:me:connected_accounts delete:me:connected_accounts",
  },
  appBaseUrl: process.env.AUTH0_BASE_URL,
  signInReturnToPath: "/dashboard",
});
