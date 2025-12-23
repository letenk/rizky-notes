---
title: "Environment Variable Pada Golang"
date: 2022-06-26T11:01:35+07:00
tags: ["go", "golang"]
cover:
  image: "/images/env-variable/env-5.png"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

Ketika membangun sebuah aplikasi pastinya memiliki beberapa informasi _credential_. Katakan aplikasi kita terhubung ke database.

Dimana diharuskan untuk menuliskan _credential_ seperti `host`, `name`, `username`, dan `password` database yang bisa saja dilakukan langsung didalam kode program.

Tapi cara ini sangat tidak dianjurkan karena tidak aman dan kurang efesien.

Ditambah lagi jika bekerja menggunakan **Git**. Data _credential_ akan dicatat olehnya dan mudah dicuri oleh orang lain.

Salah satu cara yang baik yaitu dengan menggunakan **environment variable** untuk menyimpan _credential_.

# Apa Itu Environment Variable

**Environment Variable** atau selanjutnya kita sebut **variable env** adalah variable dinamis pada komputer yang dapat diakses oleh sebuah program.<sup>[(1)](https://en.wikipedia.org/wiki/Environment_variable)</sup>

Pada setiap komputer kita bisa membuat variable env. Tapi biasanya sifatnya hanya sementara pada saat program dieksekusi.

Tapi sistem operasi memiliki variable env bawaan yang akan selalu ada saat dijalankan, karena dibuat ketika komputer melakukan proses booting atau dinyalakan.

## Default Variable Env Pada Sistem Operasi

Sebagai contoh pada Linux atau Unix ada variable env seperti `HOST` dan `USER`. Mari kita coba panggil pada terminal dengan mengetikkan perintah:

```bash
echo $HOST
echo $USER
```

Perintah **`echo`** digunakan untuk nenampilkan isi dari variable env, dan simbol **`$`**
adalah aturan dari sistem operasi Linux dan Unix untuk menampilkan variable env.

Hasil dari command diatas adalah:
![variable default mac](/images/env-variable/env-1.png "variable default mac")

## Membuat Variable env

Kita juga dapat membuat variable env, caranya dengan menggunakan perintah **`export`**.

```bash
export NAMA_VARIABLE="Nilai"
echo NAMA_VARIABLE
```

Contoh:

```bash
export APP_NAME="Jabutech"
echo $APP_NAME
```

Hasilnya adalah:
![membuat variable env](/images/env-variable/env-2.png "membuat variable env")

Sudah pahamkan, selanjutnya kita akan menggunakan **Environment Variable** pada Go (Golang).

# Environment Variable Pada GO (Golang)

Dengan menggunakan variable env pada golang memiliki beberapa keuntungan yaitu dari sisi manajemen kode.

Pertama, seperti contoh pembahasan sebelumnya pada aplikasi kita membutuhkan _credential_ untuk database dan kita menuliskan di beberapa file program. Jika terdapat perubahan pada _credential_ diharuskan untuk merubah pada beberapa bagian file lain juga.

Tapi jika menggunakan variable env, kita hanya perlu mengganti disatu tempat saja dan yang lain akan mengikuti.

---

Kedua, kita dapat mengkategorikan environment variable sesuai kebutuhan, contoh untuk proses development, test, atau production.

Dan masih banyak keuntungan lainnya.

Ada beberapa cara menggunakan variable env pada golang. Tapi kali ini kita akan membahas cara menggunakan variable env pada golang dengan menggunakan 2 package yaitu:

- **`os`** package
- **`godotenv`** package

## Persiapan

Pertama, buat sebuah project dengan nama **`go-env`**

Kedua, masuk kedalam folder project dan lakukan inisialisasi golang module. Jalankan perintah:

```go
go mod init go-env
```

## Menggunakan `OS` Package

Golang menyediakan pada bawaan untuk melakukan konfigurasi dan mengakses environment variable yaiut **`os`** package.

Untuk mengeset sebuah variabel env bisa menggunakan:

```golang
os.Setenv(nama_variable, nilai)
```

Dan untuk memanggil variabel env dengan menggunakan:

```golang
os.Getenv(nama_variable)
```

Sekarang mari kita praktekkan. Pada folder project buat sebuah file dengan nama `main.go` dan ketikkan kode:

```golang
package main

import (
	"fmt"
	"os"
)

func main() {
	// Set variable env
	os.Setenv("APP_NAME", "Jabutech")

	// Get variable env
	appName := os.Getenv("APP_NAME")

	// Print
	fmt.Printf("Nama Aplikasi: %s \n", appName)
}
```

Lalu sekarang kita jalankan aplikasinya:

```golang
go run main.go
```

Maka hasilnya akan seperti ini:
![membuat variable env dengan package os](/images/env-variable/env-3.png "membuat variable env dengan package os")

## Menggunakan `GoDotEnv` Package

Cara yang kedua yaitu dengan memanggil file `.env` yang didalamnya bisa kita tulis dengan banyak variable env, dan memanggilnya dengan `godotenv` package.

Pertama, tambahkan `godotenv` package pada project kita dengan menjalankan perintah:

```golang
go get github.com/joho/godotenv
```

Berikut cara menggunakannya:

```golang
// Memanggil file .env pada direktory yang sama
godotenv.Load()

// atau
godotenv.Load(".env")
```

File yang diload bisa lebih dari satu. Untuk informasi lengkap bisa kunjungi [dokumentasi resminya](https://github.com/joho/godotenv).

Sekarang mari kita coba.

Pertama, buat sebuah file dengan nama ".env", dan isikan dengan beberapa variable environment berikut:

```golang
APP_NAME=jabutech
APP_TECH=golang
AUTHOR="Rizky Darmawan"
```

Kedua, pada file main.go ubah kodenya menjadi:

```golang
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// Load file .env
	err := godotenv.Load(".env")
	//  Cek jika error
	if err != nil {
		log.Fatal(err)
	}

	// Panggil variable env
	appName := os.Getenv("APP_NAME")
	appTech := os.Getenv("APP_TECH")
	author := os.Getenv("AUTHOR")

	// Print
	fmt.Printf("Nama Aplikasi: %s \n", appName)
	fmt.Printf("Teknologi: %s \n", appTech)
	fmt.Printf("Pemilik: %s \n", author)
}
```

Sekarang jalankan aplikasinya:

```golang
go run main.go
```

Maka hasilnya akan seperti ini:
![membuat variable env dengan package godotenv](/images/env-variable/env-4.png "membuat variable env dengan package godotenv")

> **Tips: file .env sebaiknya disertakan didalam file .gitignore. Hal ini dilakukan agar informasi credential tidak ikut terupload ke repository publik dan aplikasi kita menjadi lebih aman.**

Sekarang, kita paham cara menggunakan variable env pada golang.

Jika ada yang ingin didiskusikan atau ada masukan, jangan ragu hubungi sosial media jabutech.
