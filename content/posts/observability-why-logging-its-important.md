---
title: "Observability Why Logging Its Important"
date: 2024-07-28T09:06:36+07:00
tags: ["tips", "backend engineering"]
cover:
  image: "/images/observability-why-logging-its-important/cover.webp"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

> **English Version**: *For English version of this article, please visit: [dev.to](https://dev.to/tentanganak/observability-why-logging-its-important-104b)*

Dalam era digital yang semakin kompleks, observabilitas adalah kunci utama dalam mengelola sistem perangkat lunak modern. Salah satu pilar terpenting dari observabilitas adalah **logging**. Mari kita jelajahi mengapa logging sangat penting dan bagaimana cara memanfaatkannya secara optimal.

## Apa itu Logging?

Logging adalah proses pencatatan aktivitas dan kejadian dalam sistem. Ini mencakup berbagai informasi, mulai dari pesan error, aktivitas pengguna, hingga performa sistem. Bayangkan logging sebagai 'kotak hitam' pesawat terbang untuk sistem Anda - selalu merekam apa yang terjadi, siap memberikan wawasan ketika dibutuhkan.

## Mengapa Logging Sangat Penting?
Berikut beberapa poin yang dapat dipertimbangkan mengapa log itu penting:

1. Pemecahan Masalah yang Lebih Cepat
   Dengan log yang baik, tim pengembang dapat mengidentifikasi akar permasalahan tanpa menebak-nebak. Ini seperti memiliki peta harta karun saat mencari bug!

2. Peningkatan Keamanan
   Log dapat menjadi 'mata-mata' Anda dalam mendeteksi aktivitas mencurigakan. Tim keamanan dapat merespons ancaman lebih cepat, seperti memiliki pemadam kebakaran yang selalu siaga.

3. Analisis Performa
   Melalui log, Anda dapat mengidentifikasi bottleneck dalam sistem. Ini seperti memiliki dokter pribadi untuk kesehatan aplikasi Anda.

4. Memahami Perilaku Pengguna
   Log aktivitas pengguna memberikan wawasan berharga tentang bagaimana produk digunakan. Ini seperti memiliki asisten pribadi yang terus mengamati dan melaporkan preferensi pelanggan.

## Best Practices dalam Logging

Untuk memaksimalkan manfaat logging, berikut adalah beberapa best practices yang dapat dilakukan:

### Menentukan Level Log yang Tepat

Menggunakan level log yang tepat dapat membantu Anda menyaring informasi dengan cepat, seperti mengurutkan log berdasarkan tingkat urgensi.

Berikut adalah contoh menampilkan log menggunakan bahasa Golang dengan berbagai level. Di sini kita menggunakan [Logrus](https://github.com/sirupsen/logrus).

```go
package main

import (
	"github.com/sirupsen/logrus"
)

func main() {
	log := logrus.New()
	log.SetLevel(logrus.DebugLevel)

	log.Debug("Memulai aplikasi..")
	log.Info("Pengguna berhasil login")
	log.Warn("Penggunaan CPU melebihi 80%")
	log.Error("Gagal menyimpan data ke database")
	log.Fatal("Terjadi error kritis, aplikasi akan berhenti")
}
```
Berikut adalah penjelasan untuk beberapa level log di atas:

- **DEBUG**: Informasi detail untuk debugging, biasanya hanya diaktifkan selama pengembangan.
- **INFO**: Informasi umum tentang alur normal aplikasi.
- **WARNING**: Untuk situasi yang berpotensi menjadi masalah di masa depan, tetapi tidak menghentikan aplikasi.
- **ERROR**: Kesalahan yang menyebabkan fungsi tertentu gagal, tetapi aplikasi masih berjalan.
- **FATAL**: Kesalahan serius yang dapat menyebabkan aplikasi berhenti.

### Sertakan informasi kontekstual yang relevan

Setiap entri log harus memberikan konteks yang cukup untuk memahami apa yang terjadi. Ini dapat mencakup:
- Timestamp.
- ID transaksi atau sesi.
- ID pengguna (jika relevan).
- Nama fungsi atau modul.
- Data input yang relevan (hati-hati dengan data sensitif).
- Stack trace untuk error

Ini adalah contoh kode saat mencetak log, termasuk informasi konteks yang akan membantu kita melakukan tracing.
```go
package main

import (
	"github.com/sirupsen/logrus"
	"time"
)

type UserAction struct {
	UserID    int
	Action    string
	Timestamp time.Time
}

func main() {
	log := logrus.New()
	log.SetLevel(logrus.DebugLevel)
	
	// Menggunakan format json
	log.SetFormatter(&logrus.JSONFormatter{})

	// Data dummy
	action := UserAction{
		UserID:    12345,
		Action:    "checkout",
		Timestamp: time.Now(),
	}

	// Mencetak log
	log.WithFields(logrus.Fields{
		"user_id":    action.UserID,
		"action":     action.Action,
		"timestamp":  time.Now().Format(time.RFC3339),
		"session_id": generateSessionID(),
		"module":     "payment_processor",
		"ip_address": "192.168.1.100",
	}).Error("Pembayaran gagal")

}

func generateSessionID() string {
	return "sess_abc123"
}
```

Kita dapat melihat bahwa kita telah menyertakan beberapa elemen informasi konteks yang dapat memudahkan kita untuk melakukan tracing di masa depan. Apa kemudahan yang dimaksud, yaitu kita dapat mencari log berdasarkan `level`, misalnya level error pada contoh kode di atas, dan juga berdasarkan waktu dan lainnya berdasarkan informasi yang kita masukkan.

### Gunakan format yang konsisten

Format log yang konsisten membuat parsing dan analisis lebih mudah, terutama jika menggunakan tools otomatis (mengenai tools, akan dibahas di bawah). Format juga memudahkan kita untuk mencari log berdasarkan kriteria, misalnya level log, pesan, atau waktu. Contoh format:

```javascript
[TIMESTAMP] [LEVEL] [MODULE] [MESSAGE]
```

Atau format JSON untuk parsing yang mudah seperti hasil pada contoh kode di atas:

```go
{
    "action": "checkout",
    "ip_address": "192.168.1.100",
    "level": "error",
    "module": "payment_processor",
    "msg": "Pembayaran gagal",
    "session_id": "sess_abc123",
    "time": "2024-06-26T20:59:02+07:00",
    "timestamp": "2024-06-26T20:59:02+07:00",
    "user_id": 12345
}
```

### Implementasikan rotasi log untuk mengelola ukuran file

Rotasi log mencegah file log menjadi terlalu besar dan sulit dikelola. Ini melibatkan:

- Membatasi ukuran file log.

- Membuat file log baru secara berkala (misalnya harian atau mingguan).

- Mengarsipkan atau menghapus file log lama.

- Menggunakan tools seperti logrotate di Linux atau framework logging yang mendukung rotasi.

### Pertimbangkan privasi dan keamanan dalam informasi yang dicatat

Keamanan dan privasi sangat penting dalam logging:

- Jangan mencatat data sensitif seperti password atau informasi kartu kredit.

- Samarkan atau enkripsi data pribadi jika diperlukan.

- Pastikan akses ke file log hanya terbatas pada personel yang berwenang.

- Implementasikan kebijakan retensi untuk menghapus log lama sesuai kebijakan perusahaan dan regulasi.

## Tools untuk Monitoring dan Analisis Log

Seiring dengan meningkatnya kompleksitas sistem, kebutuhan akan tools yang canggih untuk monitoring dan analisis log juga semakin penting. Berikut adalah beberapa tools populer yang dapat membantu dalam observabilitas dan analisis log:

1. Grafana
   Grafana adalah platform open-source untuk memvisualisasikan data log kita. Tools ini dapat diintegrasikan ke berbagai sumber data termasuk log. Memungkinkan pembuatan dashboard yang disesuaikan dan interaktif. Cocok untuk visualisasi real-time dari metrik dan log.

2. New Relic
   New Relic adalah platform observabilitas all-in-one
   Menyediakan analisis log, tracing, dan metrik dalam satu tempat. Ada juga fitur AI untuk mendeteksi anomali dan mengkorelasikan masalah.
   Cocok untuk monitoring aplikasi dan infrastruktur berskala besar.

3. Loki
   Loki adalah sistem agregasi log yang ringan dan cost-effective. Loki dirancang untuk bekerja dengan baik bersama Grafana
   Menggunakan indeks berbasis label, mirip dengan Prometheus
   Ideal untuk organisasi yang sudah menggunakan Prometheus dan Grafana.

4. AWS CloudWatch Logs Insights
   Layanan analisis log terintegrasi dari AWS ini memungkinkan query dan analisis log dari berbagai layanan AWS.
   Fitur untuk mendeteksi query lambat di RDS dan layanan database lainnya
   Integrasi mudah dengan layanan AWS lainnya.

## Kesimpulan
Logging bukan hanya fitur tambahan, tetapi komponen vital dalam membangun sistem yang dapat diandalkan. Dengan implementasi yang tepat, logging dapat menjadi supersensor Anda - memberikan visibilitas penuh terhadap operasi sistem, membantu mencegah masalah sebelum terjadi, dan mempercepat resolusi ketika masalah muncul.

Jadi, mulailah berinvestasi dalam praktik logging yang baik hari ini. Ingat, di dunia teknologi yang kompleks, log yang baik dapat menjadi cahaya pemandu di tengah badai!

Jika Anda memiliki informasi tambahan, silakan masukkan di kolom komentar di bawah.

## Referensi Bacaan
- [Github Repository](https://github.com/letenk/logging_with_logrus)
- [Application Logging and its importance](https://medium.com/ula-engineering/application-logging-and-its-importance-c9e788f898c0)
- [Why is Log Management Important?](https://graylog.org/post/why-is-log-management-important/)
- [10 Observability Tools in 2024: Features, Market Share and Choose the Right One for You](https://www.zenduty.com/blog/observability-tools/)
- [Top 20 Best Log Analysis Tools and Log Analyzer (Pros and Cons)](https://cloudinfrastructureservices.co.uk/top-20-best-log-analysis-tools-and-log-analyzers/)
