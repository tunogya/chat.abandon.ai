# Abandon Chat App

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/durable-chat-template)

A real-time chat application built with Cloudflare Workers, Durable Objects, and PartyKit.

<!-- dash-content-start -->

With this application, you can deploy your own chat app to converse with other users in real-time. Going to the website puts you into a unique chat room based on the ID in the url. Share that ID with others to chat with them! This is powered by [Durable Objects](https://developers.cloudflare.com/durable-objects/) and [PartyKit](https://www.partykit.io/).

## How It Works

Users are assigned their own chat room when they first visit the page, and can talk to others by sharing their room URL. When someone joins the chat room, a WebSocket connection is opened with a [Durable Object](https://developers.cloudflare.com/durable-objects/) that stores and synchronizes the chat history.

The Durable Object instance that manages the chat room runs in one location, and handles all incoming WebSocket connections. Chat messages are stored and retrieved using the [Durable Object SQL Storage API](https://developers.cloudflare.com/durable-objects/api/sql-storage/). When a new user joins the room, the existing chat history is retrieved from the Durable Object for that room. When a user sends a chat message, the message is stored in the Durable Object for that room and broadcast to all other users in that room via WebSocket connection. This template uses the [PartyKit Server API](https://docs.partykit.io/reference/partyserver-api/) to simplify the connection management logic, but could also be implemented using Durable Objects on their own.

<!-- dash-content-end -->

## Project Structure

The project is divided into two main parts:

-   `src/client`: Contains the frontend React application.
-   `src/server`: Contains the Cloudflare Worker and Durable Object backend logic.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

### Installation

1.  Install NPM packages:
    ```sh
    npm install
    ```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode using `wrangler dev`. This will start a local server and allow you to test the application.

### `npm run deploy`

Deploys the application to Cloudflare Workers.

### `npm run check`

Runs TypeScript checks for both client and server code, and performs a dry run of the deployment to check for configuration issues.

### `npm run cf-typegen`

Generates TypeScript types for your `wrangler.toml` configuration, which can be found in `src/server/worker-configuration.d.ts`.