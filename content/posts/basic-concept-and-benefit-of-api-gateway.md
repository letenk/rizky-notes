---
title: "Basic Concept and Benefit of Api Gateway"
date: 2025-03-27T09:57:41+07:00
tags: ["tips", "backend engineering", "System Design"]
cover:
  image: "/images/basic-concept-and-benefit-of-api-gateway/cover.webp"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

> **English Version**: *For English version of this article, please visit: [dev.to](https://dev.to/tentanganak/connection-pool-in-backend-development-basic-concept-benefits-and-implementation-4bh0)*

##### Photo by <a href="https://unsplash.com/@soymeraki?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Javier Allegue Barros</a> on <a href="https://unsplash.com/photos/silhouette-of-road-signage-during-golden-hour-C7B-ExXpOIE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

API Gateway adalah komponen penting dalam arsitektur perangkat lunak modern, terutama dalam sistem yang mengimplementasikan microservices. API Gateway bertindak sebagai gerbang utama untuk menerima semua permintaan API yang masuk. Dengan peran ini, API Gateway menyederhanakan manajemen API dan meningkatkan kinerja dan keamanan sistem secara keseluruhan.

Menggunakan API Gateway membantu membangun sistem yang **scalable** dan **mudah dipelihara**. Seiring dengan meningkatnya kompleksitas sistem, API Gateway memainkan peran kritis dalam mengelola integrasi dan komunikasi yang efektif antara berbagai layanan backend dan klien.

Dalam artikel ini, kita akan mempelajari **konsep dasar** dan **manfaat** dari penggunaan API Gateway. Harapannya artikel ini dapat memberikan pemahaman baru atau memperkuat wawasan yang sudah Anda miliki.

# Apa itu API Gateway ?
API Gateway adalah alat manajemen API yang berada di antara klien dan kumpulan layanan backend. Ini bertindak sebagai perantara, mengarahkan permintaan klien ke layanan backend yang sesuai yang diperlukan untuk memenuhinya dan kemudian mengembalikan respons yang sesuai. Selain itu, API Gateway menyediakan beberapa fitur penting seperti **load balancing, circuit breaking, logging, authentication, dan caching**, menjadikannya komponen krusial dalam arsitektur API modern.

Di dunia pengembangan digital yang bergerak cepat saat ini, efisiensi adalah segalanya, itulah mengapa API Gateway telah menjadi penting dalam proyek perangkat lunak modern. Bertindak sebagai **titik kontrol terpusat untuk API** di seluruh arsitektur microservices yang menangani ribuan panggilan API bersamaan secara efisien.

# Bagaimana API Gateway bekerja ?
API Gateway bekerja dengan menerima permintaan dari internal dan eksternal, yang disebut "API Calls". API Gateway sebagai lapisan perangkat lunak yang mengelola lalu lintas untuk mengarahkannya ke API yang sesuai dan kemudian menyampaikan respons kepada pengguna atau perangkat tertentu yang membuat permintaan.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7rliw8ixuw1ie048w7pc.png)

Ini adalah penjelasan Alur Kerja API Gateway dari gambar di atas:
1. Klien (browser, aplikasi mobile, atau layanan lain) mengirimkan permintaan API.
2. API Gateway memproses permintaan dengan mengarahkan permintaan ke layanan backend yang benar.
3. Layanan backend memproses permintaan dan mengirimkan respons.
4. API Gateway memodifikasi atau meningkatkan respons.
5. Akhirnya, respons dikembalikan ke klien.

# Manfaat API Gateway
Menggunakan API Gateway dapat membawa beberapa manfaat seperti **meningkatkan kinerja**, **meningkatkan keamanan**, **kemudahan pemeliharaan beberapa layanan backend**. Berikut adalah beberapa manfaat utama menggunakan API Gateway:

## 1. Keamanan yang Ditingkatkan
API Gateway menerapkan kebijakan autentikasi dan otorisasi, memastikan bahwa hanya pengguna yang berwenang yang dapat mengakses layanan backend. Selain itu, ini dapat membantu mengurangi ancaman keamanan melalui:
- **Rate limiting** untuk mencegah penyalahgunaan API dan serangan DDoS.
- **IP whitelisting dan blacklisting** untuk membatasi akses.
- **TLS encryption** untuk mengamankan komunikasi antara klien dan layanan.

