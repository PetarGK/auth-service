import { Configuration, errors } from "oidc-provider";
import { DynamoDBAdapter } from "../adapters/dynamodb";
import { ResourceIndicatorsAdapter } from "../adapters/resource-indicators";

export const getConfiguration = (
  privateKeyJwk?: string | object,
  initialAccessToken?: string
): Configuration => {
  const privateKey =
    typeof privateKeyJwk === "object"
      ? privateKeyJwk
      : JSON.parse(privateKeyJwk || process.env.PRIVATE_KEY_JWK || "{}");

  const resourceAdapter = new ResourceIndicatorsAdapter();

  return {
    adapter: process.env.APP_ENV === "local" ? undefined : DynamoDBAdapter,
    jwks: {
      keys: [
        {
          ...privateKey,
          kid: "main-key",
          use: "sig",
          alg: "RS256",
        },
      ],
    },
    clients: [],
    features: {
      clientCredentials: { enabled: true },
      introspection: { enabled: true },
      revocation: { enabled: true },
      devInteractions: { enabled: true },
      resourceIndicators: {
        enabled: true,
        async getResourceServerInfo(ctx, resourceIndicator) {
          return await resourceAdapter.getResourceServerInfo(ctx.oidc.client!.clientId, resourceIndicator);
        },
      },
      registration: {
        enabled: true,
        initialAccessToken:
          initialAccessToken || process.env.INITIAL_ACCESS_TOKEN,
        policies: {
          /* optional */
        },
      },
      registrationManagement: {
        enabled: true,
      },
    },
  };
};

// Fallback for direct usage
export const configuration = getConfiguration();
