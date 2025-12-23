---
title: "Defensive Programming as a Backend Developer Building Robust and Secure Systems"
date: 2024-11-03T11:42:30+07:00
tags: ["tips", "backend engineering"]
cover:
  image: "/images/defensive-programming-as-a-backend-developer-building-robust-and-secure-systems/cover.webp"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

> **English Version**: *For English version of this article, please visit: [dev.to](https://dev.to/tentanganak/defensive-programming-as-a-backend-developer-building-robust-and-secure-systems-50kk)*

Dalam pengembangan aplikasi backend, memastikan keamanan dan stabilitas aplikasi adalah suatu keharusan mutlak. Backend adalah tulang punggung dari aplikasi, yang bertanggung jawab untuk menangani logika bisnis, menyimpan data, dan berinteraksi dengan sistem eksternal. Menulis kode yang kuat dan andal sangat penting untuk semua pengembang perangkat lunak. Namun, tidak peduli seberapa hati-hati kita, bug dan situasi yang tidak terduga masih bisa terjadi. Di sinilah Defensive programming berperan.

Defensive programming adalah praktik coding yang bertujuan untuk memastikan bahwa perangkat lunak berfungsi dengan benar bahkan ketika peristiwa tak terduga atau input tidak valid terjadi. Untuk seorang backend developer, defensive programming adalah pendekatan penting, yang memungkinkan kita merancang aplikasi yang dapat bertahan dari input buruk, error sistem, dan serangan eksternal.

Dalam artikel ini, kita akan membahas beberapa poin tentang bagaimana defensive programming dapat diterapkan untuk meningkatkan ketahanan aplikasi backend dan memberikan contoh dalam bahasa Golang untuk mengilustrasikan cara mengimplementasikannya, meskipun implementasinya tidak terikat pada satu bahasa saja.

## Validasi Data Input dari Sumber Eksternal
Sumber eksternal seperti pengguna API pihak ketiga, atau database dapat menjadi titik masuk untuk berbagai serangan, terutama jika input yang diberikan tidak valid atau berbahaya. Serangan seperti SQL injection, cross-site scripting (XSS), dan command injection sering terjadi karena input yang tidak difilter dengan benar. Kita dapat menerapkan poin-poin berikut untuk mengatasinya:

### 1. Input Sanitation 
Setiap input dari sumber luar harus disanitasi. Sanitasi input adalah proses memastikan bahwa data yang diterima dari pengguna atau sumber eksternal dibersihkan dari karakter berbahaya sebelum digunakan dalam aplikasi, terutama ketika data digunakan untuk query SQL, perintah sistem, atau output ke browser. Misalnya, jika Anda menerima input string dari form, hindari memasukkan input tersebut langsung ke dalam query SQL tanpa sanitasi. Yang bisa Anda lakukan adalah menggunakan **prepared statements** untuk mencegah SQL Injection. Dengan prepared statements, input pengguna tidak diizinkan menjadi bagian dari perintah SQL, melainkan sebagai parameter yang aman. Misalnya, kita memiliki input untuk memeriksa *username* dan *password* pengguna untuk login dan sistem backend kita, daripada langsung menjalankan query berikut:

```javascript
// direct query with parameters
query := fmt.Sprintf("SELECT * FROM users WHERE username = '%s' AND password = '%s'", "john_doe", "12345")
rows, err := db.Query(query)
```

Lebih baik menggunakan prepared statements, di mana kita memastikan bahwa input pengguna tidak pernah dieksekusi sebagai bagian dari query SQL. Input dianggap sebagai nilai, bukan bagian dari perintah SQL seperti berikut:

```javascript
// prepared statement
stmt, err := db.Prepare("SELECT * FROM users WHERE username = ? AND password = ?")
if err != nil {
	log.Printf("Error while prepared statement: %v", err)
	return
}
defer stmt.Close()

// excecution prepared statement
username := "john_doe"
password := "12345"
rows, err := stmt.Query(username, password)
if err != nil {
	log.Printf("Error while run query: %v", err)
	return
}
defer rows.Close()
```

### 2. Validasi Tipe Data 
Validasi tipe data adalah proses memeriksa dan memastikan bahwa jenis data yang diterima sesuai dengan yang diharapkan sebelum diproses lebih lanjut. Ini penting untuk mencegah kesalahan dalam pemrosesan data dan juga mengurangi risiko keamanan, seperti SQL injection dan XSS. Misalnya, jika API mengharapkan format email, validasi bahwa input memang format email. Berikut adalah contoh melakukan proses validasi tipe data dalam Golang:

```javascript
func main() {
	input := "hello@world.com"

	// Use regex to validate email format
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,} $`)
	if !re.MatchString(input) {
		fmt.Println("Invalid email format.")
		return
	}

	fmt.Println("Valid email:", input)
}
```
Di sini, kita menggunakan regular expression untuk memvalidasi apakah input sesuai dengan format email yang benar.

### 3. Whitelist & Blacklist 
**Whitelist** dan **blacklist** adalah dua pendekatan yang digunakan untuk memvalidasi dan mengelola input pengguna dalam aplikasi. Keduanya memiliki tujuan untuk meningkatkan keamanan dan mencegah eksploitasi, tetapi cara kerjanya dan penerapannya berbeda.

#### - whitelist
Whitelisting adalah pendekatan di mana hanya data atau karakter tertentu yang **diizinkan** untuk diproses oleh aplikasi. Dalam konteks input pengguna, whitelist menentukan apa yang dianggap "aman" dan hanya memperbolehkan input yang memenuhi kriteria tersebut. Ini sering digunakan untuk memvalidasi data yang sangat spesifik. Contoh penggunaan:

```javascript

