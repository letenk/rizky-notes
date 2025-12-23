---
title: "Golang Dasar #6 - Constant"
date: 2022-11-21T09:06:24+07:00
tags: ["go", "golang", "golang-dasar"]
cover:
  image: "/images/golang-dasar-6-constant/constant-cover.png"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

Constant adalah jenis `variable` yang nilainya tidak dapat diubah. Deklarasi nilai hanya dilakukan di awal, setelah itu nilainya tidak dapat diubah lagi.

# Cara Membuat Constant
Untuk membuat `constant` memiliki beberapa cara.

Mari kita bahas

## Constant dengan manifest typing atau inference typing
Ketika membuat variable pada Golang kita dapat menggunakan `manifest typing` yaitu di tuliskan tipe datanya dan `inference typing` tidak di tuliskan tipe datanya.

> Tentang manifest typing dan inference typing dapat dipelajari pada postingan instagram jabutech [disini.](https://www.instagram.com/p/Cg1BTGsvCVE/?utm_source=ig_web_copy_link)

Pada constant juga bisa, kodenya adalah seperti ini:
```go
package main

import "fmt"

func main() {
	const firstName = "john" // Manifest typing
	const age uint = 27 // Inference typing
	// Print out
	fmt.Printf("Hi, saya %s umur saya %d\n", firstName, age)
}
```

Hasilnya jika dijalankan:

![Constant manifest typing and inference typing](/images/golang-dasar-6-constant/constant-1.png)

## Multiple Constant
Sama seperti variable, `constant` juga dapat di deklarasikan secara bersamaan.

Kodenya seperti ini:
```go
package main

import "fmt"

func main() {
	const (
		fullname       = "Jhon Deer"
		age      uint8 = 28
		married  bool  = true
	)

	fmt.Printf("Nama %s, umur %d, sudah menikah? %t\n", fullname, age, married)
}
```
Hasilnya jika dijalankan:

![constant multiple](/images/golang-dasar-6-constant/constant-2.png)

Perhatikan kita hanya cukup menggunakan satu keyword `const` saja untuk mendeklarasikan beberapa variable.

## Multiple Oneline Constant
Kita juga dapat mendeklarasikan variable `constant` dengan hanya menulis dalam satu baris kode untuk mendeklarasikan beberapa variable.

```go
package main

import "fmt"

func main() {
	const name, married, age = "Dicky Rush", true, 23

	fmt.Println(name, married, age)
	fmt.Printf("Type: %T, %T, %T\n", name, married, age)
}
```
Hasilnya jika dijalankan:

![Constant multiple oneline](/images/golang-dasar-6-constant/constant-3.png)

# Nilai Constant Tidak Dapat Diubah
Seperti yang dijelaskan diawal, ketika memberikan nilai pada constant nilai itu akan tetap dan tidak dapat diubah.

Coba ketikkan kode ini:

```go
package main

import "fmt"

func main() {
	// Deklarasi nilai pertama
	const firstName string = "John"

	// Print out
	fmt.Printf("Hi, saya %s\n", firstName)

	// Deklarasi nilai kedua
	firstName = "Dery"

	// Print out
	fmt.Printf("Hi, saya %s\n", firstName)
}
```

Kode diatas, kita mendeklarasikan ulang nilai pada `constant firstName` yang awalnya `Jhon` menjadi `Dery`.

Ketika kita jalankan, akan mendapatkan `error`:

![error redeclare value constant](/images/golang-dasar-6-constant/constant-4.png)

Yay 🎉, diatas kita sudah mempelajari tentang `constant` dan beberapa cara membuatnya.

Jika kamu ingin mengirimkan koreksi atau saran, kita dapat berdiskusi dengan menghubungi saya di beberapa akun social media saya pada link yang ada di halaman Home di blog ini.

Seluruh kode dapat kamu lihat pada repository github pada link ini [golang dasar #6 Constant](https://github.com/letenk/golang-dasar-jabutech/tree/master/golang-dasar-6-constant).

Happy sharing 👋

**Referensi**:
- https://dasarpemrogramangolang.novalagung.com/A-konstanta.html
- https://www.udemy.com/course/pemrograman-go-lang-pemula-sampai-mahir/