import { Provider, Configuration } from "oidc-provider";

export const oidc = (issuer: string, configuration: Configuration) => {
  return new Provider(issuer, configuration);
};
