---
title: "Deploy Aplikasi React Js Ke Vercel Dari Github"
date: 2022-03-08T06:31:39+07:00
author: "Rizky Darmawan"
tags: ["Node Js", "Next JS", "Vercel", "deploy"]
cover:
  image: "/images/deploy-vercel/vercel.png"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

Terkadang kita ingin menunjukkan hasil karya kita atau project kita ke publik agar bisa lihat oleh orang banyak.

Kali ini kita akan menggunakan penyedia layanan hosting **Vercel** untuk mempublikasikan aplikasi React Js yang sudah kita push ke **Github**.

Kenapa harus dengan **github** ?

Ini adalah cara agar source code kita bisa aman disimpan di github dan ketika ingin pindah layanan hosting kita hanya perlu koneksikan github ke hosting lain.

## Persiapan

Sebelum kita lanjut kamu harus punya:

- Source Code React Js yang sudah di push ke **github**.
- Akun vercel, jika belum ada silahkan daftar dulu ya. Saran saya login dengan akun github agar semua repository langsung terbaca.

## Buat Project Baru

Setelah berhasil login, kita akan masuk ke halaman dashboard vercel.

Lalu, klik button **Create New Project**.

![Dashboard vercel](/images/deploy-vercel/vercel-1.png "Dashboard vercel")

## Import Repository

Pada halaman selanjutnya **pilih dan import** repository dari github yang akan dilakukan deploy ke vercel.

![Import respository](/images/deploy-vercel/vercel-2.png "Import respository")

## Deploy

Pada halaman selanjutnya, kita bisa beberapa merubah konfigurasi. Saran saya ikutin saja konfigurasi default dan ganti **project name** jika butuh.

Dan klik button **Deploy**.
![Deploy](/images/deploy-vercel/vercel-3.png "Deploy")

## Proses Deploy

Lalu proses deploy akan berjalan, disini tinggal menunggu sampai proses selesai.

> **Catatan:** Pada saat proses deploy silahkan perhatikan pada bagian **Building**. Disini menunjukan proses deploy berjalan, dan jika terjadi error akan ditampilkan pada bagian ini.

![Proses Deploy](/images/deploy-vercel/vercel-4.png "Proses Deploy")

Jika mendapatkan halaman seperti ini .

![Proses deploy success](/images/deploy-vercel/vercel-5.png "Proses deploy success")

Selamat sekarang aplikasi react js kamu sudah berhasil di publish.

Langkah terakhir silahkan klik pada button **Go to Dashboard**.

Dan akan diarahkan ke halaman **Overview** project yang sudah berhasil dideploy.

Langsung klik pada button **Visit**.
![Page overview project](/images/deploy-vercel/vercel-6.png "Page overview project")

Dan akan diredirect ke halaman web kita.
![Web redirect](/images/deploy-vercel/vercel-7.png "Web redirect")

Akhirnya kita tahu cara untuk deploy aplikasi **React Js** dengan **vercel** dan bisa kita tunjukkan hasil karya kita ke publik.

Semoga artikel kali ini dapat membantu.
