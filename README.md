# CVELIST

## Project Purpose

This project is designed to load 27 years of CVE records (CVEID) from the cve.org database into Elasticsearch and allow querying via Kibana and a web interface.  
It uses **dynamic mapping** and applies modern search techniques including **search optimization, text analysis & normalization, data modeling for search, and query design & optimization**.  
The backend is built with **Node.js** and **Express.js**.

---

## Technologies Used

- Elasticsearch
- Kibana
- Node.js
- Express.js
- @elastic/elasticsearch
- HTML/CSS (for UI)
- EJS (template engine)

---

## Setup

1. Start the Elasticsearch and Kibana Docker containers.
2. In the project directory, install dependencies:
   ```bash
   npm install
   ```

---

## Running

1. Make sure Elasticsearch and Kibana are up and running.
2. Start the server:
   ```bash
   npm start
   ```
3. Open the web UI in your browser: [http://localhost:3000](http://localhost:3000)  
4. Open Kibana in your browser: [http://localhost:5601](http://localhost:5601)

---

## Project Structure

```
CVELIST/
├── package.json
├── README.md
├── cves/                     # Directory containing CVE JSON files
├── app.js                    # Optimized code for scanning CVE file paths
├── src/
│   ├── elastic/              # Elasticsearch client and service layer
│   │   ├── elasticClient.js
│   │   ├── indexService.js
│   │   ├── mappingService.js
│   │   ├── bulkInsertService.js
│   │   └── searchService.js
│   ├── controllers/          # HTTP request/controller logic
│   │   └── cveController.js
│   ├── routes/               # Express.js route definitions
│   │   └── cveRoutes.js
│   ├── views/                # UI (HTML/EJS templates)
│   │   └── index.ejs
│   └── server.js             # Entry point for Express.js server
```

---

## RESTful API Endpoints

- `GET /cve` &mdash; Retrieve all records
- `POST /cve/search` &mdash; Perform a search query submitted via form
- `POST /cve/bulkload` &mdash; Load CVE JSON data into Elasticsearch

---

## Notes

- Data is loaded with **dynamic mapping** and a **custom analyzer** for case-insensitive and normalized search.
- Version numbers are indexed as a separate field and can be used for sorting.
- Data and results can be queried and visualized via Kibana.
- The `cves/` directory contains over **300,000 JSON files**.
- The `app.js` script scans this directory and outputs optimized paths to the files.
- The project applies principles of:
  - Search Optimization
  - Text Analysis & Normalization
  - Data Modeling for Search
  - Query Design & Optimization

---

## Layers

- **elastic/** &mdash; Elasticsearch client and operations
- **controllers/** &mdash; HTTP request handling logic
- **routes/** &mdash; HTTP endpoint definitions
- **views/** &mdash; User interface templates
- **server.js** &mdash; Starts the Express.js server

---
