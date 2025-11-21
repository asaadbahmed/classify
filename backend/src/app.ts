import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PublicClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const TENANT_ID = process.env.TENANT_ID;
const SCOPES = ["Mail.Read"];

if (!CLIENT_ID || !TENANT_ID)
  throw new Error("Missing required env vars: CLIENT_ID, TENANT_ID");

// MSAL config for device code flow
let accessToken: string | null = null;
const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
  },
};

const pca = new PublicClientApplication(msalConfig);
app.get("/login", async (req, res) => {
  try {
    const deviceCodeRequest = {
      deviceCodeCallback: (response: any) => {
        console.log(response.message); // send this to the frontend, to have the user sign in.
      },
      scopes: SCOPES,
    };

    const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);

    if (!response || !response.accessToken) {
      return res.status(500).send("Failed to acquire access token");
    }

    accessToken = response.accessToken;

    res.send("Logged in! You can now call /emails"); // redirect the user to /emails.
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed");
  }
});

app.get("/emails", async (req, res) => {
  if (!accessToken) {
    return res.status(401).send("User not logged in. Visit /login first.");
  }

  const client = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  try {
    const messages = await client
      .api("/me/messages")
      .select("sender,subject,receivedDateTime,bodyPreview")
      .top(25) // in the future we'll delta query to get only new emails
      .get();

    res.json(messages.value);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve emails");
  }
});

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
