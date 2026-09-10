# Better Life Friends

A donor engagement platform for Better Life Friends ministry. It connects
recurring donors with funding tracks and presents their ongoing impact.

## Run Locally

Prerequisite: Node.js 22 or newer.

```sh
npm install
npm run generate:api
npm run dev
```

The development server runs at `http://localhost:3000`. Better Life API
requests default to `http://localhost:3001/v1`; copy `.env.example` to `.env`
and change `VITE_API_BASE_URL` to override that host. `openapi copy.yaml` is the
latest backend-provided source of truth for endpoint paths, payloads, responses,
permissions, and enum values. Regenerate the API types after any contract change.

## Checks

```sh
npm run lint
npm run build
```
