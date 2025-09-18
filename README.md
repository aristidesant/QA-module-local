# Mantine Vite template

Get started with the template by clicking `Use this template` button on the top of the page.

[Documentation](https://mantine.dev/guides/vite/)

## Environment

This project reads runtime configuration from Vite environment variables. For local/demo use, copy the provided `.env.example` to `.env` and update values as needed:

1. cp .env.example .env
2. Edit `.env` and set `VITE_APP_API_URL` to your backend URL (for example `http://localhost:3000`).

When building with Docker, the `VITE_APP_API_URL` build-arg is passed into the image (see `Dockerfile`).
