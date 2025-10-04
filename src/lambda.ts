import Koa from "koa";
import mount from "koa-mount";
import { oidc } from "./configs/provider";
import { getConfiguration } from "./configs/configuration";
import serverless from "serverless-http";
import middy from "@middy/core";
import ssm from "@middy/ssm";

let serverlessApp: any;

const baseHandler = async (event: any, context: any) => {
  console.log("Lambda invoked:", {
    path: event.path,
    method: event.httpMethod,
  });

  if (!serverlessApp) {
    console.log("Initializing serverless app...");
    const app = new Koa();

    console.log("Getting configuration with JWK:", !!context.PRIVATE_KEY_JWK);
    console.log(
      "Getting configuration with Initial Access Token:",
      !!context.INITIAL_ACCESS_TOKEN
    );
    const configuration = getConfiguration(
      context.PRIVATE_KEY_JWK,
      context.INITIAL_ACCESS_TOKEN
    );

    const issuerUrl = process.env.ISSUER_URL || "http://localhost:3000";
    console.log("Creating OIDC provider with issuer:", issuerUrl);
    const provider = oidc(issuerUrl, configuration);

    app.use(mount(provider.app));
    serverlessApp = serverless(app);
    console.log("Serverless app initialized successfully");
  }

  console.log("Processing request through serverless app");
  return serverlessApp(event, context);
};

export const handler = middy(baseHandler)
  .use(
    ssm({
      cache: true,
      cacheExpiry: 5 * 60 * 1000,
      setToContext: true,
      fetchData: {
        PRIVATE_KEY_JWK: `/${process.env.APP_ENV}/oauth/private-key-jwk`,
        INITIAL_ACCESS_TOKEN: `/${process.env.APP_ENV}/oauth/initial-access-token`,
      },
    })
  )
  .onError((request) => {
    console.error("Middy error:", request.error);
    throw request.error;
  });
