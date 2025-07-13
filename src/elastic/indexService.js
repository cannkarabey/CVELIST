import client from './elasticClient.js';

const INDEX_NAME = 'cvelist';

export async function createIndexIfNotExists() {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });

    if (!exists) {
      console.log(`${INDEX_NAME} indexi yok. Gelişmiş ayarlarla oluşturuluyor…`);

      const response = await client.indices.create({
        index: INDEX_NAME,
        body: {
          settings: {
            analysis: {
              filter: {
                english_stemmer: { // kelime kökünü bulması için 'EN' dili tanımlandı
                  type: 'stemmer',
                  language: 'english'
                },
                english_stop: { // stopword removal için 'EN' dili tanımlandı
                  type: 'stop',
                  stopwords: '_english_'
                }
              },
              analyzer: {
                custom_text_analyzer: {
                  tokenizer: 'standard',
                  filter: [ // Text analysis ve Normalization özellikleri eklendi 
                    'lowercase',        // case-insensitivity
                    'asciifolding',     // ASCII folding
                    'english_stop',     // stopword removal
                    'english_stemmer'   // stemming
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
              tags: {
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

      console.log(`${INDEX_NAME} indexi başarıyla gelişmiş ayarlarla oluşturuldu:`, response.acknowledged);
    } else {
      console.log(`${INDEX_NAME} indexi zaten mevcut.`);
    }
  } catch (err) {
    console.error(`Index oluşturma hatası:`, err.message);
  }
}
