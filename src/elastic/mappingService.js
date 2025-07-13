import client from './elasticClient.js';

const INDEX_NAME = 'cvelist';

export async function putDynamicMapping() {
  try {
    const response = await client.indices.putMapping({
      index: INDEX_NAME,
      body: {
        dynamic: true
      }
    });

    console.log(`Dynamic mapping başarıyla uygulandı:`, response.acknowledged);
  } catch (err) {
    console.error(`Mapping hatası:`, err.message);
  }
}
