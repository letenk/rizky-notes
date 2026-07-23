---
title: "Cutting Deployment Time by 80% with GitHub Actions and Docker"
date: 2026-06-03T10:00:00+07:00
tags: ["github-actions", "docker", "ci-cd", "devops", "laravel"]
cover:
  image: "/images/cutting-deployment-time-by-80-percent-with-github-actions-and-docker/cover.webp"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---
##### Photo by <a href="https://unsplash.com/@bruno_kelzer?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Bruno Kelzer</a> on <a href="https://unsplash.com/photos/person-holding-green-and-gray-leaf-UZuNn5yjHpc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>


Beberapa waktu lalu saya sedang mengerjakan project untuk seorang client. Sehari-hari saya adalah backend engineer, tapi di project ini ternyata scope-nya meluas. Saya harus masuk ke ranah server juga. Client ingin memigrasikan aplikasi Laravel mereka dari **AWS Elastic Beanstalk** ke **AWS Lightsail**, dengan alasan ingin menekan biaya infrastruktur bulanan dan punya kontrol lebih penuh atas server.

Sebagai orang yang suka belajar, ini justru momen yang menarik. Selama ini saya nyaman di zona backend, sekarang kesempatan buat pegang hal-hal infrastruktur dan DevOps secara langsung.

Beanstalk sebelumnya sangat nyaman, semua proses deployment otomatis. Push kode, selesai. Tapi begitu pindah ke Lightsail, semuanya berubah. Tiba-tiba saya harus setup server dari nol, konfigurasi Docker, dan yang paling menyebalkan: **proses deployment yang serba manual**.

## Masalah: Deployment Manual yang Makan Waktu

Di setup awal Lightsail, setiap kali saya ingin deploy perubahan ke server, inilah ritual yang harus saya jalani:

1. Push commit ke GitHub
2. Buat tag release (`git tag -a v1.2.3 -m "release note" && git push origin v1.2.3`)
3. SSH ke server Lightsail
4. `git fetch --tags` dan `git checkout` tag yang baru
5. Jalankan `docker compose up -d --build`
6. Kalau ada perubahan database, masuk ke container dengan `docker exec` lalu jalankan `php artisan migrate --force` secara manual

Semua langkah di atas memakan waktu sekitar **2-3 menit**. Belum lagi kalau lagi buru-buru karena ada bug kritis di server yang butuh cepat di beresin, setiap detiknya terasa lambat.

Nah, yang paling mengganggu sebenarnya bukan durasinya, tapi **banyaknya langkah manual** yang rawan human error. Pernah suatu kali saya lupa menjalankan migrasi setelah deploy, dan langsung mendapatkan error karena kolom baru di database belum ada. Cukup memalukan akibat terburu-buru dan step yang terlalu banyak.

Jadi muncul pertanyaan: kenapa tidak saya otomatisasi saja semua ini? Sewaktu masih bekerja di startup dulu, tim infra sudah pernah menyiapkan pipeline seperti ini. Gimana kalau saya coba cari tahu dan bangun sendiri?

## Solusi: GitHub Actions Workflow

Karena kode sudah ada di GitHub dan server sudah pakai Docker, jawabannya cukup jelas: **GitHub Actions**. Dengan `workflow_dispatch`, kita bisa membuat workflow yang dipicu secara manual dari tab Actions di GitHub — lengkap dengan input parameter.

Mungkin kamu bertanya, kenapa tidak otomatis saja ketika ada commit atau merge ke branch `main`? Bukannya itu lebih praktis?

Nah, di sinilah pertimbangannya. Dengan trigger manual, ada beberapa keuntungan:

1. **Tidak ada perubahan mendadak di production**. Setiap deployment harus disengaja, bukan efek samping dari merge
2. **Semua orang di tim jadi aware** karena sebelum deploy, orang yang bersangkutan harus masuk ke tab Actions dan menjalankannya secara sadar
3. **Versioning wajib** — dengan input tag, kita diharuskan membuat versi untuk setiap deployment. Kalau ke depannya terjadi error atau hal yang tidak diinginkan, kita bisa langsung rollback ke tag sebelumnya

