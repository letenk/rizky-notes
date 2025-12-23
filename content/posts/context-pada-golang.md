---
title: "Mengenal Context Pada Golang"
date: 2022-11-25T09:52:55+07:00
tags: ["go", "golang", "package"]
cover:
  image: "/images/context-pada-golang/context-cover.png"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---
Saat mengembangkan sebuah aplikasi backend yang menangani `http request` dari client, mungkin yang perlu diketahui adalah url endpoint mana yang diminta klien untuk menentukan sebuah function mana yang akan melayani response. 

Namun saat melayani sebuah response beberapa hal selalu dapat terjadi, seperti client memutuskan koneksi sebelum menerima response.

Jika fungsi yang melayani response tidak mengetahui bahwa klien terputus, server mungkin menghabiskan lebih banyak waktu untuk memproses response yang tidak akan digunakan atau diharapkan oleh client itu lagi.

Dalam hal ini mengetahui konteks request, seperti status koneksi klien dapat memungkinkan server berhenti memproses permintaan setelah klien terputus. Hal ini dapat menghemat sumber daya komputer server yang mungkin sibuk menghandle banyak request untuk membebaskannya dan menangani permintaan klien lain.

Dimana untuk menangani kasus ini, `Golang (Go)` memiliki standar library yaitu `context`.

# Apa Itu Context ?
Context merupakan sebuah data yang dapat membawa `value`, `sinyal cancel`, `sinyal deadline` dan`sinyal timeout` . Context biasanya dibuat per-request, misalnya setiap ada request masuk ke web server melalui `http request`.

# Kegunaan Context
Context pada Golang digunakan untuk mengirim data request atau sinyal ke proses lain, contohnya proses mengirim data ke database.
Dengan menggunakan context ketika kita ingin membatalkan semua proses yang sedang berjalan, kita cukup mengirim sinyal ke context, maka secara otomatis semua proses akan dibatalkan. Sinyal ini dapat berupa `sinyal cancel`, `sinyal deadline` dan`sinyal timeout` tergantung kebutuhan.
Hampir semua bagian di Golang memanfaatkan context, seperti database, http server, http client dan banyak lagi.

# Parent Dan Child Context 
Context menganut konsep `parent` dan `child`. Dimana saat kita membuat context, kita bisa membuat `child` context dari `context` yang sudah ada. Bahkan `child context` dapat menjadi `parent` untuk `context` lainnya.

![Parent dan Child Context](/images/context-pada-golang/context-1.png "Parent dan Child Context")

Yang perlu diingat, `parent context` dapat memiliki banyak `child`, namun `child` hanya bisa memiliki satu `parent context`.

## Hubungan Antara Parent Dan Child Context
Parent dan child pada context akan selalu memiliki hubungan. Hubungan inilah yang dapat di manfaatkan untuk membagikan `data`, sinyal `cancel`, sinyal `timeout`, atau sinyal `deadline`.

Contohnya pada gambar diatas kita memiliki `context.WithCancel` yaitu `child` dari `parent context.Background`. Dan dia juga memiliki `child` dibawahnya yaitu `context.WithDeadline` dan `context.WithValue`.

Jika kita melakukan proses `cancellation` atau pembatalan pada `context.WithCancel`, maka semua `child` yang dibawahnya akan ikut dibatalkan.

Namun, `parent context.Background` dan `context` lain yang tidak memiliki hubungan dengannya tidak mendapatkan efek apapun.

Begitu juga, jika sebuah `context` kita berikan sebuah data, data ini hanya bisa di akses oleh `context` dan `child` dibawahnya. Jika `context` yang kita berikan data tersebut memiliki `parent` diatasnya, maka `parent` atau `context` lain yang tidak memiliki hubungan dengannya tidak dapat mengakses `data` tersebut.

# Membuat Context
Untuk menggunakan context kita dapat memanfaatkan beberapa function milik interface `context.Context`.

Sebelum kita mulai, pertama kita akan membuat sebuah folder project baru dengan nama `golang-context`, dan buka dengan code editor pilihan kamu.
```go
mkdir golang-context
```

## Context Todo
Sekarang buat sebuah file `main.go` dan tulis kode dibawah ini didalamnya:

