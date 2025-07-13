# Elasticsearch

Projenin Amacı:  

   Bu proje, cve.org veritabanındaki 27 yıllık CVE kayıtlarını (CVEID) içeren JSON dosyalarını Elasticsearch’e yüklemek ve Kibana üzerinden sorgulamak için hazırlanmıştır. Projede dynamic mapping kullanılmakta ve sorgulamalar Kibana ve web arayüzü üzerinden yapılmaktadır. Backend olarak Node.js üzerinde Express.js kullanılmıştır. Projede aynı zamanda search optimization, text analysis & normalization, data modeling for search ve query design & optimization konuları uygulanmıştır.

Kullanılan Teknolojiler:  
- Elasticsearch  
- Kibana  
- Node.js  
- Express.js  
- @elastic/elasticsearch  
- HTML/CSS (UI için)  
- EJS (template engine)

Kurulum:  
1. Elasticsearch ve Kibana Docker container’larını çalıştırın.  
2. Proje dizininde terminal açarak aşağıdaki komutu çalıştırın:  
   npm install

Çalıştırma:  
1. Elasticsearch ve Kibana’nın çalıştığından emin olun.  
2. Proje dizininde aşağıdaki komutu çalıştırarak server’ı başlatın:  
   npm start  
3. Tarayıcıdan http://localhost:3000 adresine giderek web UI’ye ulaşabilirsiniz.  
4. Kibana için tarayıcıdan http://localhost:5601 adresine gidin.

Proje Yapısı:  
CVELIST/  
├── package.json  
├── README.txt  
├── cves/                     # CVE JSON dosyalarının bulunduğu klasör  
├── app.js                    # CVE dosyalarının dizinlerini çıkaran optimize kod  
├── src/  
│   ├── elastic/              # Elasticsearch bağlantısı ve servis katmanı  
│   │   ├── elasticClient.js  
│   │   ├── indexService.js  
│   │   ├── mappingService.js  
│   │   ├── bulkInsertService.js  
│   │   └── searchService.js  
│   ├── controllers/          # HTTP request/controller mantığı  
│   │   └── cveController.js  
│   ├── routes/               # Express.js route tanımları  
│   │   └── cveRoutes.js  
│   ├── views/                # UI (HTML/EJS)  
│   │   └── index.ejs  
│   └── server.js             # Express.js server giriş noktası

RESTful API Endpointleri:  
- GET /cve                 : Tüm kayıtları getirir  
- POST /cve/search         : Kullanıcının formdan gönderdiği aramayı yapar  
- POST /cve/bulkload       : CVE JSON verilerini Elasticsearch’e yükler

Önemli Notlar:  
- Dynamic mapping ve custom analyzer ile case-insensitive, normalize edilmiş veriler yüklenir.  
- Versiyon numaraları ayrı bir field olarak işlenir ve sıralama yapılabilir.  
- Kibana üzerinden verilerinizi sorgulayabilir ve görselleştirebilirsiniz.  
- cves/ dizini içinde toplam 300,000+ JSON dosyası bulunmaktadır.  
- app.js dosyası, bu dizini tarayarak verilerin dizinlerini optimize bir şekilde çıkarır.  
- Projede search optimization, text analysis & normalization, data modeling for search ve query design & optimization prensipleri uygulanmıştır.

Katmanlar:  
- elastic/       : Elasticsearch bağlantısı ve işlemler  
- controllers/   : HTTP isteklerini karşılayan mantık  
- routes/        : HTTP endpoint tanımları  
- views/         : Kullanıcı arayüzü  
- server.js      : Express.js server başlatma