Oke, jadi konsepnya sederhana:

- Kita tetap push commit dan buat tag seperti biasa
- Buka tab **Actions** di repository GitHub
- Pilih workflow **Deploy Production**
- Masukkan tag yang ingin di-deploy
- Centang checkbox jika ingin menjalankan migrasi
- Klik **Run workflow**, dan... tinggal tunggu

Tidak perlu SSH, tidak perlu `docker exec`, tidak perlu takut lupa migrasi. Deployment yang tadinya makan 2-3 menit sekarang selesai dalam waktu rata-rata **40 detik** (itupun mostly nunggu build Docker).

![Durasi workflow Deploy Production di GitHub Actions](/images/cutting-deployment-time-by-80-percent-with-github-actions-and-docker/github-actions-duration.png)

Mari kita lihat bagaimana workflow ini dibangun.

## Membangun Workflow

Workflow kita simpan di `.github/workflows/deploy.yml`. Berikut struktur dasarnya:

```yaml
name: Deploy Production

on:
  workflow_dispatch:
    inputs:
      tag:
        description: "Git tag to deploy (example: v1.2.3)"
        required: true
        type: string
      run_migration:
        description: "Run database migration?"
        required: false
        type: boolean
        default: false
```

Dengan konfigurasi `workflow_dispatch` di atas, GitHub akan menampilkan form sederhana setiap kali kita ingin menjalankan workflow. Ada dua input:

1. **tag**, yaitu tag Git yang ingin di-deploy, wajib diisi
2. **run_migration**, yaitu checkbox untuk menjalankan migrasi database, opsional

Cukup jelas ya. Sekarang kita masuk ke bagian `jobs`.

### SSH ke Server

Langkah pertama adalah menyiapkan koneksi SSH ke server Lightsail menggunakan SSH key yang sudah kita simpan sebagai GitHub Secret:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
```

Di sini kita menyimpan private key ke file `id_ed25519` dengan permission `600` (hanya bisa dibaca oleh owner). Lalu kita tambahkan host key server ke `known_hosts` agar koneksi SSH tidak ditolak.

Perlu diingat, semua informasi sensitif seperti `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, dan `APP_PATH` disimpan sebagai **GitHub Secrets**, jangan pernah di-hardcode di workflow file.

### Checkout Tag dan Deploy

Setelah koneksi SSH siap, kita kirim perintah ke server untuk fetch tag, checkout, dan build Docker:

```yaml
      - name: Deploy to Server
        run: |
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} "export GITHUB_PAT='${{ secrets.CREDENTIAL_GITHUB_PAT }}' && bash -s" << 'EOF'
            set -e

            set +o history

            cd ${{ secrets.APP_PATH }}

            echo "Temporarily set Git remote with token"
            ORIGINAL_URL=$(git remote get-url origin)
            REPO_PATH=${ORIGINAL_URL#https://github.com/}

            git config --local credential.helper '!f() { echo "username=x-access-token"; echo "password=${GITHUB_PAT}"; }; f'

            echo "Fetch tags"
            git fetch --tags

            echo "Checkout tag: ${{ github.event.inputs.tag }}"
            git checkout -f ${{ github.event.inputs.tag }}

            echo "Remove credential helper"
            git config --local --unset credential.helper

            echo "Deploy with Docker Compose"
            export USER_ID=$(id -u)
            export GROUP_ID=$(id -g)
            docker compose up -d --build

            set -o history

            echo "Deployment completed successfully!"
          EOF
```

Ada beberapa hal menarik di sini. Mari kita bahas satu per satu.

Pertama, kita menggunakan **heredoc** (`<< 'EOF'`) untuk mengirim blok perintah shell ke server melalui SSH. Ini lebih rapi dibanding menulis semua perintah inline dalam satu baris panjang.

