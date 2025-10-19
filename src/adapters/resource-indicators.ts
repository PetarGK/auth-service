import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { errors } from "oidc-provider";

const RESOURCES_TABLE = process.env.RESOURCES_TABLE || "oauth-resources";
const TABLE_REGION = process.env.AWS_REGION;

const client = new DynamoDBClient({ region: TABLE_REGION });
const dynamoClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

interface ResourceServerInfo {
  scope: string;
  audience: string;
  accessTokenFormat?: "jwt" | "opaque";
  accessTokenTTL?: number;
  jwt?: { alg: string };
}

export class ResourceIndicatorsAdapter {
  async getResourceServerInfo(clientId: string, resourceIndicator: string): Promise<ResourceServerInfo> {
    const params = {
      TableName: RESOURCES_TABLE,
      Key: { resourceId: `${clientId}-${resourceIndicator}` },
    };

    const result = await dynamoClient.send(new GetCommand(params));
    
    if (!result.Item) {
      throw new errors.InvalidTarget();
    }

    return {
      scope: result.Item.scope,
      audience: result.Item.audience || resourceIndicator,
      accessTokenFormat: result.Item.accessTokenFormat || "jwt",
      accessTokenTTL: result.Item.accessTokenTTL || 15 * 60,
      jwt: result.Item.jwt || { alg: "RS256" },
    };
  }
}