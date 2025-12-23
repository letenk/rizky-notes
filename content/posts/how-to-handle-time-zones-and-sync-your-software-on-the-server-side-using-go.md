---
title: "How to Handle Time Zones and Sync Your Software on the Server Side Using Go"
date: 2024-10-01T09:36:41+07:00
tags: ["go", "golang", "tips"]
cover:
  image: "/images/how-to-handle-time-zones-and-sync-your-software-on-the-server-side-using-go/cover.webp"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

> **English Version**: *For English version of this article, please visit: [dev.to](https://dev.to/tentanganak/how-to-handle-time-zones-and-sync-your-software-on-the-server-side-using-go-16ip)*

Ketika aplikasi Anda mulai berkembang dalam skala besar, peningkatan pengguna akan bertambah. Yang sangat mungkin terjadi adalah lokasi pengguna tidak hanya berada di area yang sama, bisa saja berada di area lain yang memiliki zona waktu yang berbeda. Jadi sebagai developer Backend, hal-hal yang berkaitan dengan penanganan perbedaan zona waktu sangat penting untuk dipikirkan.

Saya baru-baru ini menghadapi masalah yang melibatkan zona waktu. Mari kita jujur, berurusan dengan tanggal dan waktu adalah salah satu area paling rumit yang harus ditangani manusia. Dan ini merupakan kesempatan bagi saya untuk belajar bagaimana menangani tanggal dan waktu dengan benar di sisi server.

Dalam artikel ini, saya akan berbagi pengalaman saya tentang bagaimana saya menangani perbedaan zona waktu di sisi server sebagai developer Backend. Mungkin jika ada yang bersedia mengoreksi dan memberikan masukan tambahan yang akan berharga bagi saya.

## Tentang Zona Waktu
Zona waktu adalah sistem pembagian waktu standar yang digunakan di seluruh dunia untuk mengatur dan menstandarkan pengukuran waktu. Konsep ini muncul sebagai respons terhadap kebutuhan koordinasi waktu global, terutama seiring dengan perkembangan teknologi komunikasi dan transportasi.

Prinsip dasar zona waktu adalah pembagian bumi menjadi 24 zona. Setiap zona waktu umumnya berbeda satu jam dari zona di sebelahnya. Referensi utama untuk zona waktu adalah Greenwich Mean Time (GMT) atau Coordinated Universal Time (UTC), yang berada di garis bujur nol derajat yang melewati Greenwich, Inggris.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/12w82kobmce87b5rm7zz.png)
*Ilustrasi oleh [Hellerick](https://commons.wikimedia.org/wiki/User:Hellerick) dari [Wikimedia Commons](https://en.wikipedia.org/wiki/File:Standard_World_Time_Zones.png)*

Contoh kecil adalah ketika jam menunjukkan pukul 12:00 siang di Jakarta, di New York waktu menunjukkan 00:00 atau tengah malam. Ini berarti bahwa sementara warga Jakarta sedang menikmati makan siang, warga New York baru saja memulai hari baru mereka. Dari sini Anda tentu dapat membayangkan pentingnya penanganan zona waktu yang benar dalam membangun aplikasi.

## Penanganan zona waktu di sisi server
Setelah kita melihat penjelasan di atas, sekarang kita akan masuk ke poin-poin yang dapat dilakukan ketika aplikasi server kita menerima request dari klien yang mengakses API kita untuk menangani zona waktunya.

Dalam artikel ini, saya akan membahas beberapa pendekatan untuk menangani zona waktu di sisi server. Di sini saya akan menggunakan contoh kode dalam bahasa Golang (Go). Golang memiliki paket time untuk bekerja dengan data yang berkaitan dengan waktu yang dianggap cukup lengkap. Berikut beberapa poin yang akan kita bahas:

- Cara menyimpan tanggal ke Database
- Konversi waktu lokal pengguna
- Testing dan Validasi

## Cara menyimpan tanggal ke Database
Hal pertama yang akan kita bahas adalah waktu mana yang akan kita simpan di database, misalnya kita memiliki aplikasi ecommerce yang melakukan flash sale, di mana aplikasi kita sudah dalam skala internasional.

Ketika pengguna memproses transaksi pembelian di Amerika atau jika pengguna berada di Indonesia, pengguna akan mengirim waktu lokal mereka yang berbeda ke server. Pertanyaannya adalah, apakah database kita akan menyimpan data waktu sesuai dengan waktu lokal pengguna? Jika jawabannya ya, kemungkinan besar masalah rumit ketika kita ingin mengambil data atau misalnya admin ingin melakukan pemrosesan data, pengguna mana yang melakukan transaksi paling awal.

Untuk mengatasi hal ini, praktik terbaik adalah menyimpan waktu transaksi dalam zona waktu **UTC** (Coordinated Universal Time) yang merupakan standar waktu utama untuk jam dan pengaturan waktu. Berikut aplikasi waktu ke UTC.

```javascript
package main

import (
	"fmt"
	"time"
)

func main() {

	now := time.Now()
	fmt.Printf("Local time: %s\n", now)
	
	nowInUTC := now.UTC()
	fmt.Printf("UTC time: %s\n", nowInUTC)

}
```

Mari kita lihat arti kode di atas.

Pertama, dalam baris kode `now := time.Now()`, baris ini menggunakan fungsi `Now()` dari paket **time** untuk mendapatkan waktu saat ini berdasarkan zona waktu lokal sistem. Hasilnya disimpan dalam variabel current.

Kemudian, dalam baris `nowInUTC := now.UTC()`, di sini kita mengkonversi waktu lokal (now) ke waktu UTC menggunakan metode `UTC()`. Hasilnya disimpan dalam variabel baru nowInUTC dan waktu ini dapat disimpan di server, di mana diharapkan developer dapat menghindari ambiguitas dan kesalahan yang mungkin timbul karena perbedaan zona waktu antara server dan pengguna di berbagai wilayah dengan zona waktu yang berbeda.

Berikut hasilnya jika kita menjalankan kode di atas:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4qn7wuwxtycrtko6mrl2.png)

