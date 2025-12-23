---
title: "Connection Pool in Backend Development Basic Concept Benefits and Implementation"
date: 2025-02-06T09:46:35+07:00
tags: ["go", "golang", "tips"]
cover:
  image: "/images/connection-pool-in-backend-development-basic-concept-benefits-and-implementation/cover.webp"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

> **English Version**: *For English version of this article, please visit: [dev.to](https://dev.to/tentanganak/connection-pool-in-backend-development-basic-concept-benefits-and-implementation-4bh0)*

##### Photo by <a href="https://unsplash.com/@buying_thyme?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Christine Tutunjian</a> on <a href="https://unsplash.com/photos/assorted-color-balloons-7oLuQ0ZEQ9A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

Connection Pooling adalah mekanisme yang menciptakan dan mengelola kumpulan koneksi database yang dapat digunakan oleh aplikasi. Konsep ini penting dalam mengelola koneksi ke database dengan tujuan mengoptimalkan penggunaan sumber daya dan meningkatkan performa aplikasi yang sering berinteraksi dengan database.

Alih-alih membuat koneksi baru setiap kali dibutuhkan (yang mahal dari segi waktu dan sumber daya), connection pool memungkinkan aplikasi meminjam/menggunakan koneksi yang sudah ada dan mengembalikannya ke pool ketika selesai menggunakannya. Itulah mengapa disebut **connection pool**.

## Mengapa connection pool penting ?
Pertanyaan penting adalah mengapa connection pooling penting? mengapa tidak hanya membuat 1 koneksi untuk digunakan bergantian. Mari kita bahas 1 per 1 mengapa connection pooling penting.

### Performa yang lebih baik
Membuka koneksi baru ke database dapat memakan waktu karena melalui beberapa proses seperti autentikasi, pengaturan jaringan dan sebagainya. Dengan connection pool, aplikasi dapat menghindari proses ini karena koneksi sudah tersedia jika dibutuhkan.

### Penghematan sumber daya
Tanpa pool, jika aplikasi mendapat 100 request, aplikasi akan membuat 100 koneksi baru. Hal ini dapat membebani server database yang selalu sibuk melakukan proses inisialisasi. Connection pool dapat membatasi jumlah koneksi yang digunakan secara bersamaan, hal ini menjaga beban server database tetap stabil.

### Skalabilitas
Connection pooling membantu aplikasi mengelola beban dengan baik ketika aplikasi scale up. Dengan pengaturan connection pooling yang baik, kita dapat menangani banyak request yang datang bersamaan dan memastikan aplikasi tetap responsif.

### Konfigurasi beban
Connection pool dapat dikonfigurasi dengan jumlah maksimum koneksi sesuai kebutuhan. Sehingga dapat mencegah aplikasi membanjiri koneksi ke database.

## Bagaimana Cara Kerjanya ?
Sekarang setelah kita memahami mengapa connection pooling penting untuk digunakan, kita akan membahas bagaimana connection pooling bekerja.

### Inisialisasi Pool
Pertama kali aplikasi dijalankan, ia membuat sejumlah koneksi ke database (misalnya, 10 koneksi). Jumlah ini disebut **Pool size**. Koneksi ini akan menganggur menunggu untuk digunakan.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7u7gb5oktn39jso9udvo.png)

### Penggunaan koneksi

Ketika aplikasi membutuhkan koneksi ke database, ia tidak lagi membuat koneksi baru, melainkan meminta koneksi dari pool. Jika koneksi tersedia di pool, maka akan diberikan ke aplikasi. Jika tidak ada koneksi yang tersedia, aplikasi mungkin harus menunggu sampai koneksi dilepaskan dan kembali ke pool setelah digunakan oleh proses lain.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2x21w8mjh95ab3s9pq4k.png)

### Mengembalikan koneksi
Setelah aplikasi selesai menggunakan koneksi, ia tidak akan menutup koneksi tersebut. Sebaliknya, koneksi dikembalikan ke pool untuk digunakan lagi oleh request selanjutnya.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6u4x5nhh1zypyds0hmjt.png)

