import client from './elasticClient.js';

const INDEX_NAME = 'cvelist';

export async function createIndexIfNotExists() {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });

    if (!exists) {
      console.log(`${INDEX_NAME} indexi yok. Özel ayarlarla oluşturuluyor…`);

      // Güncellenmiş yeni mapping design
      // Custom analyzer + field type’lar + versiyon field.

      const response = await client.indices.create({
        index: INDEX_NAME,
        body: {
          settings: {
            analysis: {
              analyzer: {
                custom_text_analyzer: {
                  tokenizer: 'standard',
                  filter: [
                    'lowercase',
                    'asciifolding',
                    'stop'
                  ]
                }
              }
            }
          },
          mappings: {
            dynamic: true,
            properties: {
              title: {
                type: 'text',
                analyzer: 'custom_text_analyzer'
              },
              description: {
                type: 'text',
                analyzer: 'custom_text_analyzer'
              },
              state: {
                type: 'keyword'
              },
              cveId: {
                type: 'keyword'
              },
              version: {
                type: 'keyword'
              },
              datePublished: {
                type: 'date'
              }
            }
          }
        }
      });

      console.log(`${INDEX_NAME} indexi başarıyla özel ayarlarla oluşturuldu:`, response.acknowledged);
    } else {
      console.log(`${INDEX_NAME} indexi zaten mevcut.`);
    }
  } catch (err) {
    console.error(`Index oluşturma hatası:`, err.message);
  }
}
