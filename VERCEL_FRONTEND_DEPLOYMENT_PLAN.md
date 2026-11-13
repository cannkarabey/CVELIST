# Vercel Frontend-Only Deployment Implementation Plan

## Hedef

Projeyi yalnızca Vue/Vite frontend olarak Vercel Free planında yayınlamak.

- Backend, Docker, Elasticsearch ve Kibana production akışından çıkarılacak.
- CVE kayıtları `frontend/public/data/cves.json` dosyasından okunacak.
- Veri seti, kullanıcı tarafından belirlenecek CVE tarih/yıl aralığıyla sınırlı tutulacak.
- Arama, filtreleme, sıralama, sayfalama ve detay görüntüleme tarayıcı tarafında yapılacak.
- GitHub ve Vercel’e yalnızca seçilen veri seti gönderilecek; tam CVE arşivi gönderilmeyecek.

## Mevcut durum ve etkilenmiş yüzeyler

### Veri ve deployment

- `cves/` `.gitignore` içinde; GitHub’a gönderilmiyor.
- `frontend/public/data/` mevcut değil; oluşturulacak.
- `frontend/public/` altındaki dosyalar Vite build çıktısına doğrudan kopyalanır.
- Vercel projesinin kök dizini `frontend` olarak ayarlanacak.

### Frontend API bağımlılıkları

Değiştirilmesi gereken mevcut API çağrıları:

- `frontend/src/pages/SearchResults.vue`
  - Basit arama için `POST http://localhost:3000/api/cve/search`
  - Filtreli arama için `POST http://localhost:3000/api/cve/search`
  - Sayfalama ve toplam sonuç hesabı backend yanıtına bağlı.
- `frontend/src/pages/CveDetailPage.vue`
  - Detay için `GET http://localhost:3000/api/cve/:cveId`
- `frontend/src/api/cveApi.js`
  - Şu anda boş veya kullanılmıyor; ortak yerel veri erişim katmanı için değerlendirilecek.

### Frontend yönlendirme

- `frontend/src/router/index.js` Vue Router ile `createWebHistory` kullanıyor.
- Vercel’de `/results` ve `/cve/:cveId` doğrudan açıldığında `index.html` fallback rewrite gerekecek.

### Artık production akışında kullanılmayacak yüzeyler

İlk deployment kapsamında silinmeyecek, ancak çalıştırılmayacak:

- `docker-compose.yml`
- `src/app.js`
- `src/server.js`
- `src/controllers/`
- `src/routes/`
- `src/elastic/`
- `src/utils/fileScanner.js`
- kök `package.json`

Bu dosyalar local Elasticsearch/backend geliştirmesi için korunabilir. Frontend-only deployment’ın parçası yapılmayacak.

## Uygulama ön koşulu: veri aralığının belirlenmesi

Kod değişikliğine başlamadan önce kesin veri aralığı belirlenmeli:

1. Başlangıç ve bitiş yılı veya tarihini netleştir.
2. Aralığın dahil olma kuralını belirle:
   - başlangıç ve bitiş dahil,
   - yalnızca belirli yıllar,
   - veya `datePublished` alanına göre tarih aralığı.
3. Arşivde bulunmayan, `datePublished` alanı boş veya geçersiz kayıtların kuralını belirle.
4. Veri seti boyutu ve yaklaşık kayıt sayısını ölç.
5. Seçim kesinleşmeden `frontend/public/data/cves.json` oluşturma ve commit etme.

## Beş aşamalı uygulama planı

## Aşama 1 — CVE veri setini hazırlama ve sabitleme

### Amaç

Kullanıcının belirleyeceği tarih/yıl aralığındaki CVE kayıtlarını seçip frontend’in tüketebileceği tek bir veri dosyasına dönüştürmek.

### Yapılacaklar

1. Resmi CVE JSON kaynağından `cvelistV5` verisini temin et.
2. Kaynak arşivi localde tut; GitHub’a gönderme.
3. `datePublished` veya kullanıcı tarafından onaylanan tarih alanına göre kayıtları filtrele.
4. Her kayıt için frontend’in gerçekten kullandığı alanları koru:
   - CVE ID
   - başlık
   - yayın tarihi
   - durum
   - açıklamalar
   - etkilenen ürün/veri
   - problem türleri
   - referanslar
   - CVSS bilgisi
5. Gereksiz büyük veya tekrar eden alanları ayıkla.
6. Normalize edilmiş kayıtları `frontend/public/data/cves.json` içine koy.
7. JSON’un geçerli olduğunu, tekrar eden CVE ID bulunmadığını ve beklenen aralık dışında kayıt olmadığını doğrula.
8. Kayıt sayısını ve dosya boyutunu kaydet; Vercel/Git sınırlarına yaklaşılması halinde veri kapsamını daralt veya harici statik depolama seçeneğini değerlendir.

