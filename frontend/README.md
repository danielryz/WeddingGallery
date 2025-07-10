# Frontend Development

This directory contains the React application served by [Vite](https://vitejs.dev/).

## Install dependencies

From this directory run:

```bash
npm install
```

## Run the development server

```bash
npm run dev
```

## Build the project

```bash
npm run build
```

## Configuration

The app expects the environment variable `VITE_API_URL` to specify the backend API base URL. If not set, it falls back to `http://localhost:8080`.

For convenience a `.env.dev` file is included with this default value. When working locally you can either source this file:

```bash
source .env.dev
```

or copy it to `.env` so that Vite picks it up automatically:

```bash
cp .env.dev .env
```
