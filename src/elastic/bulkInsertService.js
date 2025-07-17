import fs from 'fs';
import client from './elasticClient.js';

const INDEX_NAME = 'cvelist';
const BATCH_SIZE = 500;

export async function bulkInsertCves(files) {
  console.log(`Elasticsearch'e yükleme başlıyor…`);

  let batch = [];
  let count = 0;

  for (const filePath of files) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(fileContent);

    const transformed = transformCveJson(json);

    batch.push({ index: { _index: INDEX_NAME } });
    batch.push(transformed);

    count++;

    if (batch.length / 2 >= BATCH_SIZE) {
      await sendBatch(batch);
      batch = [];
      console.log(`${count} kayıt yüklendi.`);
    }
  }

  if (batch.length > 0) {
    await sendBatch(batch);
    console.log(`Toplam ${count} kayıt yüklendi.`);
  }

  console.log(`Yükleme tamamlandı.`);
}

export async function sendBatch(batch) {
  try {
    const { errors, items } = await client.bulk({ body: batch });

    if (errors) {
      console.warn(`Bazı hatalar oluştu.`);
      items.forEach(item => {
        if (item.index && item.index.error) {
          console.error(item.index.error);
        }
      });
    }
  } catch (err) {
    console.error(`Bulk yükleme hatası:`, err.message);
  }
}

// Versiyon ayıklama & title normalize helper 

export function extractVersionFromTitle(title) {
  const regex = /(.*?)(\s\d+(\.\d+)*$)/;  // Örn: "WhatsApp Desktop 0.3.4932"
  const match = title.match(regex);

  if (match) {
    return {
      cleanTitle: match[1].trim(),     // "WhatsApp Desktop"
      version: match[2].trim()        // "0.3.4932"
    };
  } else {
    return {
      cleanTitle: title,
      version: null
    };
  }
}

export function transformCveJson(json) {
  const rawTitle = json.containers?.cna?.title || '';

  const { cleanTitle, version } = extractVersionFromTitle(rawTitle);

  return {
    cveMetadata: json.cveMetadata || null,
    title: cleanTitle || null,
    version: version || null,
    datePublished: json.cveMetadata?.datePublished || null,
    state: json.cveMetadata?.state || null,
    affected: json.containers?.cna?.affected || [],
    descriptions: json.containers?.cna?.descriptions || [],
    problemTypes: json.containers?.cna?.problemTypes || [],
    providerMetadata: json.containers?.cna?.providerMetadata || null,
    references: json.containers?.cna?.references || [],
    cvssV3_1: json.containers?.cna?.metrics?.cvssV3_1 || null
  };
}
