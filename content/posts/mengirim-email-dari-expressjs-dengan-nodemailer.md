---
title: "Mengirim Email Dari Expressjs Dengan Nodemailer"
date: 2022-02-15T06:11:57+07:00
author: "Rizky Darmawan"
tags: ["node js", "express js"]
cover:
  image: "/images/expressjs-nodemailer/email.png"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

Kita selalu mendapatkan email setiap harinya.

Contohnya aplikasi ecommerce yang selalu mengingatkan barang yang ada dikeranjang untuk segera dilakukan checkout.

Tapi coba kita berpikir sebentar, apakah ada seseorang yang mengirimkan email itu satu per satu kepada setiap ribuan user ?.

Jika iya, ini adalah pekerjaan yang melelahkan.

Tapi biasanya hal ini bisa ditangain oleh sebuah aplikasi.

Selain contoh kasus mengirim email pada ecommerce diatas, cara mengirim email dengan aplikasi ini bisa juga digunakan untuk beberapa kasus yaitu:

- Verifikasi akun.
- Notifikasi pada aplikasi.
- Reset password.
- Dan banyak lagi kebutuhan lainnya.

Mari kita bahas!

Pada tutorial kali ini kita akan mencoba mengirim email dengan menggunakan framework nodejs yaitu **_express js_** dan package **_nodemailer_** untuk mengirim email.

## Persiapan

Mari buat sebuah project **_express js_** baru.

```javascript
express email
```

