---
title: "Cara Deploy Aplikasi Golang Dan Database Mysql Ke Heroku"
date: 2022-05-10T15:06:39+07:00
author: "Rizky Darmawan"
tags: ["go", "golang", "mysql", "heroku", "deploy"]
cover:
  image: "/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-1.png"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

Ketika membangun sebuah Aplikasi, pastinya kita ingin untuk melakukan publishing aplikasi kita agar bisa diakses oleh publik.

Dengan berbagai tujuan, misalnya ingin melakukan testing, mendapat feedback orang lain, atau juga menunjukkan hasil kerja kepada client.

Untuk memenuhi kebutuhan diatas, kali ini kita akan melakukan proses deployment aplikasi **Go (Golang)** dan menggunakan database **MySQL** sebagai penyimpanan datanya ke **Heroku**.

# 1. Apa itu Heroku ?

**Heroku** adalah sebuah layanan berbasis **Cloud Computing** yang menyediakan _Platform as a Service (Paas)_ yang dimana memungkinkan untuk menjalankan, membangun, dan mengoperasikan aplikasi yang sudah kita bangun agar siap digunakan tanpa perlu banyak kerumitan.

# 2. Project Go (Golang)

Diatas dijelaskan kita akan melakukan proses deployment aplikasi **Go (Golang)**.

Dalam artikel ini kita menggunakan sebuah aplikasi _RESTApi_ yang sudah saya siapkan.

Aplikasi ini cukup sederhana, hanya melakukan proses _Create, Read, Update, Delete_ pada table **Category**.