func isValidUsername(username string) bool {
    // using regex to check allowed characters 
    re := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
    return re.MatchString(username)
}

func main() {
    input := "user_name-123"
	if isValidUsername(input) {
		fmt.Println("Valid username:", input)
	} else {
		fmt.Println("Invalid username.")
	}
}
```

Dalam contoh di atas, penggunaan `regex ^[a-zA-Z0-9_-]+$` digunakan untuk membatasi karakter yang diizinkan dalam username. Hanya huruf, angka, _ (underscore), dan - (dash) yang diterima.

#### - Blacklist
Blacklisting adalah pendekatan di mana Anda menentukan data atau karakter tertentu yang **tidak diperbolehkan**. Dalam hal ini, semua input lain dianggap aman, kecuali yang ada dalam blacklist. Pendekatan ini sering digunakan ketika sulit memprediksi semua kemungkinan karakter yang aman. Contoh penggunaan:

```javascript
func isValidInput(input string) bool {
    // List not allowed characters
	blacklist := []string{"<", ">", "&"}

	for _, char := range blacklist {
		if strings.Contains(input, char) {
			return false
		}
	}
	return true
}

func main() {
	input := "hello & welcome"

	if isValidInput(input) {
		fmt.Println("Valid input:", input)
	} else {
		fmt.Println("Invalid input.")
	}
}

```
Di sini, kita menggunakan blacklist untuk memeriksa apakah input mengandung karakter yang tidak diinginkan. Jika ada, input dianggap tidak valid.

### 4. Pembatasan Input
Pembatasan Input adalah praktik membatasi jumlah data atau ukuran input yang dapat diterima dari pengguna dalam aplikasi. Tujuannya adalah untuk mencegah penggunaan resource yang berlebihan, meningkatkan performa aplikasi, dan melindungi dari potensi serangan, seperti Denial of Service (DoS) atau SQL injection. Berikut adalah contoh implementasinya:

```javascript
func validateUsername(username string) bool {
	if len(username) > 20 {
		return false // Username is too long username is too long
	}
	return true // username is valid
}