### Beklenen çıktı

```text
frontend/public/data/cves.json
```

### Kabul kriterleri

- Dosya doğrudan tarayıcıdan `/data/cves.json` adresiyle erişilebilir.
- Tüm kayıtların CVE ID’si vardır.
- Tüm kayıtlar onaylanan tarih/yıl aralığındadır.
- JSON parse edilebilir.
- Dosya boyutu Vercel Free deployment için kabul edilebilir düzeydedir.

## Aşama 2 — Ortak client-side veri katmanını oluşturma

### Amaç

Elasticsearch sorgularının yerine tek bir yerel veri erişim ve arama katmanı koymak.

### Değiştirilecek/oluşturulacak dosyalar

- `frontend/src/api/cveApi.js`
- Gerekirse yeni bir yardımcı modül:
  - `frontend/src/utils/cveData.js`
  - veya `frontend/src/services/cveDataService.js`

### Yapılacaklar

1. `/data/cves.json` dosyasını bir kez yükleyen bir loader oluştur.
2. Başarılı yükleme sonucunu bellekte cache’le; her aramada yeniden HTTP isteği yapma.
3. JSON yüklenemezse hatayı görünür ve anlaşılır şekilde döndür.
4. Yerel kayıtları ortak bir iç modele dönüştür:
   - `cveId`
   - `title`
   - `state`
   - `datePublished`
   - detay alanları
5. Arama davranışını backend’deki mevcut beklentiye mümkün olduğunca yakın tut:
   - CVE ID’de arama
   - başlıkta arama
   - açıklamalarda arama
   - gerekirse ürün/etkilenen alanlarında arama
   - büyük/küçük harf duyarsız arama
6. Filtreleri client-side uygula:
   - state
   - başlangıç tarihi
   - bitiş tarihi
7. Sıralamayı client-side uygula:
   - varsayılan
   - tarih azalan
   - tarih artan
   - varsa mevcut arayüzde kullanılan diğer sıralamalar
8. Sayfalama için filtrelenmiş sonuç listesini sayfalara böl.
9. Detay sayfası için CVE ID ile kayıt bulma fonksiyonu ekle.
10. Arama ve detay bileşenlerinin aynı normalize edilmiş veri şeklini kullanmasını sağla.

### Kabul kriterleri

- Frontend production kodunda `localhost:3000` veya `/api/cve` çağrısı kalmaz.
- Veri yalnızca `/data/cves.json` üzerinden yüklenir.
- Arama, filtre, sıralama ve sayfalama aynı veri kaynağını kullanır.
- Veri yükleme hatası kullanıcıya success state gibi gösterilmez.

## Aşama 3 — Sayfaları local dataset’e uyarlama

### Değiştirilecek dosyalar

- `frontend/src/pages/SearchResults.vue`
- `frontend/src/pages/CveDetailPage.vue`
- Gerekirse `frontend/src/pages/SearchPage.vue`
- Gerekirse `frontend/src/components/Filter.vue`
- Gerekirse `frontend/src/components/Pagination.vue`

### `SearchResults.vue`

1. Axios ile backend’e yapılan arama isteklerini kaldır.
2. Ortak client-side veri katmanını kullan.
3. `performSearch` ve `performSearchWithFilters` akışlarını yerel kayıtlar üzerinden çalıştır.
4. Mevcut reactive state’i koruyarak yalnızca veri kaynağını değiştir:
   - `cves`
   - `isLoading`
   - `error`
   - `totalResults`
   - `totalPages`
   - `currentPage`
5. Her yeni arama veya filtre değişiminde sayfayı 1’e döndür.
6. Sonuç yoksa mevcut empty state’i koru.
7. Veri yükleme ve arama hatalarını ayrı ve anlaşılır göster.
8. Büyük dataset için her render’da gereksiz tam liste kopyalama veya tekrar sıralama yapma; computed/cache yaklaşımını kullan.

### `CveDetailPage.vue`

1. Axios ile backend’e yapılan CVE detay isteğini kaldır.
2. Route parametresindeki CVE ID ile local dataset’ten kayıt bul.
3. Kayıt bulunamazsa mevcut hata görünümünü kullan.
4. Tarih, CVSS, açıklama, referans ve etkilenen ürün alanlarının eksik olabileceğini güvenli şekilde ele al.
5. Sayfa yenilendiğinde route fallback ile birlikte detay görünümünün çalıştığını doğrula.

