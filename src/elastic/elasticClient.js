// Elasticsearch’e bağlantı kurar. Bağlantıyı test eder ve dışa aktarır.

import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200'
});

async function pingElasticsearch() {
  try {
    const health = await client.cluster.health();
    console.log('Elasticsearch cluster health:', health.status);
  } catch (err) {
    console.error('Elasticsearch bağlantı hatası:', err.message);
    process.exit(1);
  }
}

pingElasticsearch();

export default client;
