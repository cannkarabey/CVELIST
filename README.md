# CVELIST

CVELIST, CVE.org tarafından yayımlanan CVE kayıtlarını Elasticsearch'e aktaran ve Vue tabanlı bir web arayüzü üzerinden arama, filtreleme ve detay görüntüleme sağlayan bir projedir.

## Mimari

```text
CVE JSON dosyaları
        │
        ▼
Node.js veri yükleyici ─────► Elasticsearch
                                      │
                                      ├──► Express API
                                      │          │
                                      │          ▼
                                      │      Vue frontend
                                      │
                                      └──► Kibana
```

Projede:

- Elasticsearch ve Kibana Docker Compose ile çalıştırılır.
- CVE kayıtları CVEProject/cvelistV5 deposundaki JSON dosyalarından okunur.
- Node.js veri yükleyicisi kayıtları `cvelist` Elasticsearch indeksine toplu olarak aktarır.
- Express backend, CVE arama ve detay API'lerini sunar.
- Vue/Vite frontend, backend API'sini kullanarak CVE kayıtlarını görüntüler.

## Gereksinimler

- Docker Desktop
- Node.js ve npm
- Git
- En az 1 GB Elasticsearch heap belleği için yeterli sistem kaynağı
- Tüm CVE kayıtları kullanılacaksa yeterli disk alanı

## Proje yapısı

```text
CVELIST/
├── docker-compose.yml
├── package.json
├── README.md
├── cves/                         # CVE JSON arşivi; Git'e gönderilmez
├── src/
│   ├── app.js                    # İndeks oluşturur ve CVE verilerini yükler
│   ├── server.js                 # Express API sunucusu
│   ├── controllers/
│   │   └── cveController.js
│   ├── elastic/
│   │   ├── elasticClient.js
│   │   ├── indexService.js
│   │   ├── mappingService.js
│   │   ├── bulkInsertService.js
│   │   └── searchService.js
│   ├── routes/
│   │   └── cveRoutes.js
│   └── utils/
│       ├── fileScanner.js
│       └── normalizeCve.js
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.vue
        ├── api/
        ├── components/
        ├── pages/
        └── router/
```

## 1. Elasticsearch ve Kibana'yı başlatma

Docker Desktop'ı açın ve tamamen hazır olmasını bekleyin. Proje kök dizininde:

```bash
cd /Users/yusufkarabey/VsCode/Elasticsearch
docker compose up -d
```

Container durumunu kontrol edin:

```bash
docker compose ps
```

Elasticsearch'ü test edin:

```bash
curl http://localhost:9200
curl http://localhost:9200/_cluster/health
```

Adresler:

- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601

`docker-compose.yml` geliştirme ortamında güvenlik ayarlarını kapatır. Production ortamında aynı ayarları kullanmayın.

Container'ları durdurmak için:

```bash
docker compose down
```

Container'ları ve Elasticsearch volume verilerini silmek için:

```bash
docker compose down -v
```

`-v` seçeneği `cvelist` indeksini ve tüm Elasticsearch verilerini siler.

## 2. CVE verilerini indirme

Proje, CVE kayıtlarını runtime sırasında CVE.org'dan çekmez. Kayıtlar localdeki `cves/` klasöründen okunur.

Resmi CVE kayıt deposunu klonlayın:

```bash
git clone --depth 1 https://github.com/CVEProject/cvelistV5.git
```

Projede beklenen klasör yapısını oluşturun:

```bash
cp -R cvelistV5/cves ./cves
```

Dosyaların bulunduğunu kontrol edin:

```bash
find cves -name "*.json" | head
find cves -name "*.json" | wc -l
```

İşlem tamamlandıktan sonra geçici klon klasörü silinebilir:

```bash
rm -rf cvelistV5
```

`cves/` klasörü `.gitignore` içindedir ve GitHub'a gönderilmemelidir. CVE arşivi yüz binlerce JSON dosyası içerdiği için indirme, kopyalama ve indeksleme işlemleri zaman alabilir.

## 3. Node.js bağımlılıklarını kurma

Proje kök dizininde:

```bash
npm install
```

Frontend bağımlılıklarını kurun:

```bash
cd frontend
npm install
cd ..
```

Elasticsearch sunucusu 8.13.4 kullandığı için kök projedeki `@elastic/elasticsearch` bağımlılığı 8.x sürümünde tutulur. Elasticsearch 9.x client kullanmayın; aksi durumda `compatible-with=9` media type hatası alınabilir.

## 4. CVE kayıtlarını Elasticsearch'e yükleme

Elasticsearch çalışırken proje kök dizininde:

```bash
npm start
```

`npm start`, `src/app.js` dosyasını çalıştırır. Bu işlem:

1. `cvelist` indeksini oluşturur.
2. Mapping ve dynamic mapping ayarlarını uygular.
3. `cves/` klasöründeki JSON dosyalarını tarar.
4. CVE kayıtlarını 500'lük bulk paketler halinde Elasticsearch'e yükler.