### `SearchPage.vue`

1. Arama formunun mevcut route query davranışını koru.
2. Başlangıç sayfasındaki “Elasticsearch Powered”, “Full CVE Database” ve “Real-time Search” ifadelerini gerçek deployment modeline göre güncelle.
3. Veri aralığı sınırlıysa kullanıcıya yanlış biçimde tam CVE veritabanı sunulmadığını belirt.

### Kabul kriterleri

- Ana sayfadan arama başlatılabilir.
- Sonuçlar `frontend/public/data/cves.json` içinden gelir.
- Sonuç sayısı, sayfalama ve filtreler doğru çalışır.
- Bir sonuçtan detay sayfasına gidilebilir.
- Detay sayfası doğrudan URL ile açılabilir.
- Backend veya Elasticsearch kapalı olsa dahi frontend çalışır.

## Aşama 4 — Vercel SPA yapılandırması ve production doğrulaması

### Oluşturulacak/değiştirilecek dosyalar

- `frontend/vercel.json`
- Gerekirse `frontend/vite.config.js`
- Gerekirse `frontend/index.html`
- `frontend/package.json` yalnızca gerekli script veya dependency düzenlemeleri için

### Yapılacaklar

1. `frontend/vercel.json` içinde Vue Router history mode için SPA fallback tanımla.
2. `/data/cves.json` isteğinin `index.html` rewrite’ına yakalanmadığını kontrol et; statik dosya erişimi korunmalı.
3. Vite production build al:
   - `npm run build`
4. Build çıktısında şu dosyanın bulunduğunu doğrula:
   - `dist/data/cves.json`
5. Local production preview çalıştır:
   - `npm run preview`
6. Şu senaryoları test et:
   - `/`
   - `/results?q=...`
   - `/cve/CVE-...`
   - sayfayı doğrudan yenileme
   - geçersiz CVE ID
   - boş sonuç
   - veri yükleme hatası
7. Browser Network panelinde backend/localhost isteklerinin kalmadığını doğrula.
8. Console’da parse, route veya undefined-field hatası olmadığını doğrula.

### Kabul kriterleri

- `npm run build` başarılıdır.
- `dist` içinde dataset vardır.
- SPA route’ları doğrudan açıldığında 404 oluşmaz.
- Frontend yalnızca statik dosya ve local dataset kullanır.

## Aşama 5 — GitHub ve Vercel deployment

### Git kontrolü

1. `cves/` arşiv klasörü `.gitignore` içinde kalmalı.
2. `frontend/public/data/cves.json` bilinçli olarak Git’e dahil edilmeli.
3. `.env` ve secret dosyaları commit edilmemeli.
4. `git status` ile yalnızca beklenen dosyaları kontrol et.
5. Dataset’i commit etmeden önce boyutunu kontrol et.

### GitHub

1. Değişiklikleri ayrı ve açıklayıcı bir commit ile gönder.
2. Repository’de şu dosyaların bulunduğunu kontrol et:
   - `frontend/public/data/cves.json`
   - `frontend/vercel.json`
   - güncellenen frontend kaynak dosyaları
3. `cves/` klasörünün repository’ye dahil olmadığını doğrula.

### Vercel proje ayarları

Vercel’de GitHub repository’sini bağla ve şu ayarları kullan:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable gereksinimi:

- Backend kaldırıldığı için production’da `VITE_API_URL` gerekmemeli.
- Kodda kalan herhangi bir API URL’si varsa deploy’dan önce kaldırılmalı; geçici environment variable ile gizlenmemeli.

### Production smoke test

Deploy sonrası:

1. Ana sayfayı aç.
2. Belirli bir CVE ID ile arama yap.
3. Başlık/açıklama anahtar kelimesiyle arama yap.
4. State ve tarih filtrelerini test et.
5. Sıralamayı test et.
6. Sayfalamayı test et.
7. Sonuç detayına git.
8. Detay URL’sini yeni sekmede ve doğrudan aç.
9. Sayfayı yenile.
10. Tarayıcı Network panelinde tüm isteklerin Vercel domainine veya `/data/cves.json` adresine gittiğini doğrula.
11. Mobil görünümü ve ilk yükleme süresini kontrol et.

## Dosya değişiklik matrisi