## Parameter utama yang umum dalam connection pool
Berikut adalah beberapa parameter utama yang umum digunakan ketika membuat connection pool. Saya akan mencoba menjelaskan secara detail disertai analogi yang dapat membantu kita memahami setiap konteks dengan lebih baik.

### Pool Size
Kita dapat menentukan jumlah koneksi yang disediakan dalam **Pool Size**. Jika semua koneksi digunakan maka ketika ada request untuk menggunakan koneksi maka akan mengantri menunggu koneksi yang tersedia atau akan gagal jika antrian penuh.

Misalnya, jika kita set max pool size menjadi 10, hanya 10 koneksi aktif yang dapat digunakan oleh aplikasi. Jika request ke-11 datang, request ini akan menunggu koneksi dari pool yang sudah digunakan. Analoginya seperti ini:

- Bayangkan ada **tempat parkir,** jika semua slot penuh, mobil baru yang ingin masuk **(connection request)** harus menunggu sampai mobil lain keluar **(idle connection).**
- Jika kita ingin menampung lebih banyak mobil, kita harus membangun lebih banyak slot parkir (menambah **MaxPoolSize)** sehingga kita dapat menampung lebih banyak mobil. Tapi ada biaya pemeliharaan yang meningkat (**server resources).**

### Minimum Connections
Minimum connection adalah jumlah minimum koneksi yang akan dibuat pertama kali aplikasi dijalankan. Ini adalah koneksi yang akan selalu standby menunggu untuk digunakan, bahkan ketika tidak ada request. Misalnya, jika kita set **minimum pool size 5,** pool akan memastikan selalu ada 5 koneksi idle. Bahkan jika tidak ada request aktif, pool akan tetap memastikan 5 koneksi ini terbuka untuk mengurangi waktu pembukaan koneksi ketika request masuk.

Hal ini berguna untuk mengantisipasi beban yang tidak menentu, misalnya tiba-tiba aplikasi kita mendapat banyak request dan koneksi tersedia siap digunakan tanpa harus membuka koneksi baru. Analoginya seperti ini:

- Bayangkan sebuah restoran memiliki 10 kursi yang sengaja tidak disusun di ruang makan, tapi disimpan di gudang. Tapi ketika ada banyak pengunjung, kita memerlukan kursi tambahan, kita tidak perlu waktu lama untuk membelinya di toko. Tapi cukup pergi ke gudang dan mengambil 10 kursi yang diperlukan untuk digunakan.

### Idle Connection
Idle connection adalah jumlah koneksi yang tidak sedang digunakan namun tetap terbuka dalam pool, yang juga bisa disebut "idle connections". Parameter ini biasanya diatur oleh:

- **Maximum Idle Time**: Berapa lama koneksi idle dipelihara sebelum ditutup.
- **Maximum Idle Connections**: Jumlah koneksi idle yang diizinkan tersisa di pool.

Misalnya, jika kita set **MaxIdleConnections = 5,** pool akan memelihara maksimal 5 koneksi idle. Jika ada lebih banyak koneksi idle maka akan ditutup. Jika tidak ada request baru dalam waktu tertentu (misalnya, 10 menit), koneksi idle ini mungkin akan dihapus untuk menghemat sumber daya. Analoginya seperti ini:

- Di supermarket ada 5 kasir, 3 kasir sedang melayani pembeli (active connection) dan 2 kasir standby di posisi mereka tanpa antrian pembeli (idle connection) dan siap kapanpun pembeli datang.
- Supermarket memiliki aturan, "Jika kasir standby selama 30 menit tanpa pelanggan, maka mereka bisa pulang." 30 menit ini adalah idle time.

### Timeout
Kita dapat mengatur waktu maksimum aplikasi menunggu koneksi dari pool sebelum gagal (error). Hal ini dilakukan untuk mencegah aplikasi menunggu terlalu lama untuk koneksi yang tersedia dari pool, jika pool sedang sibuk atau penuh. Ini berguna untuk mencegah aplikasi menunggu terlalu lama untuk koneksi yang akan menyebabkan aplikasi "freeze" dimana lebih baik memberikan error kepada user, sehingga dapat memberikan informasi kepada user untuk mencoba lagi daripada mengakibatkan request freeze.

