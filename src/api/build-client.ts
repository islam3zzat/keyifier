import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import {
  ClientBuilder,
  // Import middlewares
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from "@commercetools/ts-client";
import "dotenv/config";
import { getOrFail } from "../utils/env.js";

// Environment variables
const clientSecret = getOrFail("CTP_CLIENT_SECRET");
const clientId = getOrFail("CTP_CLIENT_ID");
const authUrl = getOrFail("CTP_AUTH_URL");
const apiUrl = getOrFail("CTP_API_URL");
const scopes = getOrFail("CTP_SCOPES");

export const projectKey = getOrFail("CTP_PROJECT_KEY");
const SCOPES = scopes.split(",").map((scope) => scope.trim());

// Configure authMiddlewareOptions
const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: authUrl,
  projectKey: projectKey,
  credentials: {
    clientId: clientId,
    clientSecret: clientSecret,
  },
  scopes: SCOPES,
  httpClient: fetch,
};

// Configure httpMiddlewareOptions
const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: apiUrl,
  httpClient: fetch,
};

export const ctpClient = new ClientBuilder()
  .withProjectKey(projectKey)
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  // .withLoggerMiddleware()
  .build();