| Dosya | İşlem | Gerekçe |
|---|---|---|
| `frontend/public/data/cves.json` | Oluştur | Seçilen CVE dataset’ini statik olarak yayınlamak |
| `frontend/src/api/cveApi.js` | Yeniden düzenle | Ortak local dataset loader/search katmanı |
| `frontend/src/pages/SearchResults.vue` | Değiştir | Elasticsearch POST aramalarını client-side aramaya çevirmek |
| `frontend/src/pages/CveDetailPage.vue` | Değiştir | Backend GET isteğini local kayıt aramasına çevirmek |
| `frontend/src/pages/SearchPage.vue` | Gerekirse değiştir | Deployment modeline uymayan metinleri düzeltmek |
| `frontend/src/components/Filter.vue` | Gerekirse değiştir | Filtre event ve veri modelini local arama katmanına bağlamak |
| `frontend/src/components/Pagination.vue` | Gerekirse değiştir | Local sonuç sayısına göre sayfalama |
| `frontend/src/router/index.js` | Genellikle değiştirme | Mevcut route’ları korumak; Vercel fallback ile tamamlamak |
| `frontend/vercel.json` | Oluştur | Vue Router history fallback |
| `frontend/vite.config.js` | Gerekirse değiştir | Yalnızca build/asset ihtiyacı çıkarsa |
| `frontend/package.json` | Gerekirse değiştir | Kullanılmayan axios bağımlılığını kaldırmak veya scriptleri netleştirmek |
| `.gitignore` | Kontrol et | Ham `cves/` arşivini dışarıda tutmak |
| `docker-compose.yml` | Değiştirme | Local geliştirme için korunabilir; Vercel’de kullanılmaz |
| `src/**` | Production’da kullanma | Backend/Elasticsearch akışını kapsam dışında bırakmak |

## Veri modeli ve uyumluluk kontrolü

Yerel dataset’in, mevcut bileşenlerin beklediği alanları sağlaması gerekir:

- `cveId`
- `title`
- `state`
- `datePublished`
- `descriptions`
- `affected`
- `problemTypes`
- `references`
- `cvssV3_1`
- mevcut detay şablonunun kullandığı diğer alanlar

Ham CVE v5 kayıtları ile frontend’in mevcut Elasticsearch normalize çıktısı aynı değildir. Bu nedenle dataset hazırlama sırasında tek bir frontend veri şekli seçilmeli ve hem liste hem detay sayfası buna göre kullanılmalıdır. Ham kayıtları doğrudan bileşenlere dağıtmak yerine normalize edilmiş shape kullanılması tercih edilir.

## Performans ve Vercel Free riskleri

1. `cves.json` dosyasının tarayıcıya tek seferde indirileceği hesaba katılmalı.
2. Dosya boyutu büyürse:
   - alanları azalt,
   - yalnızca seçilen yılları tut,
   - ayrı indekslenmiş JSON dosyalarına böl,
   - veya statik dataset’i harici CDN/object storage’a taşı.
3. Çok büyük listelerde arama ve sıralama işlemlerini her render’da tekrarlama.
4. İlk yüklemede loading state göster.
5. Dataset’in tamamını ana HTML bundle’ına import etme; `public/data/cves.json` üzerinden ayrı statik asset olarak yükle.
6. `localStorage` yalnızca küçük cache veya kullanıcı tercihleri için kullanılmalı; ana dataset için kullanılmamalı.

## Kapsam dışı

- CVE.org’dan production runtime sırasında veri çekmek.
- Elasticsearch veya Kibana’yı Vercel’e taşımak.
- Backend API’yi Vercel Function’a dönüştürmek.
- Tam CVE arşivini GitHub’a commit etmek.
- Otomatik veri güncelleme pipeline’ı kurmak.
- Kullanıcı authentication veya admin paneli eklemek.

## Son teslim kontrol listesi

- [ ] CVE tarih/yıl aralığı kullanıcı tarafından kesinleştirildi.
- [ ] Dataset resmi kaynaktan alındı.
- [ ] Dataset filtrelendi ve normalize edildi.
- [ ] `frontend/public/data/cves.json` oluşturuldu.
- [ ] Ham `cves/` arşivi Git dışında tutuldu.
- [ ] Frontend’de tüm localhost/API çağrıları kaldırıldı.
- [ ] Ortak local data service kullanılıyor.
- [ ] Arama çalışıyor.
- [ ] Filtreler çalışıyor.
- [ ] Sıralama çalışıyor.
- [ ] Sayfalama çalışıyor.
- [ ] CVE detay sayfası çalışıyor.
- [ ] Dataset yükleme hatası görünür.
- [ ] Vue Router Vercel fallback yapılandırıldı.
- [ ] `npm run build` başarılı.
- [ ] `dist/data/cves.json` mevcut.
- [ ] Vercel Root Directory `frontend`.
- [ ] Production smoke test tamamlandı.
- [ ] Vercel deployment URL’si ile doğrudan route ve refresh test edildi.