> **Catatan:** Disini kita menggunakan tools _express-generator_ untuk mengenerate project baru express js. Jika belum ada silahkan install pada link [express-generator](https://expressjs.com/en/starter/generator.html)

## Install nodemailer

Ketikan syntax dibawah ini untuk menginstall nodemailer.

```javascript
npm install nodemailer
```

## .env File

Sebelum kita lanjut ke langkah mengirim email, kita membutuhkan file **.env** dimana informasi konfigurasi aplikasi kita akan diletakkan disini agar aman dan rapi.

Dimana nantinya kita tidak akan langsung menulis **informasi** penting seperti **alamat host email**, **password** dan yang lainnya langsung didalam syntax kode.

Tapi kita akan menulisnya di file **.env** ini.

Ketika kita nantinya menggunakan menggunakan repository github contohnya. File **.env** ini bisa di ignore agar tidak ikut terupload. Jadinya aplikasi kita jadi lebih aman karena informasi tidak bebas diakses oleh siapapun.

Agar file **.env** dapat dibaca oleh **express js** kita membutukan package modul **dotenv**.

Silahkan ketikkan syntax ini untuk menginstall module **dotenv**.

```javascript
npm install dotenv
```

langkah selanjutnya buat sebuah file dengan nama 📝 **.env**, dan kita isi dengan beberapa informasi yang kita butuhkan nantinya.

```javascript
SERVICE=gmail
EMAIL=alamat-email@gmail.com
PASSWORD=password-email
```

> Silahkan ubah alamat email dan password dengan email yang nantinya akan digunakan untuk mengirim email.

## Membuat File Controller

Pada root folder project kita buat sebuah folder dengan nama 📂 **controller** dan buat sebuah file didalamnya dengan nama 📝 **SendEmail.js**. Dan kemudian isi dengan syntax kode berikut:

```javascript
const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = {
  sendEmail: async (req, res) => {
    try {
      let transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      let mailOptions = {
        from: process.env.EMAIL,
        to: "email-tujuan@gmail.com",
        subject: "Email dari express js!",
        text: "Yey!, email berhasil dikirim.",
      };

      await transporter.sendMail(mailOptions);

      return res
        .status(201)
        .json({ status: "SUCCESS", message: "Email berhasil dikirim." });
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err });
    }
  },
};
```

#### Penjelasan

Pertama, kita Import modul **nodemailer**. Kita membutuhkan modul ini untuk digunakan mengirim email pada **express js**:

```javascript
const nodemailer = require("nodemailer");
```

Kedua, kita juga mengimport modul **dotenv**. Kita membutuhkannya untuk membaca syntax informasi didalam file **.env** yang telah kita buat diatas.

```javascript
require("dotenv").config();
```

Ketiga, kita membuat sebuah object dengan nama **transporter**:

```javascript
let transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
```

Objek ini nantinya akan bertugas mengirim email.
Perhatikan syntax parameter:

```javascript
process.env.SERVICE;
process.env.EMAIL;
process.env.PASSWORD;
```

Syntax ini kita ambil dari file **.env** dengan menggunakan modul **dotenv**.

Jadi segala konfigurasi aplikasi yang kita punya terpusat didalam satu file dan ketika ingin merubah kita hanya menuju satu file saja yaitu **.env**.

Dan parameter diatas bisa digunakan dimana saja dan berulang - ulang.

Sebuah solusikan 🤝.

Keempat, membuat object dengan nama **mailOptions**

```javascript
let mailOptions = {
  from: process.env.EMAIL,
  to: "email-tujuan@gmail.com",
  subject: "Email dari express js!",
  text: "Yey!, email berhasil dikirim.",
};
```

Object ini akan menampung data email yang akan kita kirim.

Seperti alamat email pengirim, alamat email tujuan (Bisa juga dimasukkan ke file **.env**), subject, dan text.

> Jangan lupa untuk mengisikan alamat email tujuan pada property **to:**

Kelima, kita kirim emailnya menggunakan fungsi **sendEmail**. Dan melampirkan parameter dari Object **mailOptions** diatas didalamnya.

```javascript
await transporter.sendMail(mailOptions);
```

Terakhir, kita mengembalikkan respon ketika proses pengiriman email berhasil

```javascript
return res
  .status(201)
  .json({ status: "SUCCESS", message: "Email berhasil dikirim." });
```

Coba perhatikan disini kita menggunakan block code **try and catch**.

Dimana pada block **try** kita telah menulis syntax code untuk dijalankan mengirim email ketika berhasil kita kirim responnya untuk ditangkap oleh client.

Disini kita juga harus handle response jika terjadi error.

Dan kita menulisnya pada block code **catch**.

```javascript
catch (err) {
    return res.status(500).json({ status: "ERROR", message: err });
}
```

## Membuat File Routes

Agar aplikasi kita dapat dipanggil oleh client, kita harus membuat sebuah file routes.

Dimana fungsi routes akan menjalankan function pada controller ketika endpointnya di akses oleh client.

Pada root folder project kita sudah ada sebuah folder dengan nama 📂 routes dan buat sebuah file didalamnya dengan nama 📝 SendEmail.js. Dan kemudian isi dengan syntax kode berikut:

```javascript
const express = require("express");
let router = express.Router();

const sendEmailController = require("../controller/sendEmail");

router.get("/send-email", sendEmailController.sendEmail);

module.exports = router;
```

### Penjelasan

Pertama, kita import dulu modul **express**.

```javascript
const express = require("express");
let router = express.Router();
```

Kita menggunakan sebuah function **Router** bawaan dari modul **express** yang disimpan daral variable **router**.

Nantinya digunakan menghandle endpoint yang akan diakses oleh client.

Kedua, kita mengimport controller **sendEmail.js** yang sudah kita buat tadi untuk digunakan didalam function **router**.

```javascript
const sendEmailController = require("../controller/sendEmail");
```

Keempat, kita menggunakan function router.

```javascript
router.get("/send-email", sendEmailController.sendEmail);
```

Disini kita menggunakan method **get**.

Pada function router, ada 2 parameter yang kita isi. Yaitu:

1. **"/send-email"** adalah alamat endpoint yang nantinya akan dipanggil oleh client.
2. **sendEmailController.sendEmail** menggunakan controller yang telah kita import diatas, dan mengarahkan ke functon **sendEmail**.

Kelima, kita export agar dapat digunakan diluar.

```javascript
module.exports = router;
```

### Mendaftarkan routes

Setelah kita membuat routes, kita harus mendaftarkannya pada file **app.js** agar bisa digunakan dari luar aplikasi.

Pertama, Buka file **app.js**, cari syntax code berikut:

```javascript
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
```

Dan import sytax code ini dibawahnya:

```javascript
var emailRouter = require("./routes/sendEmail");
```

Kedua, setelah kita import, kita juga harus memberitahukan aplikasi kita untuk menggunakan router yang telah kita import.

Cari syntax code berikut:

```javascript
app.use("/", indexRouter);
app.use("/users", usersRouter);
```

Dan tambahkan syntax code ini dibawahnya:

```javascript
app.use("/api", emailRouter);
```

Pada function diatas, ada 2 parameter yang kita isi yaitu:

1. **"/api"**, ini adalah sebuah prefix, dimana gunanya ketika nanti kita mengakses router harus menyertakan prefix ini.
2. **emailRouter** nama variable yang digunakan untuk import router.

## Jalankan Aplikasi

Sebelum kita menjalankan aplikasi yang telah kita buat, install dulu **nodemon**.

Dimana **nodemon** sangat berguna ketika pada saat proses development kita merubah sebuah syntax code.

Aplikasi akan otomatis direstart ketika kita melakukan save untuk mendapatkan perubahan kode yang terbaru.

Ketik code ini diterminal.

```javascript
npm install nodemon
```

Setelah nodemon berhasil terinstall, buka pada file **package.json**, pada bagian script.

Rubah yang tadinya aplikasi default dijalankan oleh **node** rubah menggunakan **nodemon**.

```javascript
 "scripts": {
    "start": "nodemon ./bin/www" // <-- rubah menjadi seperi ini
  },
```

Dan saatnya jalankan aplikasi, ketikan code ini diterminal.

```javascript
npm run start
```

Secara default **express js** berjalan pada port 3000.

> Disini untuk melakukan pengetesan kita menggunakan sebuah aplikasi [Postman](https://www.postman.com/).

Buka postman, dan akses url ini.

```javascript
http://localhost:3000/
```

Jika mendapat response halaman **welcome to Express**. Artinya aplikasi kita berhasil running.

![Success response postman](/images/expressjs-nodemailer/email-1.png "Success response postman")

## Kirim Email

Pada aplikasi postman, akses endpoint.

```javascript
http://localhost:3000/api/send-email
```

Jika pada postman mendapat respon seperti ini :

![Success send email postman](/images/expressjs-nodemailer/email-2.png "Success send email postman")

Selamat email berhasil dikirim.

Sekarang coba cek pada email tujuan. Dan email sudah berhasil masuk.

![Mailbox](/images/expressjs-nodemailer/email-3.png "Mailbox")

## Tips

Disini host email yang kita gunakan adalah dengan **gmail**.

Jika pada saat proses mengirim email terdapat respon error seperti ini :

![Gmail secure apps](/images/expressjs-nodemailer/email-4.png "Gmail secure apps ")

Ini adalah respon dari fitur keamanan google ketika kita mencoba memakai akun mereka pada aplikasi pihak lain.

Cara mengatasinya :

1. Search pada google dengan kata kunci **less secure apps**.
2. Dan akses pada link seperti gambar
   ![Gmail secure apps 2](/images/expressjs-nodemailer/email-5.png "Gmail secure apps 2")
3. Dan jika status akses aplikasi masih **NONAKTIF** silahkan rubah menjadi **AKTIF**.
   ![Gmail secure apps 3](/images/expressjs-nodemailer/email-6.png "Gmail secure apps 3 ")
4. Selesai, sekarang coba kirim email lagi.

## Mengirim email ke banyak orang

Kita tidak hanya bisa mengirim email hanya ke 1 email tujuan saja.

Tetapi kita bisa mengirim email ke banyak email tujuan.

Caranya, pada file **.env** tambahkan satu propety baru dengan nama **EMAIL_DESTINATION**, dan masukkan beberapa alamat email.

Antara alamat email yang 1 dan yang lain dipisahkan dengan tanda **,(koma)** :

```javascript
EMAIL_DESTINATION=destination1@gmail.com, destination2@gmail.com
```

Pada file controller diatas, tepatnya pada bagian object **mailOptions**, kita menambahkan alamat email tujuan secara manual.

Sekarang kita rubah dengan cara memanggil property pada file **.env** yang baru saja kita buat.

```javascript
let mailOptions = {
  from: process.env.EMAIL,
  to: process.env.EMAIL_DESTINATION, // <-- ganti jadi seperti ini
  subject: "Email dari express js!",
  text: "Yey!, email berhasil dikirim.",
};
```

Sekarang, silahkan coba kembali pada aplikasi postman dengan mengakses endpoint untuk mengirim email.

Dan cek pada masing - masing email tujuan.

## Mengirim lampiran

Kita juga dapat mengirim email beserta melampirkan file didalamnya.

Pertama, sebagai contoh buat sebuah file pada root folder dengan nama **file.txt**, dan isi dengan kata kata. Sebagai contoh kita isi:

```javascript
Lampiran dari node js.
```

Kedua, pada file controller kita import sebuah fungsi bawaan dari **nodejs** untuk membaca direktori file kita.

Dibawah syntax code ini:

```javascript
require("dotenv").config();
```

Tambahkan syntax code ini:

```javascript
let path = require("path");
```

Ketiga, terakhir kita tambahkan property **attachments**, pada object **mailOptions**.

```javascript
attachments: [
    {
      filename: "text1.txt", // <-- Nama file
      path: path.join(__dirname, "../file.txt"), // Lokasi file
    },
  ],
```

Sekarang object **mailOptions** menjadi seperti ini:

```javascript
let mailOptions = {
  from: process.env.EMAIL,
  to: process.env.EMAIL_DESTINATION,
  subject: "Email dari express js!",
  text: "Yey!, email berhasil dikirim.",
  attachments: [
    {
      filename: "text1.txt",
      path: path.join(__dirname, "../file.txt"),
    },
  ],
};
```

Sekarang, silahkan coba kembali pada aplikasi postman dengan mengakses endpoint untuk mengirim email.

Dan lihat file attachment yang kita lampirkan berhasil dikirim.

![Attachment file](/images/expressjs-nodemailer/email-7.png "Attachment file")

## Bonus Menggunakan template

Kali ini kita akan mencoba mengirim email, tetapi menggunakan template **html** dengan bantuan package yaitu **Handlebars**.

Pertama, install package **Handlebars**.

```javascript
npm install nodemailer-express-handlebars
```

Kedua, pada root project buat folder dengan nama 📂**template-mail** dan buat sebuah file didalamnya dengan nama 📝**email.handlebars** dan isi dengan:

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Email From Express Js</title>

    <style>
      h1 {
        color: red;
      }
    </style>
  </head>
  <body>
    <!-- Parsing data dari controller property context -->
    <h1>{{title}}</h1>
    <p>{{text}}</p>
  </body>
</html>
```

Syntax code diatas adalah code HTML yang nantinya akan kita gunakan sebagai template untuk mengirim email dari **Express Js**.

Dan kita simpan dengan extension **.handlebars**.

Didalam template kita juga bisa menambahkan CSS untuk memanipulasi tag **html**.

```html
<style>
  h1 {
    color: red;
  }
</style>
```

Perhatikan juga syntax code ini:

```html
<h1>{{title}}</h1>
<p>{{text}}</p>
```

Syntax code ini berguna untuk menerima parsing data yang akan dikirim dari controller.

Ketiga, didalam controller kita import handlebars:

```javascript
const hbs = require("nodemailer-express-handlebars");
```

Keempat, dibawah object **transporter**, buat sebuah object dengan nama **handlebarsOptions**:

```javascript
const handlebarsOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve("./template-mail/"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./template-mail/"),
  extName: ".handlebars",
};
```

Kelima, daftarkan template pada object **transporter**.

```javascript
transporter.use("compile", hbs(handlebarsOptions));
```

Keenam, gunakan template pada object **mailOptions**.

Dengan cara ganti property **text** menjadi **template** dan berikan nilai nama template yang sudah kita buat diatas.

```javascript
let mailOptions = {
  from: process.env.EMAIL,
  to: process.env.EMAIL_DESTINATION,
  subject: "Email dari express js!",
  template: "email", // <-- Ganti text dengan template
  // Context parse data to template
  context: {
    title: "Email With Nodemailer",
    text: "Yey!, email berhasil dikirim dengan template.",
  },
  // Attachement
  attachments: [
    {
      filename: "text1.txt", // <-- file name
      path: path.join(__dirname, "../file.txt"), // file location
    },
  ],
};
```

Dan perhatikan kita juga mengirim data ke template dengan syntax code ini:

```javascript
  context: {
    title: "Email With Nodemailer",
    text: "Yey!, email berhasil dikirim dengan template.",
  },
```

Sekarang didalam controller seluruh syntax code menjadi seperti ini:

```javascript
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
require("dotenv").config();
let path = require("path");

module.exports = {
  sendEmail: async (req, res) => {
    try {
      let transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const handlebarsOptions = {
        viewEngine: {
          extName: ".handlebars",
          partialsDir: path.resolve("./template-mail/"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./template-mail/"),
        extName: ".handlebars",
      };

      transporter.use("compile", hbs(handlebarsOptions));

      let mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL_DESTINATION,
        subject: "Email dari express js!",
        template: "email",
        context: {
          title: "Email With Nodemailer",
          text: "Yey!, email berhasil dikirim dengan template.",
        },
        attachments: [
          {
            filename: "text1.txt",
            path: path.join(__dirname, "../file.txt"),
          },
        ],
      };

      await transporter.sendMail(mailOptions);

      return res
        .status(201)
        .json({ status: "SUCCESS", message: "Email berhasil dikirim." });
    } catch (err) {
      return res.status(500).json({ status: "ERROR", message: err });
    }
  },
};
```

### Handle Array Object Data

Nantinya kita juga akan menghandle suatu data array yang berisi object untuk ditampilkan didalam template.

Mari kita coba.

Pertama, pada controller diatas object **mailOptions**, buat sebuah sampel data array yang berisi object:

```javascript
let persons = [
  {
    name: "Rizky Darmawan",
    age: 25,
  },
  {
    name: "Dwi Aprilia",
    age: 24,
  },
];
```

Kedua, parse data ke template. Karena disini tipe datanya adalah array kita harus melakukan looping untuk mengirim semua data kedalam template.

Tambahkan property **person** didalam **context** dan lakukan perulangan.

```javascript
 context: {
      title: "Email With Nodemailer",
      text: "Yey!, email berhasil dikirim dengan template.",
      person: persons.map((item) => item), // <-- tambahkan property ini.
    },
```

Ketiga, kita tangkap data yang dikirim dari controller pada template **email.handlebars**.

Disini agar rapi kita masukkan kedalam tag table.

```html
<table>
  <thead>
    <tr>
      <th>Nama</th>
      <th>Umur</th>
    </tr>
  </thead>
  <tbody>
    {{#each person}}
    <tr>
      <th>{{name}}</th>
      <th>{{age}}</th>
    </tr>
    {{/each}}
  </tbody>
</table>
```

perhatikan pada syntax code :

```html
{{#each person}}
<tr>
  <th>{{name}}</th>
  <th>{{age}}</th>
</tr>
{{/each}}
```

Disini kita melakukan perulangan dengan menggunakan helper **each** milik package **handlebars**.

Keempat, agar rapi tag table kita berikan css:

```css
    <style>
      h1 { color: red; }
      table, th, td { border: 1px solid; } /* <-- tambahkan css untuk table*/
    </style>
```

Jadi keseluruhan sytax code template menjadi:

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Email From Express Js</title>

    <style>
      h1 {
        color: red;
      }
      table,
      th,
      td {
        border: 1px solid;
      }
    </style>
  </head>
  <body>
    {{!
    <!-- Parsing data dari controller property context -->
    }}
    <h1>{{title}}</h1>
    <p>{{text}}</p>
    <table>
      <thead>
        <tr>
          <th>Nama</th>
          <th>Umur</th>
        </tr>
      </thead>
      <tbody>
        {{#each person}}
        <tr>
          <th>{{name}}</th>
          <th>{{age}}</th>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </body>
</html>
```

Sekarang saatnya kita tes lagi kirim email.

Dan cek pada kotak masuk email, hasilnya akan seperti ini.

![Array data](/images/expressjs-nodemailer/email-8.png "Array data")

Akhirnya kita tahu cara mengirim email menggunakan aplikasi.

Salah satunya contoh dengan **Express Js** dan dibantu dengan package **Nodemailer** seperti cara diatas yang sudah kita coba.

Semoga artikel kali ini dapat membantu.