Kedua, kita menggunakan **Git credential helper** alih-alih menyimpan token di remote URL. Ini lebih aman karena setelah `git checkout` selesai, credential helper langsung kita hapus. Token hanya hidup selama eksekusi perintah tersebut.

Ketiga, perhatikan `set +o history` di awal. Ini mematikan bash history sementara agar token GitHub tidak tercatat di history shell server. Keamanan kecil yang sering terlewat.

Keempat, `export USER_ID` dan `GROUP_ID` diperlukan agar container Docker berjalan dengan user ID yang sama dengan host, sehingga permission file tetap konsisten.

### Menjalankan Migrasi

Bagian terakhir adalah opsi untuk menjalankan migrasi database:

```yaml
            # Run migration if requested
            if [ "${{ github.event.inputs.run_migration }}" == "true" ]; then
              echo "Running database migration..."
              docker exec container_app php artisan migrate --force
              echo "Migration completed!"
            else
              echo "Skipping migration"
            fi
```

Cukup straightforward. Cek apakah input `run_migration` bernilai `true`. Jika ya, jalankan `php artisan migrate --force` di dalam container `container_app`. Flag `--force` diperlukan karena artisan biasanya meminta konfirmasi di environment production.

Bagian ini yang dulu paling menyebalkan. Sering kali setelah `docker compose up -d` selesai, saya harus buru-buru `docker exec` untuk menjalankan migrasi sebelum ada request masuk yang menyentuh tabel baru. Sekarang tinggal centang kotak, beres.

## Hasil Akhir

Yay 🎉, workflow sudah siap. Sekarang setiap kali ingin deploy, prosesnya sesederhana:

1. **Push commit** dan **buat tag** (`git tag v1.2.3 && git push origin v1.2.3`)
2. Buka repository di GitHub, tab **Actions** → pilih **Deploy Production** → klik **Run workflow**
3. Isi tag yang ingin di-deploy
4. Centang `Run database migration?` jika ada perubahan database
5. Klik **Run workflow** dan tunggu notifikasi sukses

Berikut perbandingan sebelum dan sesudah:

| Langkah | Sebelum (Manual) | Sesudah (GitHub Actions) |
|---------|-----------------|--------------------------|
| Checkout kode di server | SSH → `git fetch` → `git checkout` | Otomatis via workflow |
| Build & deploy | `docker compose up -d --build` | Otomatis via workflow |
| Migrasi database | SSH → `docker exec` → `php artisan migrate` | Centang checkbox |
| Total waktu | **2–3 menit** | **~40 detik** (input parameter) |
| Risiko human error | Tinggi (lupa langkah) | Rendah (terstandarisasi) |

Dari **2-3 menit** ke **~40 detik**, itu artinya **waktu deployment berkurang sekitar 80%**. Tapi yang lebih penting dari pengurangan waktu adalah: deployment sekarang **konsisten** dan **bebas dari human error**.

## Kesimpulan

Migrasi dari Beanstalk ke Lightsail memang memaksa saya keluar dari zona nyaman backend engineer dan menyentuh hal-hal infrastruktur yang sebelumnya sudah ditangani otomatis — termasuk deployment. Tapi dari situlah kita belajar dan berkembang.

Dengan GitHub Actions `workflow_dispatch`, kita bisa membangun CI/CD pipeline sederhana yang tidak kalah nyaman dengan managed service seperti Beanstalk. Modal utamanya cuma:

- Repository di GitHub
- Server yang bisa diakses via SSH
- Aplikasi yang sudah di-containerize dengan Docker
- Satu file workflow YAML

Oke, mungkin pipeline ini belum secanggih Jenkins atau GitLab CI dengan fitur rollback otomatis dan approval gate. Tapi untuk tim kecil atau proyek personal, ini sudah lebih dari cukup.

Jika Anda memiliki tambahan atau koreksi terhadap pembahasan di atas, mari kita diskusikan di kolom komentar. Semoga membantu 👋.