Tetapi ini tidak selalu merupakan solusi terbaik yang harus Anda gunakan. Mungkin ada beberapa poin yang dapat Anda ingat dalam kasus penggunaan tertentu, salah satunya adalah apakah benar pengguna kita berasal dari zona waktu yang berbeda? Jika tidak memungkinkan, mungkin menyimpan waktu dalam UTC akan menambah kompleksitas pada kode Anda.

### Mengubah waktu ke lokal pengguna
Pada poin diskusi di atas, kita telah setuju untuk menyimpan data waktu pengguna dalam satu lokasi, yaitu UTC. Sekarang bagaimana pengguna dapat melihat waktu yang akurat sesuai dengan lokasi mereka. Contoh dari diskusi di atas adalah flash sale pada aplikasi e-commerce yang kita miliki, di mana pengguna juga ingin mengetahui informasi tentang pengguna mana yang melakukan transaksi pertama. Jadi pada titik ini, mengkonversi waktu yang kita simpan di database ke waktu lokal pengguna adalah hal penting lainnya yang tidak boleh kita abaikan.

Pendekatan yang saya ambil adalah bahwa sisi server selalu meminta klien untuk mengirim timezone di sisi pengguna. Ini dapat dilakukan di sisi request di mana klien mengirim header dengan kunci `timezone` dan memiliki nilai timezone pengguna. Misalnya, Indonesia memiliki 3 pembagian zona waktu, yaitu WIT(+9), WITA(+8), WIB(+7). Di mana setiap zona memiliki perbedaan 1 jam. Jika sebelumnya di server kita menyimpan waktu UTC pada 00.00, maka di sisi WIT pada 09.00, kemudian di sisi WITA pada 08.00 dan WIB pada 07.00.

Berikut contoh kode untuk menangani kasus di atas:

```javascript
package main

import (
	"fmt"
	"time"
)

func ParseTimezoneFromString(tz string) *time.Location {

	if len(tz) > 0 {

		t, err := time.Parse("2006 -07:00", fmt.Sprintf("2007 %s", tz))

		if err != nil {

			panic(err)

		} else {

			return t.Location()
		}
	}

	return time.Now().Location()
}

func main() {

	timeServerInUTC := "2024-08-04 00:00:00"
	nowInUTC, err := time.Parse("2006-01-02 15:04:05", timeServerInUTC)
	if err != nil {
		panic(err)
	}

	fmt.Printf("UTC time: %s\n", nowInUTC)

	witLocation := ParseTimezoneFromString("+09:00")

	nowInWIT := nowInUTC.In(witLocation)
	fmt.Printf("WIT time: %s\n", nowInWIT)

	witaLocation := ParseTimezoneFromString("+08:00")

	nowInWITA := nowInUTC.In(witaLocation)
	fmt.Printf("WITA time: %s\n", nowInWITA)

	wibLocation := ParseTimezoneFromString("+07:00")

	nowInWIB := nowInUTC.In(wibLocation)
	fmt.Printf("WIB time: %s\n", nowInWIB)

}
```