Misalnya, jika kita set timeout 5 detik, jika request tidak mendapat koneksi, setelah menunggu 5 detik akan menerima error. Yang perlu diingat adalah timeout yang terlalu pendek dapat menyebabkan request gagal terlalu cepat dan timeout yang terlalu panjang berarti request akan hang terlalu lama. Analoginya seperti ini:

- Kita sedang mengantri untuk membeli di restoran (request), tapi kita tidak bisa menunggu antrian (timeout limit). Dan kita memutuskan untuk meninggalkan restoran (return error).

### Max lifetime
Lifetime menentukan **berapa lama koneksi dapat hidup sebelum direset atau ditutup** oleh pool, bahkan jika koneksi sedang aktif. Biasanya digunakan untuk menghindari masalah koneksi lama atau memperbarui konfigurasi untuk memastikan koneksi tetap segar dan dapat diandalkan.

Misalnya, jika kita set **max lifetime** 20 menit, setiap koneksi yang telah digunakan selama 20 menit akan **ditutup dan dihapus dari pool** dan akan diganti dengan koneksi baru yang akan dibuat.

Hal ini penting karena terkadang beberapa server database memiliki batas waktu untuk koneksi lama yang dapat mencegah masalah **stale connections**. Analoginya seperti ini:

- Sebuah kantor memiliki 3 petugas keamanan per shift. Setiap petugas bekerja maksimal 8 jam (Max Lifetime)
- Setelah 8 jam, petugas harus diganti dengan petugas baru, meskipun 5 petugas sebelumnya masih dalam kondisi baik, tidak ada masalah dan pekerjaan berjalan lancar. Tapi ini mencegah petugas menjadi lelah dan kehilangan konsentrasi ketika memeriksa pengunjung yang masuk (requests).

## Implementasi
Sekarang kita akan mencoba mengimplementasikan connection pool menggunakan Golang. Perhatikan kode berikut:

```javascript
package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	dsn := "username:password@tcp(127.0.0.1:3306)/dbname?parseTime=true"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to open connection to database: %v", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(time.Minute * 10)
	db.SetConnMaxIdleTime(time.Minute * 5)

	err = db.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	fmt.Println("Successfully connected to database!")

	rows, err := db.Query("SELECT id, name FROM users")
	if err != nil {
		log.Fatalf("Failed to run query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			log.Fatalf("Failed to read query results: %v", err)
		}
		fmt.Printf("ID: %d, Name: %s\n", id, name)
	}

	if err := rows.Err(); err != nil {
		log.Fatalf("Error after iteration: %v", err)
	}
}

```

Kita dapat fokus pada potongan kode berikut:

```javascript
db.SetMaxOpenConns(10)
db.SetMaxIdleConns(5)
db.SetConnMaxLifetime(time.Minute * 10)
db.SetConnMaxIdleTime(time.Minute * 5)
```

Berikut penjelasannya:

- **SetMaxOpenConns(10)**: Menentukan jumlah maksimum koneksi yang dapat terbuka secara bersamaan.
- **SetMaxIdleConns(5)**: Menentukan jumlah maksimum koneksi idle yang dipelihara di pool.
- **SetConnMaxLifetime(time.Minute * 10)**: Menentukan berapa lama koneksi dapat hidup sebelum direset atau ditutup.
- **SetConnMaxIdleTime(time.Minute * 5)**: Menentukan berapa lama koneksi idle dapat dipelihara sebelum ditutup.

## Kesimpulan
Penggunaan connection pooling sangat penting, karena hal ini dapat mengantisipasi aplikasi berjalan lancar ketika menangani beban request yang masuk secara tidak menentu. Namun pengaturan yang tepat juga harus diimplementasikan, sehingga penggunaan connection pooling dapat lebih optimal.

Jika Anda memiliki tambahan atau koreksi terhadap pembahasan di atas, mari kita diskusikan di kolom komentar. Semoga membantu 👋.