```go
package main

import (
	"context"
	"fmt"
)

func doSomething(ctx context.Context) {
	fmt.Println("Hello from context.")
}

func main() {
	ctx := context.TODO()
	doSomething(ctx)
}
```

Pertama, didalam file `main.go` kita mendefinisikan nama packagenya yaitu `main`. Lalu kita juga mengimport package `context` agar dapat digunakan, dan juga package `fmt`.

```go
package main

import (
	"context"
	"fmt"
)
```

Lalu, kita juga membuat sebuah function dengan nama `doSomething`, yang memiliki parameter `interface context`.

Perlu diingat **best practice** menggunakan `interface context` sebagai parameter pada sebuah function adalah dengan meletakkannya pada posisi paling awal, lalu setelah itu dapat diikuti parameter lain setelahnya.

```go
func doSomething(ctx context.Context) {
	fmt.Println("Hello from context.")
}
```
Didalamnya kita hanya mencetak string, ketika function dipanggil.

Lalu pada function `main` pertama kita membuat sebuah context dengan menggunakan `context.TODO`, ini adalah salah satu dari dua cara untuk membuat context. Dimana fungsi dari `contex.TODO` ialah hanya sebuah `interface context kosong`, namun biasanya digunakan ketika belum jelas jenis `context` apa yang ingin digunakan.
```go
func main() {
	ctx := context.TODO()
	doSomething(ctx)
}
```
Selanjutnya, kita memanggil function `doSomething` dengan mengirimkan `contex.TODO` sebagai nilai `argumen`nya.

Sekarang, coba kita jalankan aplikasi kita.

```go
go run main.go
```

Hasilnya, hanya akan mencetak sebuah string pada function `doSomething`.

![Context TODO](/images/context-pada-golang/context-2.png "Context TODO")

## Context Background
Sekarang kita akan mencoba satu cara lain untuk membuat context.

Pada function `main`, ubah `contextTODO` menjadi `contextBackground`.

```go
func main() {
	ctx := context.Background()
	doSomething(ctx)
}
```
Fungsi `context.Background()` juga hanya `interface context kosong` sama seperti `contextTODO`, tapi perbedaannya ini dirancang untuk digunakan saat kita sudah mengetahui ingin membuat context apa saat pertama kali. Apakah sinyal `cancel`, `deadline`, `timeout` atau memberikan data `value`.

Dan sekarang jika kita coba jalankan aplikasi kita kembali.

```go
go run main.go
```

Hasilnya akan sama seperti sebelumnya, hanya mencetak string.
![Context Background](/images/context-pada-golang/context-2.png "Context Background")

## Context With Value
Diatas kita sudah mencoba membuat `context.TODO` dan `context.Background`. Kedua context ini hanya mengembalikan interface context kosong yang tidak berguna jika tidak digunakan untuk hal lain.

Hal yang sering dilakukan adalah meneruskan context ke function lain untuk digunakan sesuai kebutuhan. Salah satunya kita dapat menambahkan data informasi ke dalam context dan juga mengambilnya dari function lain yang menggunakannya.

Untuk menambahkan nilai baru ke context, gunakan fungsi `context.WithValue`. Fungsi ini membutuhkan tiga nilai argumen yaitu `parent context.Context`, `key`, dan `value`.

Parent context adalah sebuah context yang digunakan untuk menambahkan nilai sambil mempertahankan semua informasi lain yang ada pada parent context. 

Key digunakan untuk mengambil value dari context dan value adalah nilai yang ingin kita letakkan didalam context.

Key dan value dapat berupa tipe data apa pun, tetapi kali ini akan menggunakan key dan value bertipe string.

Sekarang, pada function `main` ubah kodenya menjadi seperti ini:

```go
func main() {
	ctx := context.Background()
	ctx = context.WithValue(ctx, "myKey", "Hello")

	doSomething(ctx)
}
```
Pada kode diatas, kita memberikan nilai pada context dengan menggunakan `context.WithValue`. Dan juga kita menggunakan `context.Background()` sebagai nilai `parent` bagi `context.WithValue`. Lalu, kita menentukan `key` yang akan digunakan untuk function lain dapat mengambil nilai didalamnya yaitu `myKey`. Dan terakhir kita menetapkan nilai yang kita masukkan pada context yaitu `Hello`.