## 2. Monitoring dan Visibilitas yang Lebih Baik
API gateway dapat mengumpulkan metrik dan data lain tentang permintaan dan respons, memberikan wawasan berharga tentang kinerja dan perilaku sistem. Ini dapat membantu mengidentifikasi dan mendiagnosis masalah, dan meningkatkan keandalan dan ketahanan sistem secara keseluruhan.

## 3. Transformasi Format Data
API Gateway dapat mengonversi permintaan dan respons atau format data (misalnya, JSON ke XML). Membuatnya lebih mudah untuk mengelola format data saat diperlukan.

## 4. Versioning API dan Kompatibilitas Mundur
API Gateway dapat mengelola beberapa versi API, memungkinkan pengembang untuk memperkenalkan fitur baru atau membuat perubahan tanpa merusak klien yang ada. Ini memungkinkan transisi yang lebih lancar untuk klien dan mengurangi risiko gangguan layanan.

## 5. Penanganan Error yang Ditingkatkan
API Gateway dapat menyediakan cara yang konsisten untuk menangani error dan menghasilkan respons error, meningkatkan pengalaman pengguna dan memudahkan untuk mendiagnosis dan memperbaiki masalah.

# Kekurangan Implementasi API Gateway
Selain memiliki banyak manfaat yang kita dapatkan ketika mengimplementasikan API Gateway, di sisi lain kita juga memiliki kerugian dalam menggunakannya, berikut beberapa poinnya:

## 1. Single Point of Failure
Karena API Gateway bertindak sebagai titik akses terpusat untuk semua permintaan API, ini dapat menjadi single point of failure jika tidak dikelola dengan baik. Jika gateway mengalami downtime, ini dapat mengganggu seluruh ekosistem API.

## 2. Kompleksitas Tambahan
Mengintegrasikan API Gateway memperkenalkan lapisan kompleksitas tambahan ke arsitektur Anda. Ini memerlukan konfigurasi, monitoring, dan pemeliharaan yang cermat. Jika tidak dikelola secara efisien, ini dapat memperlambat pengembangan dan meningkatkan overhead operasional.

## 3. Peningkatan Latensi
API Gateway memproses permintaan yang masuk sebelum meneruskannya ke layanan yang sesuai, yang dapat menyebabkan latensi. Penundaan ini dapat mempengaruhi kinerja sistem secara keseluruhan, terutama jika beberapa langkah pemrosesan (seperti autentikasi, logging, dan rate limiting) terlibat.

## 4. Biaya
Mengoperasikan API Gateway, terutama di lingkungan lalu lintas tinggi, dapat menambah biaya signifikan ke infrastruktur Anda. Biaya dapat mencakup hosting, biaya lisensi, atau layanan API Gateway terkelola dari penyedia cloud.

# Contoh Sederhana API Gateway
Untuk mengimplementasikan API Gateway, Anda dapat menggunakan API Gateway populer seperti **Nginx**, **Kong**, **KrakenD**, dan banyak pilihan populer lainnya. Namun, tujuan kita untuk topik ini adalah memahami bagaimana API Gateway bekerja. Jadi, kita dapat memahami dengan mudah membangun API Gateway sederhana menggunakan golang. Mari kita mulai.