Kamu bisa melihat aplikasinya pada repository dengan link [https://github.com/letenk/go-crud-restful-api](https://github.com/letenk/go-crud-restful-api)

# 3. Clone Project

Sekarang kita akan melakukan proses _clone_ project aplikasi ke lokal komputer milik kita.

Ketikkan perintah kode ini pada terminal:

```javascript
git clone git@github.com:jabutech/go-crud-restful-api.git
```

Perintah diatas akan melakukan _cloning_ atau meng-_copy_ sebuah folder project aplikasi dari repository **github** ke dalam lokal komputer milik kita.

Sekarang pastikan, sudah ada folder project dengan nama **go-crud-restful-api**.

Silahkan buka folder project pada **text editor**.

# 4. Procfile

Pada project aplikasi buat sebuah file dengan nama **procfile** dan isi dengan:

```php
web: bin/go-crud-restful-api
```

**procfile** berfungsi untuk memberitahukan heroku command apa yang harus dijalankan pertama kali ketika aplikasi dijalankan.

# 5. Deploy Ke Heroku

## 5.1 Install Heroku CLI

Salah satu cara untuk melakukan proses deploy ke Heroku adalah dengan menggunakan **Heroku CLI**, cara ini yang akan kita gunakan.

Di artikel ini tidak akan dijelaskan cara untuk menginstall **Heroku CLI**.

Silahkan ikuti artikel yang sudah dibuat oleh Heroku sesuai OS kamu pada link [https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli)

Jika sudah berhasil menginstall **Heroku CLI**, coba ketik perintah kode ini untuk melihat versi **Heroku CLI**:

```php
heroku --version
```

Jika keluar tampilan seperti pada gambar dibawah ini, artinya **Heroku CLI** berhasil diinstall dikomputer lokal kita.

![heroku version](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-2.png)

## 5.2 Login Heroku

Selanjutnya kita diharuskan untuk login ke heroku.

Caranya ketik perintah kode ini diterminal:

```php
heroku login
```

Akan keluar perintah seperti digambar ini:
![heroku login](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-3.png)

Silahkan tekan apa pun pada keyboard, selain tombol **_q_**, dan kita akan diarahkan kehalaman web Heroku untuk melakukan proses login.

![halaman heroku login](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-4.png)

Pada halaman diatas silahkan klik tombol login lalu masukkan **email** dan **password**.

Jika berhasil, pada terminal kita akan mendapat info bahwa berhasil login dengan email yang kita masukkan.

Jika belum memiliki akun, silahkan lakukan proses register lalu ikuti kembali langkah diatas.

## 5.3 Create Aplikasi di Heroku

Setelah berhasil login, langkah selanjutnya adalah dengan cara membuat sebuah aplikasi baru di Heroku.

Ada 2 cara untuk melakukan proses membuat aplikasi di Heroku.

**Cara pertama,** membuat tanpa memberikan nama aplikasi. Yaitu nama aplikasinya akan dibuatkan secara acak oleh Heroku. Caranya ketik kode ini pada terminal:

```php
heroku create
```

**Cara kedua,** yaitu dengan cara memberikan nama aplikasi dengan yang kita inginkan. Disini saya akan memberikan dengan nama **jabutech-go**. Caranya ketik kode ini pada terminal:

```php
heroku create jabutech-go
```

Dan jika berhasil dan juga nama yang diinginkan dapat digunakan, kita akan mendapat pesan alamat url aplikasi dan repository di Heroku milik kita.

![heroku create](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-5.png)

## 5.4 Push Project

Sekarang saatnya kita untuk melakukan proses deploy ke Heroku.

Proses deploy cukup mudah dan sangat familiar apabila kita terbiasa menggunakan git.

Caranya cukup dengan mengetikkan kode ini:

```php
git push heroku master
```

Kode diatas akan melakukan proses **push** aplikasi project di komputer lokal kita ke Heroku dan akan menjalankan proses deploy secara otomatis diheroku.

Pada terminal kita juga dapat melihat histroy proses deploy berjalan.

Dan jika berhasil, kita dapat mengakses aplikasi kita dengan link url yang diberikan oleh Heroku pada saaat melakukan proses **Create app** diatas.

Contoh url milik saya adalah [https://jabutech-go.herokuapp.com/](https://jabutech-go.herokuapp.com/).

Jika mendapat tampilan response seperti ini:

```json
{
  "code": 200,
  "status": "OK",
  "data": "Server is Up."
}
```

Artinya aplikasi kita sudah berhasil di deploy ke Heroku.

# 6. ClearDB

Untuk menggunakan database **MySQL** pada Heroku, kita bisa menggunakan add-on **Clear DB**.

Add-on ini memberikan layanan gratis, tapi dengan beberapa batasan yang cukup hanya untuk melakukan demo sementara. Bisa dibaca pada link [https://elements.heroku.com/addons/cleardb](https://elements.heroku.com/addons/cleardb).

> **Catatan**: Untuk menggunakan beberapa add-on, salah satunya pada add-on ClearDB. Diharuskan untuk melakukan verifikasi kartu kredit. Mungkin bisa dicoba layanan milik **Jenius** (\*bukan promo 🙌 ).

## 6.1 Menggunakan ClearDB

Untuk menggunakan add-on **ClearDB** caranya ketikkan code ini diterminal:

```php
heroku addons:create cleardb:ignite
```

**Penjelasan**:

- **heroku** adalah perintah untuk menggunakan heroku.
- **addons:create** adalah perintah untuk membuat add-on.
- **cleardb:ignite**, **cleardb** adalah nama add-on yang akan digunakan, **ignite** adalah layanan gratis milik **cleardb** yang kita gunakan.

Jika berhasil kita akan mendapatkan info seperti gambar ini.

![cleardb create](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-6.png)

## 6.2 Informasi Kredensial ClearDB

### 6.2.1 Melihat informasi kredensial

Untuk melakukan konfigurasi **ClearDB** agar terhubung ke aplikasi kita yang ada di Heroku, langkah pertama adalah kita harus melihat informasi kredensial yaitu _username, password, host, dan nama database_ yang didapat.

Ketikkan kode ini diterminal:

```php
heroku config | grep CLEARDB_DATABASE_URL
```

Hasilnya kita akan mendapatkan informasi seperti ini:
![heroku create](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-7.png)

**Penjelasan**:

- **b442ef3f9715f3** adalah username.
- **0bd82b8c** adalah password.
- **us-cdbr-east-05.cleardb.net** adalah alamat host.
- **heroku_d008944cc73db30** adalah nama database.

### 6.2.2 Koneksi Ke Aplikasi Database Manager

Sekarang mari kita coba untuk mengakses database pada **ClearDB**. Disini saya mencoba dengan menggunakan sebuah aplikasi database manager **Table Plus**.

Dan ketika melakukan test, berhasil terhubung ke **ClearDB**.
![connect to cleardb](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-8.png)

### 6.2.3 Membuat Table Kategori

Sekarang kita coba untuk membuat sebuah table dengan nama **category**, yang nantinya akan digunakan oleh aplikasi yang kita deploy.

Disini saya menggunakan fitur **SQL** milik aplikasi database manager **Table Plus** untuk menuliskan kode untuk membuat tabel di **ClearDB**.

```sql
CREATE TABLE category(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(200) NOT NULL
)
```

Mari kita lihat apakah table berhasil dibuat dengan mengetikkan perintah:

```sql
SHOW TABLES;
```

![show table category in cleardb](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-9.png)

Hasilnya, yap kita berhasil membuat table **category**.

Dan jika kita lihat struktur tablenya, dengan perintah:

```sql
DESC category;
```

![show structure table category in cleardb](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-10.png)

Hasilnya sama seperti yang kita inginkan.

## 6.3 Variabel Kode

Aplikasi yang kita gunakan saat ini sebagai bahan contoh untuk melakukan proses deploy ke Heroku memerlukan sebuah variabel kode dengan nama **DATABASE_URL** untuk memberikan informasi kredensial database yaitu _username, password, host, dan nama database_ agar aplikasi dan database saling terhubung.

Disini kita akan membuat sebuah variable kode dan memberikan informasi kredensial yang didapat pada pembahasan bagian [Informasi Kredensial ClearDB](#informasi-kredensial-cleardb) diatas.

Dan nantinya kita akan me-Set sebuah variabel kode ke Heroku agar dapat terkoneksi ke add-on **ClearDB**.

### 6.3.1 Menyiapkan format variable

Mari kita siapkan format variable kodenya terlebih dahulu dengan format:

```javascript
username:password@tcp(host:3306)/database_name
```

Berikut contoh format yang sudah diberikan informasi kredensial diatas:

```javascript
b442ef3f9715f3:0bd82b8c@tcp(us-cdbr-east-05.cleardb.net:3306)/heroku_d008944cc73db30
```

### 6.3.2 Set Variabel Kode Ke Heroku

Untuk me-Set variabel kode ke heroku, ketikkan kode ini pada terminal:

```php
heroku config:set DATABASE_URL='b442ef3f9715f3:0bd82b8c@tcp(us-cdbr-east-05.cleardb.net:3306)/heroku_d008944cc73db30'
```

Sekarang kita lihat apakah variable kode dengan nama **DATABASE_URL** berhasil dibuat di heroku dengan mengetikkan code:

```sql
heroku config | grep DATABASE_URL
```

Hasilnya kita berhasil me-Set variable **DATABASE_URL** ke Heroku.
![environment database_url](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-11.png)

# 7. Testing CRUD

Langkah terakhir adalah pengetesan apakah aplikasi kita berhasil terhubung ke **ClearDB** untuk penyimpanan data pengganti **MySQL**.

Disini untuk melakukan pengetesan saya menggunakan aplikasi **Postman**.

## 7.1 Testing Create Data

Yang pertama akan kita lakukan pengetesan adalah membuat data baru.

1. Set method sebagai **POST**.

2. Pada **Postman** bagian **url** masukkan endpoint [https://jabutech-go.herokuapp.com/api/categories](https://jabutech-go.herokuapp.com/api/categories)

3. Disini juga kita menyisipkan sebuah **body** dengan property **name** yang akan dikirimkan ke aplikasi untuk dibuatkan datanya. lalu klik tombol **Send** untuk mengetes membuat data baru.

4. Jika berhasil, akan mendapat response **status OK**, beserta data yang berhasil kita buat.

![environment database_url](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-12.png)

## 7.2 Testing Get Data

Untuk melakukan pengetesan yang kedua adalah melihat data yang kita buat.

1. Set method sebagai **GET**.

2. Pada **Postman** bagian **url** masukkan endpoint [https://jabutech-go.herokuapp.com/api/categories](https://jabutech-go.herokuapp.com/api/categories)

3. Klik tombol **Send**.

4. Jika berhasil, akan mendapat response **status OK**, beserta data yang ada didalam database **ClearDB**.

![environment database_url](/images/cara-deploy-aplikasi-golang-dan-database-mysql-ke-heroku/heroku-13.png)

# 8. Penutup

Sekarang kita paham bagaimana untuk membuat aplikasi yang sudah kita bangun agar dapat di deploy dan dibagikan ke public.

Cara dengan menggunakan **Heroku** sebagai tempat untuk mendeploy aplikasi kita dan menggunakan add-on **ClearDB** sebagai tempat menyimpan database pengganti **MySQL**.

Dan semua yang didapat secara gratis, walaupun ada beberapa keterbatasan tetapi ini sudah sangat cukup jika hanya melakukan testing ataupun demo kepada public.

Semoga artikel kali ini dapat membantu.