Lalu `context.WithValue` juga mengembalikan `interface context`, tetapi kali ini dengan memiliki sebuah value yang sudah ditetapkan didalamnya.

Dan ingat kita menggunakan context ini sebagai nilai `argumen` pada function `doSomething`, artinya kita dapat mengambil nilai pada context didalam function tersebut.

Sekarang pada function `doSomething` ubah kodenya menjadi seperti ini:

```go
func doSomething(ctx context.Context) {
	val := ctx.Value("myKey")
	fmt.Println("Value in context says:", val)
}
```
Kita dapat mengambil nilai didalam context dengan menggunakan `ctx.Value()` dengan menyertakan `key` yang sudah kita tetapkan pada function `main`. Dan terakhir kita mencetak nilai context yang kita dapatkan.

Sekarang coba kita jalankan ulang aplikasi kita.
```go
go run main.go
```

Dan hasilnya kita mendapatkan nilai yang sudah kita tetapkan diatas.
![Context With Value](/images/context-pada-golang/context-3.png "Context With Value")

## Context Bersifat Immutable
Ketika menggunakan context, penting untuk mengetahui bahwa nilai yang disimpan dalam `Context` bersifat `immutable` artinya nilai tidak dapat diubah setelah dibuat. 

Contohnya saat kita menggunakan `context.WithValue`, hal yang terjadi sebenarnya kita meneruskan `parent context` yaitu `context.Background` dan hasil dari `context.WithValue` mengembalikan `interface context.Context` kembali dengan memiliki nilai didalamnya, yang sebelumnya kosong tidak memiliki nilai apapun. 

Hal ini karena fungsi `context.WithValue` tidak mengubah `parent context` yang kita berikan. Sebagai gantinya, dia membungkus `context parent`-nya di dalam `context` lain dengan nilai baru.

Begitu juga jika kita menggunakan `context.Background()` sebagai `parent` untuk `context` lain, nilai yang sudah kita tetapkan tidak akan ada didalamnya.

