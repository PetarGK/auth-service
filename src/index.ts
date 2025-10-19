import Koa from "koa";
import mount from "koa-mount";
import "dotenv/config";
import { oidc } from "./configs/provider";
import { configuration } from "./configs/configuration";

const provider = oidc(process.env.ISSUER_URL!, configuration);

const start = async () => {
  const app = new Koa();
  app.use(mount(provider));
  app.listen(3000, () => {
    console.log(`Server is running on ${process.env.ISSUER_URL}`);
  });
};

start();
