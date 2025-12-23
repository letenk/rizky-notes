---
title: "Mastering Enum in Golang"
date: 2024-12-31T15:18:47+07:00
tags: ["go", "golang", "tips"]
cover:
  image: "/images/mastering-enum-in-go/cover.jpg"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---
> **English Version**: *For English version of this article, please visit: [dev.to](https://dev.to/tentanganak/mastering-enums-in-go-31j2)*

##### *Gambar oleh [Hans-Peter Gauster](https://unsplash.com/@sloppyperfectionist) dari [Unsplash](https://unsplash.com/photos/stack-of-jigsaw-puzzle-pieces-3y1zF4hIPCg)*
Mari kita asumsikan bahwa kita sedang membangun API E-commerce yang akan menerima beberapa pesanan, setiap proses pesanan memiliki beberapa status seperti *Pending, Processed, Shipped, Delivered, Cancelled*. Dan aplikasi kita menerima string input yang akan disimpan dalam database, sebagai contoh statusnya adalah Processed, received Process, Processing atau sesuatu yang lain yang menyebabkan inkonsistensi data. Di sini Enum memiliki peran penting.

Di Golang enum tidak seperti bahasa lain seperti Java atau C# yang menawarkan dukungan built-in untuk enum, Go mengambil pendekatan yang berbeda. Di Go, enum bukan fitur bahasa asli, tetapi developer memiliki beberapa teknik yang dapat digunakan untuk mencapai fungsionalitas yang serupa.

# Memahami Enum
Di Golang, enum (singkatan dari enumerations) menyediakan cara untuk merepresentasikan sekumpulan konstanta bernama. Meskipun Go tidak memiliki tipe enum built-in seperti beberapa bahasa lain, developer dapat mengemulasi perilaku seperti enum menggunakan konstanta atau tipe kustom. Mari kita bahas tujuan dan sintaks enum di Go:

## Tujuan
- **Readability and Maintainability**: Enum membuat kode lebih mudah dibaca dan mudah dipahami dengan memberikan nama yang bermakna pada nilai-nilai tertentu. Ini meningkatkan kemudahan pemeliharaan kode karena tujuan dari setiap konstanta menjadi lebih mudah dipahami.

- **Type Safety**: Enum membantu menegakkan type safety dengan membatasi variabel pada sekumpulan nilai yang telah ditentukan. Ini mengurangi kemungkinan kesalahan runtime yang disebabkan oleh penggunaan nilai yang salah.

# Membuat Enum
Di sini kita akan membahas langkah demi langkah cara membuat enum di Golang, sehingga mudah dipahami di setiap tahapnya kita akan menjelaskan makna dari kode yang kita tulis.

## Membuat Tipe Baru
Hal pertama yang akan kita lakukan adalah membuat tipe baru untuk enum yang kita butuhkan. Caranya cukup mudah, kita hanya perlu menggunakan kata kunci *type* dan diikuti dengan nama tipenya, di sini dengan nama **StatusOrder** dan tipenya di sini kita definisikan tipe **unsigned integer** seperti ini:

```javascript
type StatusOrder uint
```

Nah, mudah saja membuatnya.

## Mendefinisikan konstanta ENUM

Dengan tipe baru yang telah kita buat, sekarang saatnya bagi kita untuk mendefinisikan beberapa status pesanan yang kita miliki dengan konstanta. Di mana kita mendefinisikan tipe **StatusOrder** yang kita buat sebagai tipenya, seperti ini:

```javascript
const (
	Pending StatusOrder = iota
	Processed
	Shipped
	Delivered
	Cancelled
)
```

Mungkin kamu bertanya, apa itu kata kunci `iota`? Kata kunci ini membuat GO memberikan nilai 0 pada konstanta pertama dan kemudian meningkatkan nilainya sebesar 1 secara berurutan untuk setiap konstanta berikutnya. Ini memudahkan kita daripada mendefinisikan nilai secara manual 1 per 1. Tentang `iota` kamu bisa baca [di sini.](https://go.dev/wiki/Iota)

## Fungsi Strings
Langkah selanjutnya yang akan kita lakukan adalah membuat fungsi String yang digunakan untuk merepresentasikan setiap nilai string dari enum `StatusOrder`.

```javascript
func (s StatusOrder) String() string {
	switch s {
	case Pending:
		return "Pending"
	case Processed:
		return "Processed"
	case Shipped:
		return "Shipped"
	case Delivered:
		return "Delivered"
	case Cancelled:
		return "Cancelled"
	default:
		return "Unknown"
	}
}
```

Apakah nama fungsinya harus `String`? Kita akan membahasnya di akhir.

## Pengujian
Sekarang kita akan melakukan pengujian, kode terakhir yang akan kita tulis adalah, fungsi **main** dan di dalamnya kita mencetak hasilnya menggunakan bantuan paket `fmt`.

```javascript
func main() {

	processed := Processed
	fmt.Printf("Order Status: %s (%d)\n", processed, processed)

	pending := Pending
	fmt.Printf("Order Status: %s (%d)\n", pending, pending)

}
```

Sekarang kode lengkapnya dapat dilihat [di sini.](https://github.com/letenk/golang-enum)

Tentu saja, kita melakukan langkah terakhir dan kita akan melihat hasilnya seperti ini:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2hufqo3gl51ngx1a7d2n.png)

## Fmt Stringer
Pertanyaan mungkin muncul, `mengapa fungsi String juga dipanggil ketika kita memanggil konstanta enum?`. Jawabannya adalah karena kita menggunakan paket `fmt`. Paket fmt secara eksplisit menggunakan interface **fmt.Stringer** untuk memproses tipe yang mengimplementasikan method String(). Jadi, jika kamu tidak menggunakan fmt, method String() tidak akan dipanggil secara otomatis. Untuk penjelasan lebih lanjut, kamu dapat mengeksplorasi lebih detail [di sini.](https://pkg.go.dev/fmt#Stringer)

# Kesimpulan
Meskipun Golang tidak menawarkan tipe enum asli, teknik yang kita pelajari di sini sering digunakan dalam membangun aplikasi dengan Golang. Dan untuk tipenya sendiri, kita dapat dengan bebas menggunakan tipe lain, bukan hanya integer. Dengan memanfaatkan teknik ini, keterbacaan, kemudahan pemeliharaan dan keamanan dapat ditingkatkan secara signifikan.

Mungkin ada beberapa poin yang dijelaskan di atas yang kamu rasa kurang, kita bisa mendiskusikannya di kolom komentar di bawah ini. Semoga membantu 👋.

# Reading References
- [fmt](https://pkg.go.dev/fmt#Stringer)
- [Go Wiki: Iota](https://go.dev/wiki/Iota)
- [Enums in Golang: Techniques, Best Practices, & Use Cases](https://reliasoftware.com/blog/golang-enum)
- [Mastering ENUMs in Go](https://itnext.io/mastering-enums-in-go-04bd85ffcf33)
