---
title: "Membuat Minimal Docker Image Dengan Golang"
date: 2022-11-18T08:34:24+07:00
tags: ["go", "golang", "docker", "tips"]
cover:
  image: "/images/membuat-minimal-docker-image-dengan-golang/minimal-image-cover.png"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---
Ketika proses `kontainerisasi` sebuah aplikasi dengan menggunakan `docker` kita membutuhkan sebuah `image`.

Dimana `image` ini didalamnya adalah sebuah aplikasi dengan seluruh package dan library yang dibutuhkan untuk siap dijalankan yang dibungkus menjadi satu.

Tapi yang menjadi masalah ukuran `image` ini bisa menjadi sangat besar, bisa ratusan Megabyte atau Gigabyte tergantung seberapa besar dan banyak package atau library yang ikut terinstall didalanya.

Kali ini kita akan mencoba menggunakan teknik `multistage` dimana akan membuat ukuran `image` bisa menjadi sangat jauh lebih kecil.

# Persiapan
Sebelum kita memulai praktek pastikan di device komputer kita sudah terinstal:
- [Golang](https://go.dev/dl/)
- [Docker](https://docs.docker.com/engine/install/)
- [git](https://git-scm.com/)
- [cURL](https://curl.se/download.html)

Jika belum silahkan merujuk ke masing - masing web resminya.

# Clone aplikasi web server net/http
Untuk proses membuat `image` kita membutuhkan sebuah aplikasi yang akan kita bungkus kedalamnya.

Disini saya akan menggunakan sebuah aplikasi web server sederhana menggunakan net/http yang dapat melakukan proses Read dan Create data buku yang sebelumnya dibahas pada artikel cara pembuatannya di blog ini..

> Jika kamu ingin membaca artikel lengkapnya bisa ke sini [Mengenal net/http Default Package Golang](https://www.jabutech.com/posts/mengenal-net-http-default-package-golang/)

Sekarang kita akan melakukan proses clonning aplikasi dari repository di github, jalankan perintah ini pada CLI (Command Line Interface) menggunakan git:
```go
git clone https://github.com/letenk/golang-net-http.git
```
Setelah berhasil, kita akan mendapatkan folder dengan nama `golang-net-http`. Dan didalamnya ada 2 folder lagi dengan nama `web_client_book` dan `web_server_book`.

Kita akan menggunakan `web_server_book`, dan silahkan masuk kedalamnya.

Lalu buka dengan code editor, disini saya menggunakan visual studio code.

# Tampilkan Url Aplikasi Di CLI
Sebelumnya, jika kita menjalankan aplikasi web server book, pada CLI akan mendapatkan respon blank hitam saja, tidak menampilkan atau memberi tanda aplikasi sudah berjalan atau belum.

Sekarang edit pada function `main` untuk menampilkan alamat url pada CLI, edit kodenya menjadi seperti ini:

```go
func main() {
  // ...kode lain

  // Tambahkan kode ini
  fmt.Printf("Server starting at http://localhost:%s\n", serverPort)

  // Create new server
  http.ListenAndServe(serverPort, nil)
}
```

Sekarang coba kita jalankan.

```go
go run main.go
```

Sekarang kita akan dapat melihat alamat url aplikasi ketika dijalankan.

![alamat url web server](/images/membuat-minimal-docker-image-dengan-golang/minimal-image-1.png)

# Menulis Dockerfile
Untuk membuat sebuah image pada docker kita membutuhkan sebuah file dengan nama `Dockerfile`.

Dockerfile adalah dokumen teks yang didalamnya berisi beberapa perintah untuk membangun sebuah image.

Buat file baru dengan nama `Dockerfile`, dan isi dengan kode ini:

```docker
FROM golang:1.18-alpine3.16
WORKDIR /app
COPY . .
RUN go build -o main main.go
EXPOSE 3000
CMD ["/app/main"]
```
Kita bahas dulu yuk.

```docker
FROM golang:1.18-alpine3.16
```
Pada kode diatas pertama kita menggunakan `FROM` yang berguna untuk menentukan penggunaan `image` dasar untuk membangun sebuah `image` baru milik kita. Karena kali ini kita menggunakan aplikasi golang, maka kita membutuhkan image golang yang akan menjalankan aplikasi kita nantinya ketika sudah dibungkus kedalam `image`. Untuk melihat image golang yang lain dapat mengujungi docker hub, [klik disini](https://hub.docker.com/_/golang).

Disini kita menggunakan image `golang:1.18-alpine3.16` yaitu golang dengan tag versi 1.18 karena aplikasi ini saya bangun menggunakan golang versi tersebut, yang berjalan diatas image `linux alpine` yaitu sebuah image linux yang ukurannya sangat kecil dan ringan.

```docker
WORKDIR /app
```
Lalu kita menetukan lokasi direktory kerja saat ini menggunakan `WORKDIR` didalam image yaitu `/app`.

```docker
COPY . .
```

Selanjutnya menggunakan perintah `COPY` yang akan menyalin seluruh aplikasi kita kedalam `image` yang akan kita buat. 

Titik pertama artinya menyalin semuanya dari folder saat ini, yaitu tempat kita akan membuat image. Dalam case ini, kita akan membuat image dari `root` folder saat ini. Jadi semua yang ada di dalam lokasi ini akan disalin ke `image` yang akan kita buat.

Titik kedua adalah direktori kerja saat ini di dalam `image` yang akan kita buat, yaitu folder `/app` didalam `image` yang akan menjadi tempat untuk menyimpan data yang disalin.

```docker
RUN go build -o main main.go
```
Selanjutnya, perintah `RUN` digunakan untuk melakukan eksekusi perintah didalam image. Diikuti dengan perintah `go build` dimana ini adalah perintah docker untuk melakukan proses `compile` aplikasi golang menjadi file `binary`. Lalu argumen `-o`, yang merupakan singkatan dari output untuk menentukan nama file hasil compile pada kali ini diberi nama `main`. Dan terakhir kita harus masukkan file entrypoint utama
aplikasi kita, yaitu `main.go`.

```go
EXPOSE 3000
```
Perintah `EXPOSE` untuk memberi tahu docker bahwa container mendengarkan port aplikasi yang sedang berjalan didalam `image` yang baru. Dalam case ini, ini adalah port `3000`. 

Perlu dicatat sebenarnya bahwa perintah `EXPOSE` tidak benar-benar mempublikasikan port. Ini hanya berfungsi sebagai dokumentasi antara
orang yang membuat image dan orang yang akan menggunakan dan menjalankan  image didalam container, tentang port mana yang dapat dipublikasikan.

```go
CMD ["/app/main"]
```
Terakhir, perintah `CMD`. Perintah ini akan menjalankan file `binary` hasil compile didalam `image` ketika image digunakan didalam `container`.

Cukup jelas ya fungsi dari perintah - perintah didalam Dockerfile kali ini.

# Build image non minimal
Oke sekarang kita akan melakukan proses `build image` yaitu proses membungkus seluruh aplikasi kedalam `image` docker.

Untuk melakukannya jalankan perintah ini pada CLI:

```docker
docker build -t nethttp_server:latest .
```
Pada perintah `docker` diatas, kita menggunakan argumen `build` untuk memberitahukan bahwa kita akan melakukan proses membuat `image`. 

Lalu argumen -t adalah untuk memberikan nama `tag` pada image yang akan kita bangun, lalu diikuti dengan nama tag `image`nya yaitu `nethttp_server` dan versi tagnya disini kita hanya membuat `latest` saja, kedepannya bisa disesuaikan dengan versi aplikasi. 

Terakhir adalah `titik (.)` ini memberitahukan dimana lokasi `Dockerfile`, karena pada folder `root` cukup berikan titik saja.

Perintah diatas akan menjalankan beberapa proses sesuai instruksi didalam `Dockerfile` dan membutuhkan waktu.

Jika selesai, kita dapat melihat image yang kita buat dengan mengetikkan perintah pada CLI:

```go
docker images
```

Hasilnya kita berhasil membungkus aplikasi kita kedalam `image docker`.

![image docker non minimal](/images/membuat-minimal-docker-image-dengan-golang/minimal-image-2.png)

Namun perhatikan, ukuran `image`nya cukup besar yaitu `335MB`.

Ini yang akan kita bahas selanjutnya yaitu proses build image dengan teknik multistage.

# Build Image Multistage
Sebelum kita mulai melakukan proses `build image dengan multistage`, kita harus mencari tau dulu kenapa ukuran image bisa sangat besar.

Ukuran image menjadi sangat besar karena didalamnya terdapat golang dan semua paket yang diperlukan untuk aplikasi dapat berjalan normal. 

Tapi sebenarnya yang kita perlukan untuk dapat menjalankan aplikasi hanyalah file `binary` yang dihasilkan dari proses compile denga perintah `go build`. Kita tidak membutuhkan hal lain bahkan kode asli aplikasi kita.

Jadi sekarang kita akan membuat sebuah `image` yang didalamnya hanya berisi file `binary` yang telah kita build dengan perintah `go build` didalam `Dockerfile` agar mendapatkan ukuran yang sangat kecil.

Untuk melakukan proses `multistage`, pada `Dockerfile` kita akan membagi proses menjadi 2 tahap.

Tahap pertama, adalah tahap `build` yang hanya akan melakukan proses compile aplikasi kita ke file `binary`. 

Setelah file `binary` dihasilkan, kita akan `build` tahap kedua yaitu tahap menyalin file `binary` kedalamnya dan menjalankannya.

Baik saatnya kita mencobanya.

Pada Dockerfile ubah menjadi kode berikut:
```docker
# Build stage 1
FROM golang:1.18-alpine3.16 AS builder
WORKDIR /app
COPY . .
RUN go build -o main main.go

# Build stage 2
FROM alpine:3.16
WORKDIR /app
COPY --from=builder /app/main .

EXPOSE 3000
CMD ["/app/main"]
```

Pada kode diatas saya menambahkan komentar proses setiap `stage`, saya rasa ini akan memudahkan kita membacanya.

Kita bahas pada `Build stage 1` dimana proses `build` atau `compile` aplikasi ke `binary`.

```docker
FROM golang:1.18-alpine3.16 AS builder
```
Pada kode diatas kita menggunakan keyword `AS` untuk memberikan nama stage yaitu `builder`.

Kemudian kita lanjut pada proses `Build stage 2`, dimana kita menentukan `image` dasar untuk tahap ini. Dan karena kita ingin ukuran `image`nya kecil maka [alpine linux](https://www.alpinelinux.org/) adalah pilihan yang tepat kita gunakan.

```docker
FROM alpine:3.16
```
Disini kita menggunakan versi image alpine 3.16, seperti pada image tahap build stage 1 untuk memastikan semuanya sama.

```docker
WORKDIR /app
```
Dan sama seperti sebelumnya, pada tahap ini kita juga memberitahukan lokasi direktory kerja didalam image.

```docker
COPY --from=builder /app/main .
```
Lalu kita perlu menyalin file `biner` aplikasi kita dengan menggunakan `COPY`. Tapi kali ini, menggunakan argumen `--from` untuk memberitahu docker dari mana lokasi menyalin file yaitu dari tahap `builder`, Maka dari itu pada tahap stage 1 kita memberikan nama stage yaitu `builder`.

Lalu diikuti lokasi file dari mana kita menyalin yaitu `/app/main` dan terakhir lokasi target direktory kerja saat ini, cukup gunakan titik.

Terakhir untuk perintah `EXPOSE` dan `CMD` kita letakkan dipaling akhir setelah semua proses `build` selesai.

Sekarang kita lakukan build ulang dengan nama dan tag yang sama.

```docker
docker build -t nethttp_server:latest .
```

Jika sudah selesai, kita lihat `image`nya.

```docker
docker images
```

![image docker multistage](/images/membuat-minimal-docker-image-dengan-golang/minimal-image-3.png)

Menakjubkan, seberapa jauh ukuran bekurang dari awal `335MB` dan sekarang hanya `12.2MB`.

Jika diperhatikan `image` sebelumnya masih ada tetapi dengan nama dan tag yang sudah hilang.

Kita dapat menghapus image ini, caranya dengan perintah `docker image rm` diikuti dengan `IMAGE ID`.

```docker
docker image rm c3e4c1506b6e
```

![menghapus image docker](/images/membuat-minimal-docker-image-dengan-golang/minimal-image-4.png)

Hasilnya akan seperti gambar diatas dan jika kita melihat semua daftar image kita tidak akan menemukannya lagi.

# Menjalankan Image Didalam Container
Sekarang kita akan mencoba `image` yang sudah kita build untuk dijalankan didalam container, apakah aplikasi kita dapat berjalan dengan baik.

Untuk menjalanakannya, ketikan perintah ini pada CLI:

```docker
docker run --name web_server_nethttp -p 3000:3000 nethttp_server:latest
```
Pada perintah `docker` diatas kita menambahkan beberapa argumen. `--name` digunakan untuk memberikan nama pada container yang akan kita jalankan yaitu `web_server_nethttp`. Jika tidak akan diberikan nama secara acak.

Lalu argumen `-p` yang berguna untuk mempublish port yang akan di gunakan, `port` sebelah kiri untuk mempublish agar aplikasi kita dapat diakses dari luar container, misalnya browser, postman atau client yang lainnya, jika tidak aplikasi yang berada didalam container tidak dapat diakses dari luar. Dan `port` sebelah kanan untuk mendeskripsikan port yang dijalankan didalam image.

Terakhir kita memberitahukan akan menggunakan `image` yang mana, disini kita menggunakan `nethttp_server:latest`.

Jika, berhasil kita akan mendapatkan aplikasi kita berjalan dan menunjukkan alamat url pada CLI.

![menjalankan image pada container](/images/membuat-minimal-docker-image-dengan-golang/minimal-image-5.png)

Dan sekarang kita cek container yang berjalan.

```docker
docker container ls
```

Perhatikan aplikasi kita berhasil dijalankan didalam container.
![aplikasi berjalan pada container](/images/membuat-minimal-docker-image-dengan-golang/minimal-image-6.png)

Sekarang kita coba mengakses salah satu endpoint, kita coba membuka url dibawah dengan curl.

```docker
curl http://localhost:3000/books
```

Dan hasilnya aplikasi kita berjalan dengan baik.
![akses aplikasi didalam container](/images/membuat-minimal-docker-image-dengan-golang/minimal-image-7.png)

Yay 🎉, sekarang kita jadi paham cara membuat `image docker` dengan teknik `multistage`. Dan kita berhasil menurunkan ukuran `image` yang jauh dari sebelumnya.

Jika kamu ingin mengirimkan koreksi atau saran, kita dapat berdiskusi dengan menghubungi saya di beberapa akun social media saya pada link yang ada di halaman Home di blog ini.

Seluruh kode dapat kamu lihat pada repository github pada link ini [membuat-docker-image-dengan-golang](https://github.com/letenk/membuat-docker-image-dengan-golang).

Happy sharing 👋

**Referensi**:
- https://www.youtube.com/watch?v=p1dwLKAxUxA


