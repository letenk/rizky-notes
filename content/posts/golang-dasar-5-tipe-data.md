---
title: "Golang Dasar #5 - Tipe Data"
date: 2022-11-14T10:47:40+07:00
tags: ["go", "golang", "golang-dasar"]
cover:
  image: "/images/golang-dasar-5-tipe-data/tipe-data-cover.png"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---
Pada Go (Golang) ada beberapa tipe data. Yaitu adalah tipe data `integer`, `float (floating point)`, `string`, dan `boolean`.

Mari kita bahas satu persatu.

# Tipe data Integer

Tipe data `integer` pada Go ada beberapa jenis.

Tapi secara umum ada 2 tipe data pada kategori ini yang perlu diketahui, yaitu:
- `uint`, tipe data untuk bilangan cacah (bilangan positif).
- `int`, tipe data untuk bilangan bulat (bilangan negatif dan positif).

Tipe data ini memiliki `zero value` atau nilai awal yaitu `0`.

Kemudian kedua tipe data diatas dibagi lagi menjadi beberapa jenis dengan pembagian berdasarkan lebar cakupan nilainya.

| Tipe data      | Cakupan Bilangan |
| ----------- | ----------- |
| `uint8`      | 0 s/d 255       |
| `uint16`   | 0 s/d 65536        |
| `uint32`      | 0 s/d 4294967295      |
| `uint64`   | 0 s/d 0 s/d 18446744073709551615        |
| `uint`      | sama dengan `uint32` atau `uint64` (tergantung nilai)      |
| `byte`   | sama dengan `uint8 `      |
| `int8`      | -128 s/d 127      |
| `int16`   | -32768 s/d 32767       |
| `int32`      | -2147483648 s/d 2147483648      |
| `int64`   | -9223372036854775808 s/d 9223372036854775808       |
| `int`      | sama dengan `int32` atau `int64` (tergantung nilai)       |
| `rune`   | sama dengan `int32`       |

Ketika menetukan tipe data pada `variable`, sangat disarankan harus disesuaikan dengan nilainya. Karena pemilihan tipe data yang tepat membuat pemakaian `memory` menjadi lebih optimal dan tidak berlebihan.

Sekarang mari kita coba untuk membuat beberapa variable dengan menggunakan tipe data `integer`.

Buat folder project baru dan buat file `main.go` dialamnya, lalu isikan dengan kode berikut:
```go
package main

import (
	"fmt"
	"reflect"
)

func main() {
	var nilaiPositif uint8 = 81
	var nilaiNegatif = -2147483648

	// Print nilai
	fmt.Printf("Bilangan positif %d\n", nilaiPositif)
	fmt.Printf("Bilangan negative %d\n", nilaiNegatif)

	// Cek tipe data
	fmt.Printf("Tipe data var nilaiPositif: %T\n", nilaiPositif)
	fmt.Printf("Tipe data var nilaiNegatif: %T\n", nilaiNegatif)
}
```

Pada kode diatas variable `nilaiPositif` memiliki tipe `uint8`. Sedangkan variable `nilaiNegatif` kita tidak mendeklarasikan tipe datanya, tapi ketika dijalankan `Compiler` secara cerdas akan menentukan tipe data variable tersebut.

Ketika dijalankan hasilnya akan seperti ini:

![tipe data integer](/images/golang-dasar-5-tipe-data/tipe-data-1.png)

Template `%d` pada function `fmt.Printf()`, digunakan untuk mencetak tipe data integer.

Template `%T` digunakan untuk mengecek tipe data pada suatu variable.

# Tipe data Float (Floating Point)

Tipe data `float` memiliki 2 jenis, yaitu `float32` dan `float64`. Perbedaan antara kedua tipe ini ada pada lebar cakupan nilai yang bisa ditampung.

Tipe data ini memiliki `zero value` atau nilai awal yaitu `0.0`

1. `float32` yaitu bilangan floating point dengan jumlah `bit 32` atau `single precision` sesuai dengan standar IEEE-754. Range dari float32 ±1.18×10 `pangkat` -38 sampai ±3.4×10 `pangkat` 38 dengan aproksimasi 7 digit desimal dibelakang koma.

2. `float64` yaitu bilangan floating point dengan jumlah `bit 64` atau `double precision` sesuai dengan standar IEEE-754 Range dari float64 ±2.23×10 `pangkat` −308 sampai ±1.80×10 `pangkat` 308 dengan aproksimasi 16 digit desimal dibelakang koma.

