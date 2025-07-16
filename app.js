import { createIndexIfNotExists } from './elastic/indexService.js';
import { putDynamicMapping } from './elastic/mappingService.js';
import { scanCveJsonFiles } from './utils/fileScanner.js';
import { bulkInsertCves } from './elastic/bulkInsertService.js';

console.log('CVELIST veri yükleyici başlatıldı…');

// Index yoksa oluştur
await createIndexIfNotExists();

// Dynamic mapping uygula
await putDynamicMapping();

// CVE JSON dosyalarını tara
const files = scanCveJsonFiles();

console.log(`Toplam ${files.length} CVE JSON dosyası bulundu.`);
console.log(`Örnek dosya: ${files[0]}`);

// Elasticsearch’e yükle
await bulkInsertCves(files);

console.log('İşlem tamamlandı.');