> Untuk kode lengkap Anda dapat melihat repository berikut: [Click me](https://github.com/letenk/simply-api-gateway)

## Struktur Folder
Kita dapat membuat API Gateway sederhana mengikuti struktur folder:

```go
├── Makefile
├── api_gateway
│   ├── go.mod
│   ├── go.sum
│   └── main.go
├── service_cart
│   ├── go.mod
│   ├── go.sum
│   └── main.go
├── service_order
│   ├── go.mod
│   ├── go.sum
│   └── main.go
└── service_product
    ├── go.mod
    ├── go.sum
    └── main.go
```

## Kode Fungsi Rate Limitter
Pertama, kita dapat membuat file dengan nama **main.go** di folder **api_gateway** yang berisi: 
```go
package main

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

func rateLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Expiration: time.Second * 60,
		Max:        5,
	})

}
```

Fungsi **rateLimiter()** digunakan untuk membatasi jumlah permintaan per klien. Di mana rate limiter ini berguna untuk **Mencegah penyalahgunaan & DDoS**, **Mengontrol lalu lintas API**, **Melindungi layanan backend dari overload**. 

Dengan konfigurasi `Expiration: time.Second, Max: 5`, setiap klien hanya dapat membuat 5 permintaan per detik. Jika batas ini tercapai, klien akan menerima error **HTTP 429 Too Many Requests**. Setelah 1 detik, batas akan direset dan klien dapat mengirim permintaan lagi.

## Kode Fungsi Proxy
Kedua, kita juga membuat fungsi dengan nama **reverseProxy**:
```go

package main

import (
	// ... other import libraries
        "log"
        "github.com/gofiber/fiber/v2/middleware/proxy"
)

// ... rate limitter function

func reverseProxy(target string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		url := target + c.OriginalURL()
		return proxy.Do(c, url)
	}
}

```

Fungsi **proxy(target string)** digunakan untuk meneruskan permintaan (proxy requests) dari klien ke server backend lain yang ditentukan dalam target. Fungsi ini mengembalikan **middleware handler (fiber.Handler)** yang dapat digunakan pada Fiber.

Kita juga melihat **c.OriginalURL()** mengembalikan path dan query parameters dari permintaan asli yang dikirim oleh klien. Misalnya, jika klien mengakses http://localhost:3000/api/orders?id=10, maka:
```json
/api/orders?id=10
```

Dan terakhir kita mengembalikan **proxy.Do(c, url)** digunakan untuk meneruskan permintaan ke url tujuan. Url ini adalah kombinasi dari target dan c.OriginalURL(), sehingga semua permintaan yang masuk akan diarahkan ke server lain dengan path yang sama. Dengan cara ini, permintaan yang masuk ke API Gateway akan otomatis diarahkan ke layanan backend yang sesuai tanpa klien mengetahuinya.

## Kemudian Kode Fungsi Main
Dan file terakhir kita membuat fungsi **main**, adalah entrypoint dari aplikasi ini. Dalam hal ini, bertindak sebagai API Gateway. Kodenya seperti ini:

```go
package main

import (
	// ... other import libraries
        "github.com/gofiber/fiber/v2/middleware/logger"
)


func main() {
	app := fiber.New()

	app.Use(logger.New())

	// Implement rate limitter
	app.Use(rateLimiter())

	// Implement proxy
	// Redirect request to service product
	app.Use("/product", reverseProxy("http://localhost:5001"))

	// Redirect request to service order
	app.Use("/order", reverseProxy("http://localhost:5002"))

	// Redirect request to service cart
	app.Use("/cart", reverseProxy("http://localhost:5003"))

	port := ":3000"
	log.Printf("Starting API Gateway in port %s", port)
	log.Fatal(app.Listen(port))
}
```

Kita dapat fokus pada bagian kode: 
```go
	// Implement rate limitter
	app.Use(rateLimiter())
```

Kode ini menerapkan rate limiting ke seluruh aplikasi dengan middleware limiter Fiber. Middleware ini dipasang dengan **app.Use(rateLimiter())**, yang berarti akan berlaku untuk semua route. Fungsi **rateLimiter()** mengembalikan middleware rate limiter yang kita buat sebelumnya dengan **limiter.New()**.

Dan juga untuk beberapa kode ini:
```go
    // Implement proxy
	// Redirect request to service product
    app.Use("/product", reverseProxy("http://localhost:5001"))

	// Redirect request to service order
	app.Use("/order", reverseProxy("http://localhost:5002"))

	// Redirect request to service cart
	app.Use("/cart", reverseProxy("http://localhost:5003"))
```

Kode ini menggunakan fungsi **reverseProxy** yang kita buat sebelumnya, yang akan meneruskan permintaan ke layanan yang sesuai.

Seperti yang kita ketahui di bagian **Struktur Folder**, kita juga memiliki beberapa folder service yang akan diarahkan sesuai dengan permintaan yang masuk dari klien.

> Untuk kode lengkap Anda dapat melihat repository berikut: [Click me](https://github.com/letenk/simply-api-gateway)

## Mari Jalankan
Untuk menjalankannya ada beberapa cara, jika Makefile terinstall di komputer Anda, Anda hanya perlu menjalankan perintah di bawah ini di terminal pada folder root project:

```go
make run
```

Jika tidak, Anda dapat menjalankannya satu per satu dengan masuk ke semua folder dan mulai menjalankan dengan perintah:
```go
cd service_product && go run main.go

cd service_order && go run main.go

cd service_cart && go run main.go

cd api_gateway && go run main.go

```

Jika berhasil, Anda dapat melihat tampilan seperti ini:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1psq6jg2zj57oyj0w1jx.png)

Dari gambar di atas Anda dapat melihat beberapa layanan berjalan di port masing-masing.

```go
Service API Gateway berjalan di port 3000

Service product berjalan di port 5001

Service order berjalan di port 5002

Service cart berjalan di port 5003
```

Inilah keuntungan menggunakan API Gateway, bayangkan Anda memiliki lebih dari 3 layanan dan di klien kita memiliki beberapa fitur yang harus dijalankan secara bersamaan. Apakah kita harus mendefinisikan url dengan setiap port spesifik? tentu saja itu sangat merepotkan. Dan nanti salah satu layanan harus mengubah alamat url-nya, tentu saja lebih merepotkan lagi harus refactor sana-sini di sisi klien.

Tapi dengan API Gateway Anda hanya perlu mengetahui url di API Gateway dan mendefinisikan url yang sesuai, mari kita coba mengakses beberapa layanan melalui url API Gateway saja. Jalankan perintah ini:
```
curl http://localhost:3000/product/1
curl http://localhost:3000/order
curl http://localhost:3000/cart
```

Dan hasilnya adalah Anda dapat mengakses beberapa layanan dengan hanya satu URL.

<!-- add image curl result -->
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8iidjtkylpt2i98zptoi.png)

