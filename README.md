# CVELIST

## Project Purpose

This project loads 27 years of CVE records (CVEID) from the cve.org database into Elasticsearch and allows querying and filtering via a Vue.js-based web interface and Kibana.  
It uses **dynamic mapping**, applies modern search techniques including **search optimization, text analysis & normalization, data modeling for search, and query design & optimization**.  
The backend is built with **Node.js**, **Express.js**, and serves a **Vue 3** frontend.

---

## Technologies Used

- Elasticsearch
- Kibana
- Node.js
- Express.js
- Vue 3
- Bootstrap 5
- @elastic/elasticsearch

---

## Setup

1. Start the Elasticsearch and Kibana Docker containers.
2. In the project directory, install dependencies:
   ```bash
   npm install
   ```
3. Change into the frontend directory and install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

---

## Running

1. Make sure Elasticsearch and Kibana are up and running.
2. Start the backend server:
   ```bash
   npm start
   ```
3. Start the Vue frontend:
   ```bash
   cd frontend
   npm run dev
   ```
4. Open the web UI in your browser: [http://localhost:5173](http://localhost:5173)  
5. Open Kibana in your browser: [http://localhost:5601](http://localhost:5601)

---

## Project Structure

```
CVELIST/
├── package.json
├── README.md
├── cves/                       # Directory containing CVE JSON files
├── app.js                      # Script to scan CVE file paths
├── src/
│   ├── elastic/                # Elasticsearch client and service layer
│   │   ├── elasticClient.js
│   │   ├── indexService.js
│   │   ├── mappingService.js
│   │   ├── bulkInsertService.js
│   │   └── searchService.js
│   ├── controllers/            # HTTP controller logic
│   │   └── cveController.js
│   ├── routes/                 # Express.js routes
│   │   └── cveRoutes.js
│   ├── utils/                  # Helper functions
│   │   └── normalizeCve.js
│   └── server.js               # Entry point for Express.js server
├── frontend/                   # Vue 3 frontend app
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.vue
│       ├── main.js
│       ├── router/
│       │   └── index.js
│       ├── components/
│       │   ├── Navbar.vue
│       │   └── Footer.vue
│       └── pages/
│           ├── SearchPage.vue
│           ├── ResultsPage.vue
│           └── CveDetailsPage.vue
```

---

## RESTful API Endpoints

- `GET /api/cve/:cveId` &mdash; Retrieve a single CVE document by ID
- `POST /api/cve/search` &mdash; Perform a search query with optional filters
- `GET /api/cve` &mdash; Retrieve all CVE records (limited)
- `GET /api/cve/autocomplete` &mdash; Get autocomplete suggestions

---

## Notes

- Data is loaded with **dynamic mapping** and normalized for case-insensitive search.
- The web interface supports:
  - Full-text search with relevance boosting
  - Filtering by state, date range, etc.
  - Viewing CVE details on a dedicated page
  - Autocomplete suggestions while typing
- The `cves/` directory contains over **300,000 JSON files**.
- The `bulkInsertService.js` applies a normalization transform while indexing.
- The project applies principles of:
  - Search Optimization
  - Text Analysis & Normalization
  - Data Modeling for Search
  - Query Design & Optimization

---

## Layers

- **elastic/** &mdash; Elasticsearch client and query logic
- **controllers/** &mdash; HTTP request handlers
- **routes/** &mdash; Express API route definitions
- **utils/** &mdash; Normalization helper
- **frontend/** &mdash; Vue 3 SPA (Single Page Application)
- **server.js** &mdash; Starts the Express.js backend

---
