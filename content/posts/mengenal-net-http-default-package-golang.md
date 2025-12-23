---
title: "Mengenal net/http Default Package Golang"
date: 2022-10-29T20:06:48+07:00
tags: ["go", "golang", "package"]
cover:
  image: "/images/mengenal-net-http-default-package-golang/nethttp-cover.png"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

Go atau Golang yang sering kita dengar sangat bagus untuk membangun aplikasi web dari segala bentuk dan ukuran.

Hal ini karena Go memiliki standart paket library yang bersih, konsisten dan mudah digunakan.

# Apa itu net/http
Salah satu paket librarynya adalah `net/http`. Paket ini memungkinkan kita membangun server HTTP di Go dengan baik dan beberapa fitur lain seperti routing, templating, dan lainnya.

Go memiliki web servernya sendiri dan web server ini ada didalam Go. Berbeda dengan bahasa lain yang memerlukan pendukung web server terpisah (contoh PHP yang membutuhkan Nginx atau Apache sebagai web servernya).

# Membuat Aplikasi Sederhana
Pada bagian ini kita akan membuat sebuah aplikasi web server sederhana data buku, dimana kita akan mempelajari beberapa fungsi package `net/http` seperti **routing** dan **server**.

Kita juga akan membuat aplikasi client HTTP Request yang akan mengkonsumsi data dari aplikasi web server data buku yang telah kita buat. Karena package `net/http` juga dapat melakukan http request.

## Aplikasi Web Server Data Buku
Hal pertama yang akan kita lakukan adalah buat sebuah folder project baru. Disini saya memberikan nama `web_server_book` dan lalu masuk kedalamnya.
```go
mkdir web_server_book
cd web_server_book 
```

Buka project dengan code editor, disini saya menggunakan `vscode`.

### Create server
Selanjutnya, buat file dengan nama `main.go`.

Isi dengan kode dibawah ini.
```go
package main

import "net/http"

const serverPort = ":3000"
```
Hal yang pertama kita lakukan adalah mendefinisikan nama `package main` dimana package inilah yang akan pertama kali dijalankan ketika aplikasi di run. Selanjutnya kita `import` package `net/http`. Lalu kita juga membuat sebuah `const` dengan nama `serverPort` dengan nilai `string :3000`. 

```go
func main() {
	// Route Home
	http.HandleFunc("/", getHome)

	// Create new server
	http.ListenAndServe(serverPort, nil)
}
```
Selanjutnya, kita membuat function `main`. Didalamnya kita membuat sebuah handler function dengan menggunakan fungsi `http.HandleFunc()` yang digunakan untuk melakukan routing. Maksud routing yaitu penentuan aksi ketika `url` tertentu diakses oleh client. 
Dan didalamnya kita memiliki 2 nilai argumen, dimana argumen pertama kita mendaftarkan alamat url `/`, yang kedua kita mendaftakan `function` yang nanti akan kita buat sebagai handler.

### Route Home
```go
func getHome(w http.ResponseWriter, r *http.Request) {
	// message response
	message := []byte("Home page")
	// write response
	w.Write(message)
}
```
Selanjutnya, buat function dengan nama `getHome`. Function ini adalah sebuah `handler function` yang wajib memiliki dua parameter. Dimana parameter yang pertama adalah `w http.ResponseWriter` digunakan untuk menuliskan respon yang diberikan ke client dan yang kedua, `r *http.Request` digunakan untuk menangkap respon dari client.
Didalamnya kita membuat sebuah variable `message` dengan nilai `Home Page` bertipe `[]byte`. Dan yang terakhir kita menggunakan function `w.Write()` untuk mendaftarkan respon ke client dengan nilai parameter variable `message`. Nilainya harus bertipe `[]byte` maka dari itu value variable `message` kita definisikan bertipe `[]byte`.

Selanjutnya, kita akan mencoba mengakses aplikasi kita. Untuk mengaksesnya dapat menggunakan aplikasi seperti `browser`, `postman`, `insomnia`. Tapi kali ini kita akan menggunakan `CLI (Command Line Interface)` dengan bantuan `cURL`. 

Buka `CLI` dan ketikan perintah ini untuk memastikan apakah `curl` sudah terinstall.
```go
curl --version
```
Hasilnya akan seperti ini.
![curl version](/images/mengenal-net-http-default-package-golang/nethttp-curl.png)