Dan di log Anda dapat melihat bahwa api gateway sebenarnya meneruskan permintaan ke layanan yang sesuai dengan alamat yang dipanggil.

<!-- add image log -->
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kii6jugw66v2gow0mehi.png)

Dan saya memberikan tugas yang menantang, coba buat lebih banyak permintaan daripada maksimum rate limiter yang telah kita atur dalam fungsi **rateLimiter** sampai Anda mendapatkan error **HTTP 429 Too Many Requests**.

# Kesimpulan
API Gateway bertindak sebagai gerbang utama untuk mengelola lalu lintas permintaan dalam sistem microservice. Dengan rate limiting, API lebih aman dari penyalahgunaan seperti DDoS. Reverse proxy memungkinkan permintaan diarahkan ke layanan backend yang sesuai tanpa mengubah sisi klien, meningkatkan fleksibilitas dan kemudahan manajemen. Selain itu, API Gateway juga mendukung caching, logging, monitoring, dan fitur keamanan lainnya seperti authentication & authorization. Dengan implementasi yang tepat, API Gateway dapat meningkatkan keamanan, kinerja, dan skalabilitas sistem secara keseluruhan.

Namun, mengimplementasikan API Gateway juga memiliki beberapa kekurangan yang harus kita sadari seperti single point of failure, kompleksitas tambahan, peningkatan latensi, dan biaya operasional yang lebih tinggi. Meskipun ada kekurangan ini, API Gateway yang diimplementasikan dengan baik tetap penting untuk arsitektur microservice yang scalable dan aman.

Semoga artikel ini dapat membantu meningkatkan pemahaman atau mengingat kembali apa yang sudah diketahui. Jika Anda memiliki tambahan atau koreksi terhadap pembahasan di atas, mari diskusikan di kolom komentar. Semoga membantu 👋.

## Referensi Bacaan
- [What is an API Gateway?](https://konghq.com/blog/learning-center/what-is-an-api-gateway)
- [What does an API gateway do?](https://www.redhat.com/en/topics/api/what-does-an-api-gateway-do)
- [Advantages and disadvantages of using API gateway](https://www.designgurus.io/course-play/grokking-system-design-fundamentals/doc/advantages-and-disadvantages-of-using-api-gateway)
- [Deciphering the Decision: Should You Use an API Gateway or Not?](https://medium.com/@ftieben/deciphering-the-decision-should-you-use-an-api-gateway-or-not-6f371ad4ce00)