*credit to [dikac](https://dev.to/dikac) untuk membuat fungsi ParseTimezoneFromString ini*

Mari kita pahami arti kode di atas:

Pertama, kita membuat fungsi `ParseTimezoneFromString`, di mana fungsi ini digunakan untuk mencari lokasi waktu berdasarkan argumen `tz` atau timezone dari lokasi pengguna yang diberikan. Jika nilai string `tz` valid, kita akan mengkonversi timezone string menggunakan fungsi `time.Parse` untuk mengkonversi string ke objek time, kemudian mengekstrak lokasi (timezone) dari objek tersebut. Dan kita juga menangani jika string kosong atau parsing gagal, fungsi mengembalikan zona waktu lokal sistem.

```javascript
func ParseTimezoneFromString(tz string) *time.Location {

	if len(tz) > 0 {

		t, err := time.Parse("2006 -07:00", fmt.Sprintf("2007 %s", tz))

		if err != nil {

			panic(err)

		} else {

			return t.Location()
		}
	}

	return time.Now().Location()
}
```

Selanjutnya kita juga mendefinisikan data waktu dalam format string berikut:

```javascript
timeServerInUTC := "2024-08-04 00:00:00"

nowInUTC, err := time.Parse("2006-01-02 15:04:05", timeServerInUTC)
if err != nil {
    panic(err)
}
```

Anda dapat menganggap ini sebagai data timing yang kita dapatkan dari server. Dan parse ke objek time.

Selanjutnya, kita mencoba mencari lokasi akurat pengguna berdasarkan fungsi `ParseTimezoneFromString` yang sebelumnya kita buat berdasarkan argumen string yang kita definisikan. Yang perlu diperhatikan adalah argumen string ini adalah yang dimaksud dengan nilai header `timezone` yang dikirim oleh klien melalui request yang masuk.

Kita dapat menggunakan lokasi yang kita dapatkan dari fungsi `ParseTimezoneFromString` untuk mengkonversi atau menggeser waktu yang kita dapatkan dari server ke waktu lokal pengguna. Kita dapat melakukan ini menggunakan fungsi `In` yang juga disertakan dalam paket time yang dapat kita lihat dalam potongan kode berikut:

```javascript
nowInWIT := nowInUTC.In(witLocation)
nowInWITA := nowInUTC.In(witaLocation)
nowInWIB := nowInUTC.In(wibLocation)
```

Jika kita menjalankannya, kita akan mendapatkan waktu yang sesuai dengan lokasi timezone yang kita definisikan.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5hj0uau3rtv595ibtvol.png)

### Testing dan Validasi
Poin terakhir yang tidak kalah penting adalah testing dan validasi. Ketika proses pengembangan sering menyebabkan developer membuat kesalahan yang tidak terduga, testing dan validasi selalu penting.

Dalam diskusi poin 2 di atas, fungsi `ParseTimezoneFromString` telah menjadi penting dalam menangani zona waktu kita. Testing dan validasi berulang penting untuk membuat aplikasi kita mendapatkan hasil yang memenuhi ekspektasi kita.

Untuk testing, disarankan menggunakan unit test, di mana testing akan dilakukan pada unit terkecil dengan beberapa skenario yang dapat ditambahkan. Semakin banyak skenario yang ada, semakin kecil kemungkinan untuk menangani perbedaan waktu ini.

## Kesimpulan
Menangani zona waktu memang bisa rumit untuk developer backend. Namun, penting untuk diingat bahwa setiap tugas menantang yang kita atasi berkontribusi pada pertumbuhan dan peningkatan keterampilan kita. Mengelola zona waktu dengan benar bukan hanya kebutuhan teknis, tetapi memastikan akurasi dalam penjadwalan dan memberikan pengalaman yang lancar bagi pengguna aplikasi kita di berbagai wilayah yang berbeda.

Poin-poin yang dibagikan dalam artikel ini tentang menyimpan waktu dalam UTC, mengkonversi ke waktu lokal pengguna, dan mengimplementasikan fungsi konversi yang kuat adalah titik awal dalam mengatasi masalah kompleks ini. Namun, saya mengakui bahwa mungkin ada kekurangan atau area untuk perbaikan dalam pendekatan yang dibahas. Inilah sebabnya mengapa masukan dan saran tambahan dari komunitas developer sangat berharga.

Saya sangat berharap bahwa wawasan dan contoh kode yang diberikan dalam artikel ini akan membantu Anda di masa depan ketika Anda menghadapi tantangan yang berkaitan dengan zona waktu dalam proyek Anda. Ingat, tujuannya adalah menciptakan aplikasi yang bekerja dengan lancar untuk pengguna, terlepas dari lokasi geografis mereka.

Mari kita lanjutkan diskusi ini di bagian komentar di bawah. Saya ingin mendengar tentang pengalaman Anda dengan menangani zona waktu, tantangan apa pun yang Anda hadapi, atau pendekatan alternatif yang Anda temukan efektif. Wawasan Anda bisa sangat berharga bagi saya dan pembaca lain yang menghadapi masalah serupa.

Terima kasih telah membaca, dan saya harap artikel ini terbukti berguna dalam perjalanan pengembangan Anda. Mari terus belajar dan berkembang bersama! 👋

# Referensi Bacaan
- [Time zone
](https://en.wikipedia.org/wiki/Time_zone)
- [What Is a Time Zone?](https://www.timeanddate.com/time/time-zones.html)
- [How to Handle Timezones and Synchronize Your Software with International Customers](https://www.freecodecamp.org/news/synchronize-your-software-with-international-customers/)
- [Dealing with timezones in web development](https://dev.to/jesusantguerrero/dealing-with-timezones-in-web-development-2dgg)
- [Working with Dates and Times in Go: Handling Timezones and Formatting](https://clouddevs.com/go/dates-and-times/)