func main() {
	input := "ThisIsAReallyLongUsername"

	if validateUsername(input) {
		fmt.Println("Valid username:", input)
	} else {
		fmt.Println("Invalid username: username cannot exceed 20 characters.")
	}
}
```

Tentu saja, beberapa poin di atas dapat diterapkan ke bahasa pemrograman apa pun dan dapat digunakan menggunakan library yang tersedia secara luas sehingga proses validasi data lebih mudah daripada melakukan proses validasi manual seperti beberapa contoh di atas.

## Keamanan Data
Data sensitif seperti informasi pribadi atau kredensial harus selalu dilindungi, baik saat disimpan maupun saat ditransfer. Kita dapat menerapkan poin-poin berikut untuk mengatasinya:

### 1. Enkripsi Data 
Data sensitif seperti password atau informasi kartu kredit harus selalu dienkripsi. Enkripsi melibatkan proses mengubah data yang dapat dibaca (plaintext) menjadi bentuk yang tidak dapat dipahami (ciphertext) menggunakan algoritma enkripsi dan kunci enkripsi. Tujuan utama enkripsi adalah memastikan bahwa bahkan jika data jatuh ke tangan yang salah, data tersebut tidak dapat dibaca tanpa kunci yang tepat untuk mendekripsinya.

Gunakan algoritma enkripsi modern seperti **AES** dan hindari algoritma yang sudah usang seperti **MD5** atau SHA1.

### 2. Gunakan HTTPS 
Gunakan HTTPS (Hypertext Transfer Protocol Secure) untuk memastikan bahwa semua data yang ditransfer antara klien dan server dienkripsi dengan benar. HTTPS (Hypertext Transfer Protocol Secure) adalah versi aman dari HTTP, yang merupakan protokol yang digunakan untuk transfer data antara browser (klien) dan server.

HTTPS bekerja dengan menambahkan lapisan keamanan dengan menggunakan TLS (Transport Layer Security) atau SSL (Secure Sockets Layer) untuk mengenkripsi data yang dikirim melalui jaringan. Ini sangat penting dalam pengembangan backend karena mencegah pihak ketiga (seperti hacker) membaca atau memodifikasi data yang sedang dikirim antara klien dan server.

### 3. Tokenisasi & Masking 
Dalam kasus tertentu, tokenisasi atau masking dapat digunakan untuk mengurangi risiko pelanggaran data. **Tokenisasi** dan **Masking** adalah dua teknik keamanan data yang sering digunakan dalam aplikasi backend untuk melindungi data sensitif.

Tokenisasi adalah proses mengganti data sensitif (seperti nomor kartu kredit) dengan nilai yang tidak bermakna yang disebut "token." Data asli disimpan secara terpisah dan hanya dapat dikaitkan kembali ke token melalui sistem yang memiliki akses ke sistem yang mengelola token. Ini penting karena jika terjadi kebocoran data, tetapi data yang bocor hanya berupa token dan bukan data nyata, risiko serangan sangat berkurang karena token tidak memiliki nilai di luar konteks sistem. Misalnya, dalam pembayaran online, nomor kartu kredit dapat diganti dengan token sehingga data kartu tidak benar-benar perlu disimpan di server.

Masking data adalah proses menyembunyikan sebagian data sensitif sehingga hanya beberapa bagian yang terlihat. Ini sering digunakan dalam antarmuka pengguna atau laporan untuk mencegah informasi lengkap terekspos. Bagaimana cara kerjanya? masking data melindungi informasi sensitif ketika ditampilkan kepada pengguna yang tidak perlu mengetahui data lengkap. Bahkan jika data yang ditampilkan di UI atau log dicuri, data yang di-mask hanya menunjukkan informasi sebagian, sehingga risikonya lebih rendah. Contoh yang mungkin sering kita lihat adalah menyembunyikan sebagian nomor kartu kredit dalam tampilan seperti ini: `**** **** **** 1234`.

## Manajemen Error & Logging
Dalam membangun sistem, error akan selalu terjadi, tetapi cara kita menanganinya menentukan apakah aplikasi kita dapat bertahan tanpa menyebabkan kerusakan atau kehilangan data. Logging yang baik membantu melacak masalah dalam sistem produksi dan mendeteksi pola yang mencurigakan. Berikut adalah beberapa poin yang kita lakukan:

### 1. Menangani Error dengan Tepat 
Jangan hanya menangkap error tanpa mengambil tindakan atau memberikan informasi. Sebaiknya log error dan berikan fallback yang baik untuk menghindari crash total. Misalnya, jika koneksi ke database gagal, coba retry atau beralih ke mode read-only sementara.

### 2. Logging Granular 
Log peristiwa kritis seperti request API, kegagalan autentikasi, atau masalah koneksi database dengan tingkat detail yang cukup. Namun, ingat untuk menghindari mencatat informasi sensitif seperti password dalam log.

### 3. Pembagian Log 
Gunakan tingkat log yang berbeda seperti INFO, WARNING, dan ERROR untuk memisahkan berbagai jenis peristiwa. Log yang lebih granular memudahkan developer mendiagnosis masalah.

Untuk pembahasan yang lebih lengkap dan contoh **Manajemen Error & Logging** saya telah menulis artikel tentang ini di sini: [Observability - Why logging is important](https://rizkynotes.com/posts/observability-why-logging-its-important/) 

## Menghindari kesalahan dengan elegan
Crashing adalah respons yang terjadi ketika sistem menghadapi error yang tidak terduga. Namun, error dapat dihindari atau diminimalkan melalui penanganan yang lebih baik. Strategi di bawah ini dapat membantu kita menangani error dengan elegan untuk membuat sistem lebih tangguh.

### 1. Timeouts
Ketika aplikasi backend mengakses layanan eksternal atau menunggu resource seperti database, penting untuk menggunakan timeout. Timeout mencegah kode "terjebak" dalam keadaan menunggu yang tidak terbatas, sehingga menjaga performa aplikasi dan menghindari deadlock. Berikut adalah contoh implementasi timeout ketika mengakses layanan eksternal:

```javascript
client := http.Client{
	Timeout: 5 * time.Second,  // Set timeout 5 detik
}