Jika pada perangkat kamu belum terinstall `curl` silahkan kunjungi halaman ini [curl](https://curl.se/download.html).

Setelah dipastikan `curl` sudah terinstall, sekarang kita jalankan aplikasi kita. Pada `CLI` ketikkan perintah berikut.
```go
go run main.go
```
Hasilnya `CLI` kita akan freezee, ini artinya aplikasi kita berhasil dijalankan dengan url `http://localhost:3000`.

Lalu kita coba akses, ketikkan perintah ini pada `CLI` yang berbeda.
```go
curl -X GET \
-i http://localhost:3000
```
Pada perintah `curl` diatas kita menggunakan flag `-X` untuk menentukan method `GET` yang digunakan, lalu diikuti dengan menthod `-i` yang digunakan untuk menampilkan seluruh informasi yang ada pada `Header` dan terakhir kita panggil url aplikasi kita.

Hasilnya akan mendapatkan response seperti ini.
![home page](/images/mengenal-net-http-default-package-golang/nethttp-1.png)

Cukup jelas ya.

### Route Get Books
Sekarang kita akan membuat route baru untuk menampilkan respone beberapa buku tapi dalam format `JSON`.

`JSON` atau `Javascript Object Notation` adalah notasi standar yang umum digunakan untuk komunikasi data dalam web. JSON merupakan subset dari javascript.
Go menyediakan package `encoding/json` yang berisikan banyak fungsi untuk kebutuhan operasi json.

Disini kita akan belajar cara konversi `string` yang berbentuk JSON menjadi object data GO dan sebaliknya.

- Struct Book

Langkah pertama adalah kita buat sebuah object struct `Book` yang memiliki field `ID`,`Title` dan `Author`. Dan  kita juga membuat beberapa sample data buku menggunakan object struct `Book`, karena lebih dari satu buku maka kita menggunakan `slice` untuk menampung datanya. 
```go
// ... kode lain
import (
	"encoding/json" // <-- import ini
	"net/http"
)

const serverPort = ":3000"

// Struct Book
type Book struct {
  	ID     int  `json:"id"`
	Title  string `json:"title"`
	Author string `json:"author"`
}

// Sample data
var books = []Book{
	{ID: 1, Title: "REWORK", Author: "Jason Fried & David Heinemeier Hansson"},
	{ID: 2, Title: "Atomic Habbits", Author: "James Clear"},
}

// ... kode lain
```
Pada object struct `Book` kita tambahkan tag `json` untuk mendefinisikan field untuk menghasilkan response dengan tipe huruf `lowercase` seperti `title`, karena biasanya pada response JSON kita ingin menggunakan tipe huruf tersebut. Jika tidak akan menghasilkan response dengan tipe huruf `uppercase` mengikuti nama field aslinya.

- Route Get Books

Sekarang buat route baru untuk menampilkan data buku pada function `main`.
```go
func main() {
	http.HandleFunc("/", getHome)
	// Route Get Books
	http.HandleFunc("/books", getBooks)

	// ... kodelain
}
```

- Handler Function getBooks

Pada route `/books` kita membutuhkan function `getBooks` tambahkan kode ini tepat dibawah function `getHome`.
```go
func getBooks(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		json.NewEncoder(w).Encode(books)
    	return
	}

	http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
}
```
Pada function `getBooks` diatas, kita melakukan pengecekan method yang digunakan oleh client dengan menggunakan `r.Method`, apakah methodnya sama dengan `GET`. Jika ya, maka kita melakukan proses encode dengan menggunakan function `json.NewEncoder(w)` dimana `w atau http.ResponseWriter` sebagai nilai argument-nya, dan dilanjutkan dengan proses encode dengan function `Encode(books)` dimana sample data pada variable `books` sebagai nilai argument-nya yang akan di encode ke JSON. Keyword `return` digunakan agar kode tidak dijalankan lagi kebawahnya.

Terakhir, jika method yang digunakan client untuk mengakses route ini tidak sama dengan `GET`, maka kita berikan response error dengan menggunakan function `http.Error()`. Yang mana memiliki 3 nilai argument:
1. Pertama, `w atau http.ResponseWriter`
2. Kedua, message error string yang bisa kita sesuaikan pesannya.
3. Ketiga, status response code. Disini kita menggunakan `http.StatusMethodNotAllowed` untuk menghasilkan status code `405`. Kita juga dapat menulisnya code integer `405` secara manual tanpa menggunakan `http.StatusMethodNotAllowed`.

Sekarang coba kita stop aplikasi kita yang sebelumnya dijalankan dan jalakan ulang.

Percobaan pertama, kita akan mengakses menggunakan method `POST`. Ketikkan kode ini pada CLI.
```go
curl -X POST \
-i http://localhost:3000/books
```
Pada perintah diatas kita menggunakan flag `-X` untuk menentukan method yang ingin digunakan, kali ini kita menggunakan `POST`. Dan lihat hasilnya pada gambar dibawah.
![get books method not allowed](/images/mengenal-net-http-default-package-golang/nethttp-2.png)
Pada gambar diatas kita mendapatkan response `405 Method Not Allowed` dan yang paling bawah adalah message yang kita buat.

Percobaan kedua kita akses menggunakan method `GET`.
```go
curl -X GET \
-i http://localhost:3000/books
```

Hasilnya kita akan mendapatkan status code `200 OK` artinya sukses untuk mengakses route `/books`, dimana status ini adalah default ketika kita tidak menentapkan status code yang ingin digunakan.

Dan juga di paling bawah, kita mendapatkan response beberapa sampel data buku yang kita encode.

![get books success](/images/mengenal-net-http-default-package-golang/nethttp-3.png)

### Route Get Book By id
Kita juga dapat menampilkan data buku berdasarkan `id` yang kita inginkan. 

Mari kita coba...

- Route Get Book

Sebelumnya kita membuat route `/books` untuk menampilkan beberapa data buku. Kali ini kita akan membuat route `/book` yang akan menampilkan 1 data buku berdasarkan id. Pada function `main` tambahkan kode route ini.
```go
func main() {
  // ... kode lain

	// Route Get Book By id
	http.HandleFunc("/book", getBook)

	// ... kode lain
}
```

- Handler Function getBook

Sekarang tambahkan handler function `getBook` yang dibutuhkan pada route `book`.

```go
func getBook(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		id, _ := strconv.Atoi(r.FormValue("id"))

		for _, data := range books {
			if data.ID == id {
				json.NewEncoder(w).Encode(data)
				return
			}
		}

		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
}
```
Pada handler function `getBook` beberapa kode sama dengan function `getBooks`. Yang menjadi perhatian ada pada kode:
```go
id, _ := strconv.Atoi(r.FormValue("id"))
```
Pada kode ini kita menangkap nilai `query parameter` pada url dengan menggunakan function `r.FormValue("id")` yang dikirim dari client, pada kasus kita nilainya dengan nama `id`. 

Hasil yang didapat adalah data dengan tipe `string`, karena pada object struct `Book` field `ID` bertipe `int`. Maka kita melakukan konversi tipe dari `string` ke `int` menggunakan function `Atoi()` milik package `strconv`. Function ini mengembalikan 2 nilai yaitu:
1. nilai `int` hasil dari konversi.
2. Kedua, nilai `error`. Disini errornya kita abaikan dengan menggunakan variable `_ (underscore)`.

Pastikan kita meng-`import` packagenya:
```go
import (
	// ...kode lain
	"strconv" // <-- import ini
)
```

Selanjutnya kita melakukan perulangan dengan menggunakan `for range`:
```go
for _, data := range books {
    if data.ID == id {
      json.NewEncoder(w).Encode(data)
      return
    }
}
```
Dimana kita melakukan perulangan semua data didalam var `book`. Lalu didalamnya kita melakukan pengecekan, apakah `data.ID` ada yang sama dengan `id` yang dikirim client melalui `query parameter` ?
Jika ada, maka tangkap datanya lalu lakukan response encode ke JSON.

Jika tidak ada, maka kita kirimkan response error `Book not found` dengan status code `404`.
```go
http.Error(w, "Book not found", http.StatusNotFound)
return
```

Sekarang kita coba akses dengan `CLI`, sebelum itu restart dulu server aplikasi kita. Lalu ketikan perintah ini pada `CLI`.
```go
curl -X GET \
-i http://localhost:3000/book?id=2
```
Pada perintah diatas kita menambahkan parameter `id` dengan nilai `2`. Jika berhasil hasilnya akan seperti ini:
![get book by id success](/images/mengenal-net-http-default-package-golang/nethttp-4.png)

Bagaimana jika `id`nya tidak ditemukan? Kita akan mendapat response dengan status code `404 Not Found` dan message `Book not found`.
![get book by id success](/images/mengenal-net-http-default-package-golang/nethttp-5.png)

### Route Post Book
Bagaimana cara menangkap input data dari client?

Mari kita bahas.

- Route Post Book

Pada function `main` tambahkan route `/post-book`.
```go
func main() {
	// ...kode lain

	// Route Post Book
	http.HandleFunc("/post-book", postBook)

	// ...kode lain
}
```

- Handler Function postBook

Selanjutnya tambahkan handler function `postBook`.

```go
func postBook(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var newBook Book
		err := json.NewDecoder(r.Body).Decode(&newBook)
		if err != nil {
			log.Panic(err)
		}

		books = append(books, newBook)

		w.Write([]byte("Book has been added"))
		return
	}

	http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
}
```
Pada kode diatas kita melakukan pengecekan method yang digunakan client, jika methodnya adalah `POST`, kita akan bahas kodenya satu persatu:

```go
var newBook Book
err := json.NewDecoder(r.Body).Decode(&newBook)
if err != nil {
  log.Panic(err)
}
```
Pertama, kita membuat variable dengan nama `newBook` yang memiliki tipe object struct `Book` yang nanti akan kita gunakan untuk menampung data `decode` dari `JSON`.

Pada beberapa kasus diatas kita melakukan proses `encode` yaitu proses konversi dari data `object Go` ke `JSON`. 

Sekarang kita melakukan proses sebaliknya, yaitu `decode` dengan mengunakan fungsi `json.NewDecoder()` untuk membaca data yang dikirim dari client yang mana nilai argument-nya adalah `r.Body`. Lalu dilanjukan proses `decode` ke variable pointer `newBook` dengan menggunakan function `Decode` milik package `encoding/json` juga. Function ini mengebalikan nilai `error` dan seperti biasa kita melakukan pengecekan jika `error`nya tidak `nil`.

```code
books = append(books, newBook)
```
Langkah selanjutnya, menambahkan data yang ada pada variable `newBook` kedalam variable sample data `books` menggunakan function `append()`. Karena variable `books` sebelumnya kita definisikan tipe nya `slice` dari struct object `book` maka kita dapat menggunakan funtion `append()` untuk menambahkan data ke posisi terakhir pada `slice`.

Dan yang terakhir, kita memberikan simple response ketika data berhasil ditambahkan.
```go
w.Write([]byte("Book has been added"))
return
```

Sekarang kita coba untuk menambahkan data baru, sebelum itu restart terlebih dahulu aplikasi kita. Lalu ketikkan perintah ini pada `CLI`:
```go
curl -X POST \
-d '{"id": 3, "title": "Harry Potter", "Author": "J. K. Rowling"}' \
-i http://localhost:3000/post-book
```
Perhatikan perintah curl diatas kita menggunakan flag `-d` untuk mendefinisikan datanya dan diikuti dengan data yang ingin kita input. Jika berhasil kita akan mendapatkan response seperti ini:
![post new book success](/images/mengenal-net-http-default-package-golang/nethttp-6.png)

Sekarang, kita coba panggil route `/book` dengan menambahkan parameter `id=3`.
![post new book success](/images/mengenal-net-http-default-package-golang/nethttp-7.png)
Jika response yang didapat sama seperti pada `CLI` seperti gambar diatas, yay selamat kita telah berhasil untuk menambahkan data baru.

### Middleware
Kali ini kita akan membuat sebuah `middleware`. Middleware adalah fungsi yang akan dilewati pertama kali oleh http request sebelum masuk ke fungsi lainnya. Lebih simplenya bisa dikatakan sebuah `filter`.

Didalam middleware kita dapat menambahkan kode yang dapat digunakan sebelum atau sesudah sebuah `handler` dieksekusi.

`Handler` pada kasus kita kali ini adalah beberapa routing yang telah kita buat menggunakan function `handleFunc()` yang dimana pada parameter ke duanya mengimplementasikan `interface` dari `http.Handler` yaitu ketika ingin menggunakanya diwajibkan memiliki skema `ServeHTTP(ResponseWriter, *Request)`. Dan semua handler function yang kita buat sudah mengikutinya.

Yang dimaksud `interface` atau bisa mudahnya dikatakan sebuah **kontrak** yang harus diikuti.

Middleware dapat digunakan untuk berbagai hal seperi `logging`, mengecek `authentikasi`, dan lainnya.

- Middlware Logging

Kali ini kita akan membuat logging middleware, yang akan menampilkan alamat `address` dan `method` yang digunakan oleh client yang mengakses aplikasi web server kita.

Tambahkan function `logMiddleware` ini.
```go
func logMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Address: %s, Url: %s, Method: %s\n", r.RemoteAddr, r.URL, r.Method)
		next.ServeHTTP(w, r)
	}
}
```
Pertama, kita menambahkan function `logMiddleware` yang memilki parameter dan juga mengembalikan function `http.HandlerFunc`.

Didalamnya kita mengembalikan sebuah `anonymous function` dan memiliki parameter yang mengikuti kontrak `interface` dari `http.Handler` seperti yang sudah kita bahas diatas.

Didalam `anonymous function` kita menggunakan package `log` untuk mencetak informasi ke `CLI`, dimana informasi yang dicetak adalah `address` client dengan menggunakan `r.RemoteAddr`, route yang dituju dengan menggunalan `r.URL` dan juga mencetak method yang digunakan dari client yang melakukan request .

Selanjutnya, kita lanjutkan proses request ke route yang dituju oleh client dengan function `ServeHTTP`.

- Implementasikan middleware pada route yang sebelumnya kita buat, kita akan menggunakan middleware pada semua route yang kita inginkan. Dengan cara membungkus semua handler function dengan menggunakan `log middleware`. 

Pada function `main`, ubah kodenya menjadi seperti ini:
```go
func main() {
	// Bungkus menggunakan `logMiddleware` 
	http.HandleFunc("/", logMiddleware(getHome))
	http.HandleFunc("/books", logMiddleware(getBooks))
	http.HandleFunc("/book", logMiddleware(getBook))
	http.HandleFunc("/post-book", logMiddleware(postBook))

	// Create new server
	http.ListenAndServe(serverPort, nil)
}
```

Jadi alur flownya, ketika ada `request client` akan melewati `logMiddleware` terlebih dahulu pada kasus kita untuk mencetak `log`, lalu diteruskan ke `handler function` yang dituju untuk mengembalikan response yang sesuai fungsinya masing - masing.

![middleware flow](/images/mengenal-net-http-default-package-golang/nethttp-8.png)

Bisa dibayangkan kita dapat melakukan banyak hal lain didalam middleware dan yang umum biasanya adalah megecek autorisasi apakah user sudah login atau belum.

Semoga cukup mudah dipahami ya.

Sekarang kita akan mencobanya, sebelumnya restart dulu aplikasi kita. 

Agar kita dapat melihat apakah middleware yang kita buat bekerja untuk mencetak `log`. Disarankan membuka `CLI` baru, lalu ketikkan perintah untuk mengakses `books` dan `post book` dengan `curl`.

![post new book success](/images/mengenal-net-http-default-package-golang/nethttp-9.png)
Pada gambar diatas, `CLI` kiri adalah hasil output dari `log middleware` dan kanan adalah perintah untuk mengakses aplikasi.

## Aplikasi Web Client
Package `net/http` juga dapat digunakan untuk melakukan keperluan `http request` dengan menggunakan beberapa function yang terdapat didalamnya.

Kali ini kita akan menggunakan function `http.NewRequest()` yang akan kita gunakan untuk mengkonsumsi data dari aplikasi web server `book` yang sebelumnya kita buat.

### File main
Langkah pertama yang kita lakukan adalah buat folder project baru, disini saya membuat dengan nama `web_client_book`. Dan buat file `main.go` didalamnya.

- Struct Book dan Variabel Base URL

Didalam file `main.go` isikan dengan kode ini:

```go
package main

var baseURL = "http://localhost:3000"

type Book struct {
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Author string `json:"author"`
}
```

Pada kode diatas kita mendefinisikan nama package `main`. Lalu diikuti dengan membuat var `baseURL` dengan nilai alamat url aplikasi web server book.

Selanjunya, kita juga membuat `struct Book` yang mana skema-nya sama dengan yang ada pada aplikasi web server book.

### Function fetchBooks
Selanjutnya kita buat function dengan nama `FetchBooks` yang akan digunakan untuk melakukan `request` ke url `http://localhost:3000/books` dan mengembalikan `slice` dari struct `book` dan juga `error`.

```go
func fetchBooks() ([]Book, error) {
	var client = &http.Client{}
	var books []Book

	// Create new request
	request, err := http.NewRequest("GET", baseURL+"/books", nil)
	if err != nil {
		return nil, err
	}

	// Execute request
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	// Decode from json to object Book
	err = json.NewDecoder(response.Body).Decode(&books)
	if err != nil {
		return nil, err
	}

	// Return books and error nil
	return books, nil
}
```
Didalam function `FetchBooks`, pertama kita membuat variable `client` dengan nilai ` &http.Client{}`. Ini akan menghasilkan instace dari `http.Client`. Yang mana kita dapat menggunakan function turunannya untuk keperluan eksekusi `request`.

Lalu kita juga membuat variable `books` yang memiliki nilai `slice struct Book` yang akan digunakan untuk menampung data response lebih dari satu hasil request.

Selanjutnya kita membuat request baru dengan menggunakan function `http.NewRequest` yang memiliki 3 parameter wajib yang harus diisi.
1. Parameter pertama, definisi tipe method yang akan kita gunakan. Seperti `GET`, `POST`, `PATCH`, `DELETE` dan yang lainnya.
2. Parameter kedua, adalah URL tujuan request.
3. Parameter ketiga, data request yang ingin kita kirimkan. Jika tidak, dapat diberikan nilai `nil`.
Dan function ini mengembalikkan 2 nilai, pertama adalah `request` baru dan kedua nilai `error` kita juga melakukan pengecekan jika terjadi error.

Langkah selanjutnya kita proses `request` dengan menggunakan function `client.Do()` ini adalah function yang didapat dari instace `http.Client` diatas. Didalamnya kita menggunakan nilai return `request` dari function `http.NewRequest` sebagai nilai `argumentnya`, yang mengembalikkan 2 nilai:
1. Pertama, response dari hasil request.
2. Kedua, nilai error jika koneksi jaringan gagal atau server menghentikan request. Dan kita juga melakukan pengecekan untuk ini.

Lalu, nantinya kita akan membaca data body dari response dengan menggunakan function `response.Body`, tapi perlu diingat kita diwajibkan untuk menutup response body ketika selesai digunakan dengan bantuan function `Close()` diakhirnya. Keyword `defer` membantu kita untuk melakukan proses penutupan body ini pada akhir ketika semua proses kode didalam function selesai dieksekusi.

Data response yang diambil dari body hasilnya dalam bentuk `string`. Kita akan mengkonversinya kedalam `JSON` dengan menggunakan `json.NewDecoder`, lalu decode kedalam object `Book`. Nilai yang dikembalikan adalah `error` dan kita melakukan pengecekannya.

Terakhir kita kembalikan hasil variable `books` dan nilai errornya adalah `nil`.

### Function main
Seperti biasa didalam `package main` harus memiliki function `main` yang akan dijalankan pertama kali saat aplikasi dijalankan.

Tambahkan kode function `main` ini didalam file `main.go`:

```go
func main() {
	fmt.Println("========")
	fmt.Println("Fetch Books")
	fmt.Println("========")
	books, err := fetchBooks()
	if err != nil {
		fmt.Println("Error: ", err.Error())
		return
	}

	for _, book := range books {
		fmt.Printf("ID: %d\t Title: %s\t Author: %s\t\n", book.ID, book.Title, book.Author)
	}
}
```
Didalamnya, pertama kita jalankan function `fetchBooks`, yang mengembalikkan 2 nilai:
1. Pertama, data beberapa buku yang didapatkan dari response web server book.
2. Kedua, error. Kita juga melakukan pengecekan untuk mencetak error jika terjadi.

Jika tidak ada error selanjutnya, kita lakukan iterasi data `books` dengan menggunakan perulangan `for range`, didalamnya kita mencetak data book yang kita dapat.

Sekarang kita akan mencobanya.

Tapi pastikan kita mengimport package yang dibutuhkan:
```go
import (
	"encoding/json"
	"fmt"
	"net/http"
)
```
Lalu jangan lupa jalankan aplikasi web server book terlebih dahulu.

Pada CLI yang berbeda, kita jalankan aplikasi web client. 

Jika berhasil, kita akan mendapatkan hasil response yang datanya persis sama dengan web server book.
![result http client](/images/mengenal-net-http-default-package-golang/nethttp-10.png)

### Function fetchBookByID
Kita juga dapat menambahkan nilai parameter pada url request. Pada kasus kita kali ini untuk mengakses url `http://localhost:3000/book?id=nilai_id` yang menghasilkan single data book.

Mari kita coba.

Tambahkan function `fetchBookByID`, ini kodenya:
```go
func fetchBookByID(ID string) (Book, error) {
	var client = &http.Client{}
	var book Book

	// Create new request
	request, err := http.NewRequest("GET", baseURL+"/book?id="+ID, nil)
	if err != nil {
		return book, err
	}

	// Execute request
	response, err := client.Do(request)
	if err != nil {
		return book, err
	}
	defer response.Body.Close()

	// Decode from json to object Book
	err = json.NewDecoder(response.Body).Decode(&book)
	if err != nil {
		return book, err
	}

	// Return books and error nil
	return book, nil
}
```

Pada function `fetchBookByID` memiliki parameter `ID` dengan tipe `string` yang akan di isi ketika function dipanggil untuk mendapatkan `id` yang ingin di request. Dan function ini mengembalikkan 2 nilai, yaitu:
1. Pertama, object struct Book
2. Kedua, error jika ada

Beberapa kode sama dengan yang ada pada function `fetchBooks`, tapi yang menjadi perhatian kita membuat variable `book` dengan nilai object struct `Book` tanpa `slice` karena kita akan menerima single data `book`.

Ketika membuat request baru menggunakan function `http.NewRequest`, kita menambahkan parameter `id` dengan nilainya diambil dari parameter function.

Dan sebelumnya ketika terjadi error kita hanya mengembalikkan `nil` tapi kali ini kita mengembalikkan object `book`.

Sekarang pada function `main`, tambahkan kode ini untuk mengeksekusi function `fetchBookByID`:

```go
func main() {
	// ...kode lain

	fmt.Println("\n")
	fmt.Println("========")
	fmt.Println("Fetch Single Book")
	fmt.Println("========")

	// Fetch data single book
	idBook := strconv.Itoa(books[0].ID)
	book, err := fetchBookByID(idBook)
	if err != nil {
		fmt.Println("Error: ", err.Error())
		return
	}

	fmt.Printf("ID: %d\t Title: %s\t Author: %s\t\n", book.ID, book.Title, book.Author)
}
```
Pada variable `idBook` kita mengambil id dari hasil eksekusi function `fetchBooks` dengan yang memiliki index `0`.

Selanjutnya kita lakukan eksekusi function `fetchBookByID` dengan menggunakan variable `idBook` sebagai nilai `argument`nya. function ini mengembalikkan 2 parameter, yaitu:

1. Pertama, data single book yang didapatkan dari response web server.
2. Kedua, error. Kita juga melakukan pengecekan untuk mencetak error jika terjadi.

Jangan lupa, import package `strconv`.
```go
import (
	// ...kode lain
	"strconv" // <-- import ini
)
```
Sekarang kita akan mencobanya, caranya sama seperti pada function `fetchBooks`.

Jika berhasil, kita akan mendapatkan response seperti ini.

![result http client](/images/mengenal-net-http-default-package-golang/nethttp-11.png)

Gimana cukup jelas dan mudahkan ?👏

### Function postBook
Mungkin ada pertanyaan, bagaimana menghandle bagian post untuk menyimpan data.

Mari kita coba.

Tambahkan function `postBook` dengan kodenya ini:

```go
func postBook() (string, error) {
	var client = &http.Client{}

	data := Book{
		ID:     3,
		Title:  "Harry Potter",
		Author: "J. K. Rowling",
	}
	dataBody := fmt.Sprintf(`{"id": %d, "title": "%s", "author": "%s"}`, data.ID, data.Title, data.Author)
	requestBody := strings.NewReader(dataBody)

	// Create new request
	request, err := http.NewRequest("POST", baseURL+"/post-book", requestBody)
	if err != nil {
		return "", err
	}

	// Execute request
	response, err := client.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()

	// Decode from json to object Book
	respBody, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return "", err
	}
	// Return response string and error nil
	return string(respBody), nil
}
```
Beberapa kodenya sama seperti beberapa function sebelumnya, yang berbeda pada variable `data` kita membuat sample data menggunakan object `Book`.

Lalu kita menggunakan bantuan function `fmt.Sprintf{}` untuk membuat template string berbentuk JSON. Dan kita mempassing sample data kedalamnya, dan juga mecocokkan sesuai key yang juga kita buat. Lalu kita simpan didalam variable `dataBody`.

Selanjutnya, data body yang akan kita kirimkan harus diubah terlebih dahulu menjadi bentuk `bytes.Buffer` menggunakan bantuan function `bytes.NewBufferString()` yang nantinya akan kita gunakan menjadi nilai parameter ketiga ketika membuat request baru menggunakan function `http.NewRequest`

Lalu, kita akan membaca semua data body dari hasil response ketika menjalankan request menggunakan function `ioutil.ReadAll`. Tapi kali ini kita tidak melakukan decode ke JSON, karena response yang dikirim hanya data bertipe `[]byte`.

Dan terakhir kita me`return` data response, tapi karena kita butuh sebuah `string` maka kita konversi dulu ke tipe data `string`.

Pastikan package `strings` dan `io/ioutil` sudah di `import`.

```go
import (
	// ...kode lain
	"io/ioutil"
	"strings"
)
```

Selanjutnya, kita coba eksekusi functionnya didalam function `main`, tapi kita melakukan eksekusi sebelum memanggil function `fetchBookByID` karena kita ingin memanggil data yang baru saja kita buat.

Ubah kode pada function `main` menjadi berikut:
```go
func main() {
// ...kode fetch books

	fmt.Println("\n")
	fmt.Println("========")
	fmt.Println("Post Book")
	fmt.Println("========")

	// Post book
	success, err := postBook()
	if err != nil {
		fmt.Println("Error: ", err.Error())
		return
	}
	fmt.Println(success)

	fmt.Println("\n")
	fmt.Println("========")
	fmt.Println("Fetch Single Book")
	fmt.Println("========")

	// Fetch data single book
	idBook := strconv.Itoa(3)
	book, err := fetchBookByID(idBook)
	if err != nil {
		fmt.Println("Error: ", err.Error())
		return
	}
	fmt.Printf("ID: %d\t Title: %s\t Author: %s\t\n", book.ID, book.Title, book.Author)
}
```
Perhatikan, pada function main diatas kita mengeksekusi function `postBook` sebelum function `fetchBookByID`, dan pada variable `idBook` kita mengganti dengan angka `3` yaitu id dari data yang baru kita buat.

Sekarang coba jalankan pada CLI. Jika berhasil kita dapat mengakses data baru dengan id `3`.

![result http client](/images/mengenal-net-http-default-package-golang/nethttp-12.png)

Yay 🎉, sekarang kita paham cara menggunakan package `net/http`. Selain beberapa function yang dijelaskan diatas, tentunya masih ada banyak lagi function yang dapat kita gunakan.

Jika kamu ingin mengirimkan koreksi atau saran, kita dapat berdiskusi dengan menghubungi saya di beberapa akun social media saya pada link yang ada di halaman Home di blog ini.

Seluruh kode dapat kamu lihat pada repository github pada link ini [golang-net-http](https://github.com/letenk/golang-net-http) 

Happy sharing 👋

**Referensi**:
- https://sekolahkoding.com/kelas/http-server-di-go-lang
- https://dasarpemrogramangolang.novalagung.com/A-web-service-api.html
- https://dasarpemrogramangolang.novalagung.com/A-client-http-request-simple.html