Inilah yang kita bahas pada bagian [Parent Dan Child Context](#parent-dan-child-context) diatas.

Untuk lebih paham mari kita ubah kode pada function `doSomething` menjadi seperti ini:

```go
func doSomething(ctx context.Context) {
	greetContext := context.WithValue(ctx, "myKey", "Hola")
	greetings(greetContext)

	val := ctx.Value("myKey")
	fmt.Println("Value in context says:", val)
}
```
pada Kode diatas sebelum kita mencetak value context yang dikirim dari function `main`, kita membuat `context.WithValue` baru dengan parentnya adalah context yang berasal dari function `main` yang mana `parent context` ini sudah memiliki nilai dengan key `myKey` dan valuenya `Hello`.

Tapi, kita membuat value baru yaitu `Hola` dengan `key` yang sama. Tujuannya kita ingin melihat apakah value pada key `myKey` berubah, atau tidak karena `context.WithValue` membuat nilai yang baru seperti yang dijelaskan diatas.

Lalu, kita mengirim `greetContext` untuk menjadi nilai argumen dari function `greetings`. Tapi kita belum memiliki function tersebut, mari kita buat dengan kodenya seperti ini:

```go
func greetings(ctx context.Context) {
	val := ctx.Value("myKey")
	fmt.Println("Value context in function greetings says:", val)
}
```

Sekarang, kita coba jalankan ulang aplikasi kita untuk melihat hasilnya.

```go
go run main.go
```

Dan hasilnya, nilai pada context yang lama masih sama. Dan kita mendapatkan nilai yang baru pada function greetings dengan key yang sama.
![New Context With Value Greetings](/images/context-pada-golang/context-4.png "New Context With Value Greetings")

## Context With Cancel
Context `cancelling` adalah cara paling mudah untuk mengakhiri sebuah context.

Untuk menggunakan context cancelling kita dapat menggunakan `context.WithCancel`.

Untuk mencobanya pada function `doSomething` ubah menjadi seperti ini:
```go
func doSomething(ctx context.Context) {
	ctxCancel, cancel := context.WithCancel(ctx)
	greetContext := context.WithValue(ctxCancel, "myKey", "Hola")
	go greetings(greetContext)

	time.Sleep(3 * time.Second)
	cancel()

	val := ctx.Value("myKey")
	fmt.Println("Value in context says:", val)
	fmt.Printf("doSomething: finished \n")
	time.Sleep(2 * time.Second)
}
```
Pada kode diatas, hal pertama yang kita lakukan adalah menggunakan `context.WithCancel` untuk mengirim sinyal `cancel`.
Jenis context ini hanya membutuhkan `parent context` sebagai nilai argumennya, maka disini kita menggunakan `context` yang dikirim dari function `main` sebagai `parent`nya.

`context.WithCancel` mengembalikan 2 nilai, yaitu `context` baru dan function `cancel`. Untuk `context` baru yang dikembalikannya kita simpan pada variable `ctxCancel` dan kita jadikan sebagai parent bagi `context.WithValue` yang sebelumnya menggunakan `context` dari function `main`. 

Perlu diingat sekarang `context.WithValue` adalah `child` dari `context.WithCancel` yang baru saja kita buat. Dan ketika kita lakukan proses `cancelling` pada `ctxCancel` maka `context.WithValue` dan child dibawahnya juga akan ikut di cancel. 

```go
	ctxCancel, cancel := context.WithCancel(ctx)
	greetContext := context.WithValue(ctxCancel, "myKey", "Hola")
	go greetings(greetContext)

	time.Sleep(3 * time.Second)
	cancel()
```

Lalu, ketika kita memanggil function `greetings` kita menggunakan keyword `go` atau `goroutine` untuk menjalankan function ini dengan metode `concurrency`.

Selanjutnya, kita melakukan proses `sleep` atau proses menunggu selama `3 detik` dengan menggunakan function `time.Sleep` lalu setelahnya kita panggil function `cancel()` untuk mengirim sinyal `cancel` ke `context`.

Terakhir, kita mencetak informasi string untuk menandakan kalau function `doSomething` selesai mengeksekusi semua kode didalamnya. Dan kita juga melakukan proses `sleep` selama `2 detik`, hal ini hanya opsional saja digunakan untuk menunggu semua kode kita sudah dieksekusi dan `sinyal cancel` pada `context` sudah terkirim pada function `greetings`.

```go
	val := ctx.Value("myKey")
	fmt.Println("Value in context says:", val)
	fmt.Printf("doSomething: finished \n")
	time.Sleep(2 * time.Second)
```

Sekarang, pada function `greetings` kita ubah kodenya agar dapat memeriksa apakah `context parent` sudah berakhir dikarenakan sudah melakukan proses `canceling`. Ubah kodenya menjadi seperti ini:

```go
func greetings(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			if err := ctx.Err(); err != nil {
				fmt.Printf("greetings err: %s\n", err)
			}
			fmt.Printf("greetings: finished \n")
			return
		default:
			// Get value from context
			val := ctx.Value("myKey")
			// Print value
			fmt.Println("Value context in function greetings says:", val)
		}
		time.Sleep(500 * time.Millisecond)
	}
}
```
Pada kode diatas kita menggunakan infinite `for loop` atau perulangan yang terus dilakukan sampai suatu kondisi terpenuhi.
Dan kita juga menggunakan statment `select` untuk mengecek beberapa case.

Yang pertama kita akan mengecek apakah `context` sudah berakhir dengan menggunakan `ctx.Done()`. 

Jadi `context` menyediakan sebuah function yang disebut dengan `Done` yang dapat memeriksa apakah sebuah context sudah berakhir atau belum. 

Function ini mengembalikan sebuah `channel` yang ditutup saat `context` sudah selesai, dan semua function yang menggunakan `context` ini akan mengetahui bahwa mereka harus menganggap eksekusi `context` sudah selesai dan harus menghentikan pemrosesan apa pun yang terkait dengan `context` yang mereka gunakan.

Function `Done` berfungsi karena tidak ada nilai yang pernah ditulis kedalam `channel` yang dikembalikannya, dan ketika `channel` ditutup, maka `channel` itu akan mengembalikkan nilai `nil`.

Disini kita melakukan pengecekan secara terus menerus pada function `Done` ini, jika `context` sudah berakhir disini kita mencetak pesan error yang diberikan oleh `ctx.Err` dan juga mencetak string yang menyatakan proses function `greetings` sudah selesai.

Pada staatment `select` kita juga memberikan nilai `default` yang mana jika beberapa `case` belum terpenuhi nilai `default` ini yang akan dieksekusi terus, disini kita melakukan proses mencetak `value dari context` yang dikirim dari function `doSomething`.

Terakhir kita melakukan proses `sleep` selama setengah detik, agar memberikan jeda pada proses perulangan.

Sekarang kita coba jalankan aplikasi kembali untuk melihat apakah yang akan terjadi.

```go
go run main.go
```

Hasilnya, kita akan mendapatkan function `greetings` melakukan beberapa proses print `value` pada `context` dikarenakan sinyal `cancel` belum dikirimkan.

![Context With Cancel](/images/context-pada-golang/context-5.png "Context With Cancel")

Setelah `3 detik`, kita memanggil function `cancel()` dan sinyal `cancel` akan dikirimkan ke beberapa function yang menggunakan `context` ini, disini yaitu function `greetings`. 

Tapi karena kita memanggil function `greetings` dengan menggunakan `goroutine` maka proses `concurrency` dilakukan, artinya aplikasi akan menjalankan terlebih dahulu sebuah proses yang lebih cepat, dan disini proses mencetak `value context` dari function `main` dan proses mencetak string function  `doSomething` lebih cepat, maka dijalankan terlebih dahulu. Lalu function `greetings` sudah mendapatkan sinyal `cancel` maka `ctx.Done` dijalankan didalamnya dan lihat kita mendapatkan pesan `context canceled` artinya proses `context` sudah berakhir.

## Context With Deadline
Menggunakan `context.WithDeadline` pada sebuah context memungkinkan kita untuk menetapkan batas waktu kapan context harus selesai, dan secara otomatis akan berakhir ketika batas waktu sudah tercapai.

Tetapi kita juga dapat melakukan proses `cancel` secara manual, tanpa harus menunggu batas waktu yang ditentukan berakhir.

Untuk mencobanya, pada function `doSomething` ubah menjadi seperti ini:

```go
func doSomething(ctx context.Context) {
	deadline := time.Now().Add(1 * time.Second)
	ctxCancel, cancel := context.WithDeadline(ctx, deadline)
	defer cancel()

	greetContext := context.WithValue(ctxCancel, "myKey", "Hola")
	go greetings(greetContext)

	val := ctx.Value("myKey")
	fmt.Println("Value in context says:", val)
	fmt.Printf("doSomething: finished \n")
	time.Sleep(2 * time.Second)
}
```
Beberapa kode sama seperti sebelumnya, yang berbeda adalah disini kita menggunakan `context.WithDeadline` untuk melakukan proses `cancel` secara otomatis.

Dan kita menghapus proses `sleep` selama `3 detik` dan juga proses `cancel` context secara manual.

```go
	deadline := time.Now().Add(1 * time.Second)
	ctxCancel, cancel := context.WithDeadline(ctx, deadline)
	defer cancel()
```
Pertama, kita menentukan antara waktu sekarang dan kedepannya berapa lama `context` akan dibatalkan. Disini kita menentukan waktu sekarang dan menambahkan `1 detik` setelahnya.

Lalu kita menggunakan function `context.WithDeadline` dimana kita menggunakan nilai `context` dari parameter yang dikirimkan dari function `main` sebagai nilai `parent`nya, dan juga kita menambahkan waktu `deadline` yang sudah kita tentukan untuk menentukan batas waktu `context` ini dibatalkan jika waktu `deadline` terlewati.

Selanjutnya, kita menggunakan `defer` untuk menjalankan `cancel` pada akhir ekseskusi kode. Hal ini dilakukan untuk melakukan proses `cancel` ketika semua `context` berhasil dieksekusi sebelum melewati batas `waktu` yang ditentukan, agar membersihkan semua resource yang telah digunakan sebelumnya.

Dan sekarang kita coba menjalankan aplikasi kita kembali.
```go
go run main.go
```

Hasilnya akan seperti ini:
![Context With Deadline](/images/context-pada-golang/context-6.png "Context With Deadline")

Perhatikan, setelah kita menjalankan aplikasi kita selama `1 detik`, context otomatis dibatalkan dengan memberikan pesan error `context deadline exceeded`. Artinya proses eksekusi aplikasi kita berjalan lebih dari `1 detik` itu karena di paling akhir function `doSomething` kita masih melakukan proses `sleep` selama `2 detik`.

Mengakhiri context menggunakan `context.WithDeadline`, bukan `context.WithCancel`, memungkinkan kita untuk menentukan waktu tertentu ketika context harus diakhiri. 

Jika kita mengetahui waktu untuk sebuah context harus berakhir, `context.WithDeadline` kemungkinan adalah kandidat yang baik untuk mengelola akhir dari `context` kita. 

Tapi dilain kasus kita tidak peduli tentang waktu spesifik mulai dari mana dan kapan sebuah context harus berakhir dan kita hanya ingin context tersebut berakhir misalnya `2 detik` setelah sebuah operasi dijalankan.

Kita akan membahasnya dengan menggunakan `context.WithTimeout`.

## Context With Timeout
Fungsi `context.WithTimeout` dapat kita anggap sebagai fungsi yang lebih mudah dari menggunakan `context.WithDeadline`. Dimana kita hanya perlu menetukan berapa lama durasi waktu dari proses sebuah `context` harus selesai.

Dan jika kita lihat lebih dalam ke package `context.WithTimeout`, sebenarnya function ini juga bekerja dengan cara menggunakan dan mengembalikan `context.WithDeadline`.

![Context With Timeout works](/images/context-pada-golang/context-7.png "Context With Timeout works")

Sekarang kita coba menggunakannya, pada function `doSomething` ubah menjadi seperti ini:

```go
func doSomething(ctx context.Context) {
	duration := 1 * time.Second
	ctxCancel, cancel := context.WithTimeout(ctx, duration)
	defer cancel()

	// ...kode lain
}
```
Pada kode diatas, kita menggunakan `context.WithTimeout`, dan kita juga memberikan durasi batas waktunya.

Dan sekarang kita coba menjalankan ulang aplikasi kita.

![Context With Timeout](/images/context-pada-golang/context-6.png "Context With Timeout")

Hasilnya sama persis dengan menggunakan `context.WithDeadline`, tapi disini kita lebih dipermudah dalam menentukan durasi context akan berakhir.

# Kesimpulan
Pada artikel kali ini kita sudah belajar dan paham menggunakan `context` dari mulai cara membuatnya dengan berbagai cara. Juga memahami cara kerja context dimana memiliki `parent` dan `child`.

Lalu menambahkan nilai kedalam context dengan menggunakan `context.WithValue`.

Dan kita juga memperbarui aplikasi kita untuk menggunakan tiga cara berbeda untuk mengakhiri `context`. Yang pertama, `context.WithCancel`, memungkinkan kita memanggil fungsi `cancel` untuk membatalkan `context`. 

Selanjutnya, kita menggunakan `context.WithDeadline` dengan nilai waktu spesifik untuk secara otomatis mengakhiri context pada waktu tertentu. 

Terakhir, kita menggunakan `context.WithTimeout` dan menentukan waktu durasi untuk secara otomatis mengakhiri konteks setelah jangka waktu tertentu.

Dengan memanfaatkan `context` beserta fungsi-fungsi miliknya, kita akan dapat memastikan program kita tidak mengkonsumsi lebih banyak sumber daya daripada yang dibutuhkan di komputer. 

Jika kamu ingin mengirimkan koreksi atau saran, kita dapat berdiskusi dengan menghubungi saya di beberapa akun social media saya pada link yang ada di halaman Home di blog ini.

Seluruh kode dapat kamu lihat pada repository github pada link ini [golang-context](https://github.com/letenk/golang-context).

Happy sharing 👋

**Referensi**:
- https://www.digitalocean.com/community/tutorials/how-to-use-contexts-in-go
- https://www.udemy.com/course/pemrograman-go-lang-pemula-sampai-mahir/
- https://www.youtube.com/watch?v=h2RdcrMLQAo