Başarılı işlem sonunda kayıt sayısını kontrol edin:

```bash
curl http://localhost:9200/cvelist/_count
```

İndeksi kontrol etmek için:

```bash
curl http://localhost:9200/_cat/indices?v
```

Veri yükleyici her çalıştırıldığında dosyaları yeniden Elasticsearch'e gönderebilir. İlk yükleme tamamlandıktan sonra aynı işlemi gereksiz yere tekrarlamayın.

## 5. Express backend'i başlatma

`npm start` veri yükleyicisini çalıştırır ve API sunucusunu başlatmaz. Veri yükleme tamamlandıktan sonra ayrı bir terminal açın:

```bash
cd /Users/yusufkarabey/VsCode/Elasticsearch
node src/server.js
```

Başarılı başlangıç mesajı:

```text
Backend server is running on http://localhost:3000
Elasticsearch cluster health: green
```

Backend API:

- http://localhost:3000/api/cve
- http://localhost:3000/api/cve/CVE-1999-0001

Arama endpoint'ini test etmek için:

```bash
curl -X POST http://localhost:3000/api/cve/search \
  -H "Content-Type: application/json" \
  -d '{"query":"SQL Injection","from":0,"size":20,"mode":"simple"}'
```

Backend terminali açık kalmalıdır. Terminal kapatılırsa frontend `Failed to fetch search results` hatası gösterebilir.

## 6. Vue frontend'i başlatma

Backend çalışırken yeni bir terminal açın:

```bash
cd /Users/yusufkarabey/VsCode/Elasticsearch/frontend
npm run dev
```

Frontend adresi:

- http://localhost:5173

Tam local başlatma sırası:

```text
Terminal 1: docker compose up -d
Terminal 2: npm start
Terminal 3: node src/server.js
Terminal 4: cd frontend && npm run dev
```

## Kullanılabilir API endpoint'leri

| Method | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/cve` | İlk CVE kayıtlarını getirir |
| `GET` | `/api/cve/:cveId` | CVE ID ile detay getirir |
| `POST` | `/api/cve/search` | Metin, tarih, state ve sıralama filtreleriyle arama yapar |
| `GET` | `/api/cve/autocomplete?query=...` | Başlık autocomplete sonuçları getirir |

## Kibana kullanımı

Kibana'yı açın:

```text
http://localhost:5601
```

Elasticsearch indeksini görmek için Kibana'da `cvelist` data view oluşturun. Zaman alanı olarak `datePublished` seçilebilir. Daha sonra Discover ve Dashboard ekranlarından kayıtları inceleyebilirsiniz.

## Sorun giderme

### Docker daemon hatası

```text
failed to connect to the docker API
```

Docker Desktop'ın açık olduğundan emin olun:

```bash
docker info
```

### Elasticsearch bağlantı hatası

```bash
curl http://localhost:9200/_cluster/health
docker compose ps
docker compose logs elasticsearch
```

### `cvelist` indeksi yok

Veri yükleyiciyi çalıştırın:

```bash
npm start
```

### `Failed to fetch search results`

Backend'in çalıştığını test edin:

```bash
curl http://localhost:3000/api/cve
```

Çalışmıyorsa:

```bash
node src/server.js
```

### `media_type_header_exception`

Bu hata genellikle Elasticsearch 8 sunucusuyla Elasticsearch 9 Node client kullanılmasından kaynaklanır. Server ve client major sürümlerinin uyumlu olduğunu kontrol edin:

```bash
npm ls @elastic/elasticsearch
```

Bu proje için Elasticsearch client 8.x kullanılmalıdır.

### `cves` klasörü bulunamadı

`src/utils/fileScanner.js` çalışma dizinindeki `cves/` klasörünü bekler. Komutları proje kök dizininde çalıştırın ve şu kontrolü yapın:

```bash
pwd
find cves -name "*.json" | head
```

## Production build

Frontend production build'i:

```bash
cd frontend
npm run build
```

Build çıktısı `frontend/dist/` klasörüne yazılır. Local preview:

```bash
npm run preview
```

Bu proje local Docker + Node.js akışıyla geliştirme için hazırlanmıştır. Vercel'e yalnızca frontend deploy edilecekse backend ve Elasticsearch adresleri production ortamında ayrıca yapılandırılmalı; local `localhost` adresleri uzak deployment'ta çalışmaz.

## Teknolojiler

- Elasticsearch 8.13.4
- Kibana 8.13.4
- Node.js
- Express.js
- Vue 3
- Vite
- Bootstrap 5
- `@elastic/elasticsearch` 8.x

## Lisans ve veri kaynağı

CVE kayıtları CVE Programı tarafından yayımlanan resmi CVE JSON kayıtlarından alınır. CVE kayıtlarının kullanımında [CVE Program Terms of Use](https://www.cve.org/Legal/TermsOfUse) koşullarını dikkate alın.