resp, err := client.Get("https://example.com/api")
if err != nil {
	fmt.Println("Request failed:", err)
	return
}
defer resp.Body.Close()

fmt.Println("Response received:", resp.Status)
```

Dalam contoh ini, kita menetapkan timeout 5 detik untuk permintaan HTTP. Jika layanan tidak merespons dalam 5 detik, aplikasi tidak akan hang, dan kita dapat menangani error dengan mengumumkan kegagalan.

### 2. Pemeriksaan Keberadaan Resource
Sebelum mengakses resource lain seperti database, file atau API, selalu verifikasi keberadaan dan ketersediaannya. Ini mencegah aplikasi membuat permintaan ke resource yang mungkin tidak ada, yang menghemat waktu dan menghindari error yang tidak perlu. Berikut adalah contoh cara kita memeriksa:

```javascript
func main() {
    filePath := "./data.txt"
    _, err := os.Stat(filePath) // check status file

    if os.IsNotExist(err) {
        fmt.Printf("File %s not found.\n", filePath)
    } else {
        fmt.Printf("File %s is available.\n", filePath)
    }
}
```

### 3. Fallback
Ketika sistem melakukan proses tertentu, kita mungkin mendapatkan error. Misalnya, sistem kita mengirim OTP selama proses autentikasi. Ketika proses pengiriman OTP gagal atau mendapat error, kita dapat menggunakan mekanisme fallback atau metode cadangan, seperti mengalihkan pengiriman OTP ke provider cadangan kita.

Dengan mengimplementasikan strategi di atas, kita dapat mengurangi frekuensi error yang menyebabkan crash, menjaga performa aplikasi, dan meningkatkan pengalaman pengguna secara keseluruhan.

## Desain API yang Aman dan Solid
Kita dapat melihat bahwa API berfungsi sebagai tulang punggung untuk aplikasi atau web yang memerlukan resource data dinamis. Namun, karena dianggap sebagai tulang punggung yang sangat kritis, API sering menjadi target utama serangan, sehingga penting untuk memastikan API yang aman dan sulit dieksploitasi.

### 1. Autentikasi & Otorisasi 
Gunakan autentikasi yang kuat (seperti OAuth atau JWT) untuk memastikan bahwa hanya pengguna atau sistem yang berwenang yang dapat mengakses API kita. Implementasikan kontrol akses granular untuk membatasi hak akses klien yang mengakses API yang kita miliki. Ini dapat mencegah klien dengan niat jahat mengakses resource yang kita miliki.

### 2. Rate Limiting dan Throttling
Rate Limiting dan Throttling sangat penting untuk mengontrol penggunaan API dan mencegah penyalahgunaan atau kelebihan beban. Penerapan rate limiting juga untuk mencegah serangan seperti DDoS atau eksploitasi berlebihan terhadap API oleh pengguna atau bot, dan juga untuk menjaga stabilitas dan ketersediaan API untuk semua pengguna. Rate Limiting bekerja dengan mengatur volume permintaan dari klien API dalam interval yang ditetapkan, memastikan akses yang adil dan merata ke resource yang kita miliki.

## Penggunaan Resource yang Efisien
Sistem backend sering harus mengelola berbagai resource seperti koneksi database, file, atau memori. Manajemen resource yang efisien sangat penting untuk menjaga stabilitas dan performa aplikasi. Dengan menangani resource secara bijak, kita dapat menghindari masalah seperti "resource leaks" dan kegagalan sistem. Berikut adalah beberapa strategi yang dapat digunakan untuk penggunaan resource yang efisien:

### 1. Connection Pooling 
Connection Pooling adalah teknik di mana sejumlah koneksi ke layanan seperti database didaur ulang daripada membuat koneksi baru setiap kali aplikasi memerlukan akses. Dengan connection pooling, aplikasi tidak perlu membuat koneksi baru yang mahal setiap kali ada permintaan, tetapi menggunakan koneksi yang sudah ada dalam "pool".

Mengapa connection pooling penting?, Setiap koneksi ke database atau layanan lain memiliki overhead dalam hal waktu dan memori. Terus membuka dan menutup koneksi dapat menguras resource sistem. Dengan mendaur ulang koneksi yang ada, aplikasi dapat merespons lebih cepat dan mengurangi beban pada layanan eksternal seperti database.

Untuk pembahasan yang lebih lengkap, saya telah menulis artikel tentang ini di sini: [Connection Pool in Backend Development Basic Concept Benefits and Implementation](https://rizkynotes.com/posts/connection-pool-in-backend-development-basic-concept-benefits-and-implementation/) 

### 2. Manajemen File & Memori 
Ketika berurusan dengan file atau alokasi memori, penting untuk memastikan bahwa resource dilepaskan setelah selesai digunakan. Jika tidak, bisa menyebabkan kebocoran resource yang mengakibatkan aplikasi kehabisan memori atau file handle.

Misalnya, dalam Golang kita dapat menggunakan fungsi built-in **defer** untuk memastikan file, koneksi, atau resource lainnya selalu dilepaskan setelah selesai menggunakannya. Kemudian juga memeriksa error (error handling) saat bekerja dengan resource, sehingga jika terjadi masalah, resource masih dapat dilepaskan dengan benar.

Berikut adalah sedikit cuplikan kode bagaimana kita menggunakan defer untuk mematikan operasi dan menutupnya setelah fungsi selesai melakukan proses:

```javascript
func main() {
    // open file process
    file, err := os.Open("example.txt")
    if err != nil {
        fmt.Println("Error opening file:", err)
        return
    }

    // Make sure the file is closed when finishedinished
    defer file.Close()

    // Process file...
}
```
Dengan menggunakan defer, kita memastikan bahwa file akan ditutup segera setelah fungsi keluar, baik berhasil maupun terjadi error. Ini membantu mencegah kebocoran file handle yang dapat terjadi jika lupa menutup file.

### 3. Operasi Asinkron 
Dalam situasi di mana aplikasi melakukan tugas berat atau operasi I/O yang lambat (seperti mengakses file besar, atau memanggil API eksternal), menjalankannya **Secara Asinkron** adalah cara yang efisien untuk menghindari pemblokiran aplikasi. Di mana aplikasi yang melakukan operasi sinkron dapat terhambat saat menunggu tugas berat selesai, yang akan mempengaruhi performa keseluruhan. Jadi penggunaan proses asinkron terkadang penting karena memungkinkan aplikasi melanjutkan tugas lain sambil menunggu tugas I/O atau jaringan selesai.

Katakanlah kita memiliki kasus di mana kita membersihkan cache Redis setelah input data. Proses penghapusan cache dapat dijalankan secara asinkron agar tidak memperlambat proses utama. Ini berarti aplikasi tidak perlu menunggu Redis merespons sebelum melanjutkan eksekusi kode berikutnya. Akibatnya, aplikasi tetap responsif dan efisien.

# Kesimpulan
Sebagai backend developer, defensive programming adalah pendekatan penting untuk memastikan bahwa aplikasi yang kita bangun dapat menangani error, input tidak valid, dan ancaman eksternal dengan baik. Dengan mempraktikkan teknik-teknik di atas, kita dapat memastikan bahwa aplikasi backend yang kita bangun lebih aman, stabil dan tangguh dalam menghadapi berbagai situasi yang tidak terduga. Defensive programming membantu kita menciptakan sistem yang tidak hanya berfungsi dengan baik, tetapi juga mampu bertahan dalam kondisi terburuk.

Tentu saja, mungkin ada banyak poin penting lainnya yang tidak dibahas di atas, Anda dapat menambahkan atau memberikan saran di kolom komentar di atas.

Semoga bermanfaat 👋.

# Referensi
- [The Code Knight: Mastering the Craft of Defensive Programming](https://www.conquer-your-risk.com/2023/07/20/the-code-knight-mastering-the-craft-of-defensive-programming/)
- [Defensive Programming in C#: Best Practices and Examples
](https://medium.com/c-sharp-programming/defensive-programming-in-c-best-practices-and-examples-f1edeb676e97)
- [The Art of Defensive Programming](https://medium.com/@arumukherjee121/the-art-of-defensive-programming-62c6f22b2758)