Untuk lebih jelasnya bisa merujuk ke spesifikasi [IEEE-754 32-bit floating-point numbers](https://www.h-schmidt.net/FloatConverter/IEEE754.html).

Sekarang mari kita coba menggunakan tipe data `float`.

```go
package main

import (
	"fmt"
)

func main() {
	var nilaiDesimal float32 = 2.62

	fmt.Printf("Nilai desimal %f\n", nilaiDesimal)
	fmt.Printf("Nilai desimal %.3f\n", nilaiDesimal)
}
```

Template `%f` digunakan untuk mencetak tipe data `float` ke console dengan menggunakan `fmt.Printf()`. Secara default akan mencetak 6 digit desimal dibelakang koma.

Jumlah digit yang muncul bisa dikontrol dengan menggunakan template `%.nf`, pada huruf `n `bisa diganti dengan angka desimal yang ingin ditampilkan dibelakang koma. Contoh diatas kita ingin menampilkan 3 digit desimal, maka kita menulis `%.3f`.

Sekarang coba dijalankan, hasilnya akan seperti ini:

![tipe data float](/images/golang-dasar-5-tipe-data/tipe-data-2.png)

# Tipe data String
Tipe data `string` adalah sekumpulan tipe data karakter. Jumlah karakter di dalam String bisa nol sampai tidak terhingga.

Tipe data ini memiliki `zero value` atau nilai awal yaitu  `string kosong ("")`

Untuk membuat tipe data `string` adalah dengan cara mengapit nilainya dengan tanda `double quote` atau `petik dua ("")`.

Mari kita coba.

```go
package main

import "fmt"

func main() {
	name := "Jhon Deer"
	length := len(name)
	stringIndex1 := name[1]

	fmt.Printf("Hallo %s\n", name)
	fmt.Printf("Panjang string %d\n", length)
	fmt.Printf("Panjang string %q\n", stringIndex1)
}
```

Perhatikan diatas kita juga menggunakan function `len()` untuk menghitung panjang karakter `string` dan mengambil karakter dengan posisi index 1 dengan keyword `[1]`.

Ingat untuk indexnya dimulai dari `0` yaa.

Lalu pada beberapa function`fmt.Print()` kita menggunakan beberapa template, yaitu: 

- Template `%s` digunakan untuk mencetak tipe data `string`. 
- Template`%d` untuk mencetak tipe data `integer` karena function `len` mengembalikan nilai `integer`.
- Template `%q` untuk mencetak tipe data `byte`, karena 1 karakter pada `string` adalah 1 `byte`.

Jika kita jalankan hasilnya adalah:

![tipe data string](/images/golang-dasar-5-tipe-data/tipe-data-3.png)

# Tipe data Boolean
Tipe data `boolean (bool)` hanya berisikan 2 buah nilai yaitu `true (benar)` dan `false (salah)`. Tipe data ini biasanya dimanfaatkan dalam seleksi kondisi dan perulangan.

Mari kita coba:

```go
package main

import "fmt"

func main() {
	var benar bool = true
	salah := false
	fmt.Printf("Apakah var `benar` nilainya tidak sama dengan var `salah` hasilnya: %t\n", benar != salah)
}
```
Diatas kita membuat var `benar` dengan mendeklarasikan tipe datanya `bool` dengan nilai `true`, dan var `salah` dengan nilai `false` tanpa mendeklarasikan tipe datanya.

Dan kita menggunakan template `%t` untuk mencetak nilai `boolean` pada function `fmt.Printf()`.

Lalu untuk mendapatkan hasilnya kita menggunakan operator kondisi `!=` artinya `tidak sama dengan`.

Sekarang kita coba jalankan hasilnya akan seperti ini:

![tipe data boolean](/images/golang-dasar-5-tipe-data/tipe-data-4.png)

Yay 🎉, diatas kita sudah mempelajari beberapa tipe data yang ada pada Go.

Jika kamu ingin mengirimkan koreksi atau saran, kita dapat berdiskusi dengan menghubungi saya di beberapa akun social media saya pada link yang ada di halaman Home di blog ini.

Seluruh kode dapat kamu lihat pada repository github pada link ini [golang dasar tipe data](https://github.com/letenk/golang-dasar-jabutech/tree/master/golang-dasar-5-tipe-data).

Happy sharing 👋

**Referensi**:
- https://dasarpemrogramangolang.novalagung.com/A-tipe-data.html
- https://www.udemy.com/course/pemrograman-go-lang-pemula-sampai-mahir/
- https://www.geeksforgeeks.org/zero-value-in-golang/
- https://medium.com/clean-code-62/golang-bagian-4-e148cb3614f3
