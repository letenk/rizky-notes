---
title: "Registry Pattern & Dispatcher Pattern: Cara Elegan Mengelola Banyak Provider"
date: 2026-07-22T09:00:00+07:00
tags: ["go", "golang", "tips", "design pattern"]
cover:
  image: "/images/registry-pattern-dan-dispatcher-pattern-cara-elegan-mengelola-banyak-provider/cover.webp"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

Beberapa waktu lalu saya mengerjakan dua hal yang sekilas nggak ada hubungannya sama sekali. Yang pertama, fitur OTP lewat SMS yang terhubung ke provider pihak ketiga. Yang kedua, sebuah project yang mengintegrasikan AI dengan dua provider sekaligus: OpenCode dan Anthropic. Bedanya jauh — satu soal kirim SMS, satu lagi soal chat completion.

Tapi begitu saya lihat lebih dekat, ternyata dua-duanya menghadapi masalah yang sama persis: **bagaimana caranya memilih implementasi yang tepat, saat runtime, tanpa kode saya berubah jadi tumpukan `if/else` yang terus memanjang setiap kali ada provider baru?**

Nah, di titik inilah saya akhirnya benar-benar paham kenapa Registry Pattern dan Dispatcher Pattern itu dibuat. Bukan karena teori, tapi karena kepepet nyari cara yang rapi. Di artikel ini saya mau berbagi apa yang saya pelajari — mulai dari masalah yang memicu kebutuhan pattern ini, definisi dan analoginya, sampai bagaimana keduanya dipakai bareng-bareng dalam satu kasus nyata.

## Masalah: Switch-Case yang Terus Tumbuh

Mari kita mulai dari gejalanya dulu. Bayangkan kita baru mulai mengintegrasikan LLM ke aplikasi, dan saat itu baru ada satu provider: OpenCode. Kodenya sederhana, cukup panggil langsung:

```go
func Chat(prompt string) (string, error) {
	return openCodeClient.Chat(prompt)
}
```

Sederhana dan nggak ada masalah. Tapi begitu Anthropic (Claude) masuk sebagai provider kedua, kita mulai menambahkan percabangan:

```go
func Chat(provider string, prompt string) (string, error) {
	switch provider {
	case "opencode":
		return openCodeClient.Chat(prompt)
	case "anthropic":
		return anthropicClient.Chat(prompt)
	// case "gemini": ← kalau ini terus bertambah, ini tanda kita butuh sesuatu yang lebih rapi
	default:
		return "", fmt.Errorf("provider %s tidak dikenal", provider)
	}
}
```

Kelihatannya masih aman-aman saja, kan? Tapi coba pikirkan: setiap kali ada provider baru — katakanlah nanti kita tambah Gemini, lalu STT provider kedua, lalu payment gateway kedua — kita harus balik lagi ke fungsi ini dan menambah satu `case` baru. Fungsi yang tadinya kecil, lama-lama jadi raksasa yang menyimpan pengetahuan tentang *semua* provider yang pernah ada.

Perlu diingat, ini bukan salah siapa-siapa. `switch/if-else` di atas string atau enum yang terus memanjang setiap ada fitur baru itu adalah **code smell** yang paling umum menandakan kita butuh sebuah mekanisme untuk memilih implementasi secara lebih dinamis — dan di sinilah Registry Pattern masuk.

## Registry Pattern: Buku Alamat untuk Implementasi

Registry Pattern bukan istilah yang saya buat sendiri. Ini design pattern yang sudah punya nama resmi, dari buku *Patterns of Enterprise Application Architecture* karya Martin Fowler. Definisinya kurang lebih: sebuah objek "buku alamat" yang menyimpan dan memberikan objek atau servis lain berdasarkan sebuah kunci.

Analoginya seperti ini: bayangkan sebuah buku telepon kantor. Tugasnya cuma satu — kalau kita bilang "kasih saya nomor yang namanya Anthropic", dia akan mengembalikan nomornya. Buku telepon itu **tidak tahu** kapan kita harus menelepon siapa, dia hanya menyimpan dan memberikan.

Tapi ada satu hal yang perlu kamu pahami: registry yang biasa kita pakai di dunia nyata sebenarnya kombinasi dari dua ide yang bekerja bareng:

| Yang kita pakai | Nama konsepnya | Perannya |
|---|---|---|
| Interface (`LLMService`) | Strategy pattern | Banyak implementasi (OpenCode, Anthropic) di balik satu kontrak yang sama, bisa saling ditukar |
| `map[string]LLMService` + `Resolve(name)` | Registry / Service Locator | Cari implementasi yang tepat lewat nama, saat runtime |

Jadi singkatnya: **pattern = Registry (dikombinasikan dengan Strategy)**. Di baliknya ada dua prinsip yang jadi alasan kenapa kombinasi ini bagus — *program to an interface, not an implementation* (kode kita bergantung ke kontrak, bukan ke `AnthropicLLMService` langsung), dan *Open/Closed Principle* (huruf "O" di SOLID: terbuka untuk ditambah provider baru, tertutup untuk diubah di sisi caller).

Oke, saatnya kita coba tulis kodenya. Pertama, kita definisikan kontraknya lewat interface:

```go
type LLMService interface {
	Chat(prompt string) (string, error)
}

type OpenCodeLLMService struct {
	client *opencode.Client
}

func (s *OpenCodeLLMService) Chat(prompt string) (string, error) {
	return s.client.Chat(prompt)
}

type AnthropicLLMService struct {
	client *anthropic.Client
}

func (s *AnthropicLLMService) Chat(prompt string) (string, error) {
	return s.client.Chat(prompt)
}
```

Setelah kontraknya jelas, baru kita bikin registry-nya — tempat menyimpan dan mencari implementasi berdasarkan nama:

```go
type LLMRegistry struct {
	services map[string]LLMService
}

func NewLLMRegistry() *LLMRegistry {
	return &LLMRegistry{services: make(map[string]LLMService)}
}

func (r *LLMRegistry) Register(name string, service LLMService) {
	r.services[name] = service
}

func (r *LLMRegistry) Resolve(name string) (LLMService, error) {
	service, ok := r.services[name]
	if !ok {
		return nil, fmt.Errorf("provider %s tidak terdaftar di registry", name)
	}
	return service, nil
}
```

Dan saat aplikasi start, kita daftarkan semua provider yang ada:

```go
registry := NewLLMRegistry()
registry.Register("opencode", &OpenCodeLLMService{client: opencodeClient})
registry.Register("anthropic", &AnthropicLLMService{client: anthropicClient})
```

Yap, sekarang kalau mau menambah Gemini besok, kita tinggal buat `GeminiLLMService` yang meng-implement `LLMService`, lalu daftarkan satu baris di atas. Tidak ada satu pun `switch/if-else` yang perlu disentuh lagi. Cukup jelas ya perbedaannya dibanding versi awal tadi?

## Registry Bukan Konsep Eksklusif Go

Ini bagian yang menurut saya penting dipahami: Registry itu **konsep**, bukan fitur bahasa pemrograman tertentu. Jadi bisa dipakai di bahasa apapun, asal bahasa itu punya dua hal yang hampir semua bahasa modern miliki:

1. Cara membuat "kontrak" / polymorphism (interface, abstract class, atau duck typing).
2. Cara menyimpan pasangan key → value (map, dictionary, atau object biasa).

Faktanya, kamu mungkin sudah memakai registry tanpa sadar. Contoh paling dekat ada di package `database/sql` milik Go sendiri. Setiap driver database — Postgres, MySQL, SQLite — mendaftarkan dirinya lewat `sql.Register`:

```go
import (
	"database/sql"
	_ "github.com/lib/pq"
)

func main() {
	// Di balik layar, package pq memanggil sql.Register("postgres", &Driver{})
	// saat di-import lewat init().
	db, err := sql.Open("postgres", "postgres://user:pass@localhost/dbname")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
}
```

`sql.Open("postgres", ...)` itu, di balik layar, adalah pemanggilan `Resolve("postgres")` ke sebuah registry driver. Polanya persis sama dengan `LLMRegistry` yang kita tulis di atas — bedanya cuma nama fungsi. Di JavaScript atau Python, pola yang sama biasanya muncul sebagai object atau dict yang memetakan nama ke fungsi handler. Di Java, biasanya berbentuk `Map<String, PaymentGateway>`. Polanya sama di mana-mana, hanya sintaksnya yang beda per bahasa.

## Kapan Pakai Registry, dan Kapan Tidak

Nah, ini bagian yang menurut saya paling penting — karena registry, seperti kebanyakan pattern, gampang disalahgunakan kalau dipasang di tempat yang salah. Ada sinyal-sinyal yang bisa kita pakai untuk memutuskan.

**Pakai registry kalau:**

1. Ada beberapa implementasi yang bisa saling ditukar dari hal yang sama (OpenCode vs Anthropic; SMS vs email vs push notification; Midtrans vs Xendit).
2. Pilihan implementasinya ditentukan **saat runtime** atau dari data — dari database, config, input user, tipe pesan. Bukan ditentukan saat kita menulis kode.
3. Kita tahu akan sering menambah varian baru ke depannya.

**Jangan pakai registry kalau:**

1. Cuma ada satu implementasi dan tidak ada rencana nyata untuk menambah — ini namanya over-engineering, atau yang biasa disebut **YAGNI** (*You Aren't Gonna Need It*). Indireksi yang tidak perlu justru bikin kode lebih susah dibaca.
2. Pilihannya tetap dan ditentukan saat compile, sederhana — cukup pakai dependency injection biasa.
3. Cuma ada dua varian, dan dipilih sekali saja di startup — `if/else` sederhana sudah lebih dari cukup.

Kalau saya ringkas jadi satu kalimat, rule of thumb-nya begini: *kalau kita menukar perilaku berdasarkan sebuah nama atau tipe, dan daftar pilihannya bakal terus tumbuh, itu kandidat registry. Kalau cuma ada satu pilihan atau memang tidak akan bertambah, jangan dipasang.*

Contoh jujur dari pengalaman saya sendiri: untuk LLM, saya pasang registry karena sudah tahu pasti Anthropic akan masuk sebagai provider kedua — dua syarat di atas terpenuhi. Tapi untuk STT (speech-to-text) dan TTS yang saat itu masih satu provider saja, saya **tidak** pasang registry dulu. Itu murni YAGNI — akan saya tambahkan begitu benar-benar ada provider kedua yang perlu didukung.

## Dispatcher Pattern: Sang Resepsionis

Registry saja ternyata belum cukup untuk kasus OTP SMS saya. Kenapa? Karena di sana ada aturan tambahan: kadang saya perlu memaksa semua trafik ke satu provider tertentu lewat *kill switch*, dan kalau provider utama gagal, saya perlu fallback ke provider cadangan. Logika semacam ini bukan tugas registry — dan di sinilah Dispatcher masuk.

Perlu diingat, Dispatcher bukan satu design pattern tunggal yang punya nama resmi di buku Gang of Four. Ia lebih tepat disebut sebuah *peran* yang menggabungkan beberapa ide sekaligus: **Facade** (menyembunyikan kerumitan di balik satu method sederhana) yang di dalamnya memakai **Strategy + Registry** untuk memilih implementasi yang tepat.

Mari kita pakai analogi kantor lagi supaya lebih kebayang:

- **Registry** = buku telepon. Tugasnya cuma satu: "kasih saya nomor yang namanya Anthropic." Dia tidak tahu kapan harus menelepon siapa — cuma menyimpan dan memberikan.
- **Dispatcher** = resepsionis. Dia yang punya aturan dan mengambil keputusan: "lihat dulu mode ini maunya provider apa" (per-mode), "eh, ada kill-switch aktif? kalau iya, belokkan semua ke provider default" (override), lalu dia menelepon lewat buku telepon (registry), dan "kalau nomor utama gagal, coba nomor cadangan" (fallback).

Resepsionis memakai buku telepon, tapi buku telepon sendiri tidak tahu apa-apa soal aturan darurat itu. Itu pemisahan tugas yang sehat. Oke, sekarang mari kita tulis kodenya:

```go
type Dispatcher struct {
	registry        *LLMRegistry
	defaultProvider string
	killSwitch      bool
}

func (d *Dispatcher) Chat(mode string, prompt string) (string, error) {
	provider := d.resolveProvider(mode)

	service, err := d.registry.Resolve(provider)
	if err != nil {
		return "", err
	}

	result, err := service.Chat(prompt)
	if err != nil && provider != d.defaultProvider {
		// Fallback: provider utama gagal, coba provider default
		fallback, resolveErr := d.registry.Resolve(d.defaultProvider)
		if resolveErr != nil {
			return "", err
		}
		return fallback.Chat(prompt)
	}

	return result, err
}

func (d *Dispatcher) resolveProvider(mode string) string {
	if d.killSwitch {
		return d.defaultProvider
	}

	switch mode {
	case "fast":
		return "opencode"
	case "reasoning":
		return "anthropic"
	default:
		return d.defaultProvider
	}
}
```

Dengan begini, `SessionService` yang memakai fitur chat cukup memanggil `dispatcher.Chat(mode, prompt)` — dia tidak perlu tahu sama sekali soal registry, kill-switch, atau fallback:

```go
func (s *SessionService) Reply(mode, prompt string) (string, error) {
	return s.dispatcher.Chat(mode, prompt)
}
```

Semua kerumitan itu "disembunyikan" oleh Dispatcher. Itulah peran Facade-nya.

## Kenapa Dipisah? Registry vs Dispatcher

Mungkin kamu bertanya, kenapa tidak digabung saja jadi satu file? Jawabannya ada di prinsip Single Responsibility (huruf "S" di SOLID) — Registry dan Dispatcher menjawab pertanyaan yang berbeda, dan berubah karena alasan yang berbeda pula:

| | Registry | Dispatcher |
|---|---|---|
| Pertanyaan yang dijawab | "Implementasi apa saja yang ada? Berikan satu berdasarkan nama." | "Sekarang harus pakai yang mana, dan kalau gagal bagaimana?" |
| Jenis isinya | Mekanisme (menyimpan & mencari) | Kebijakan/keputusan (aturan bisnis) |
| Berubah kalau… | Cara provider disimpan berubah | Aturan pemilihan berubah (ada toggle baru, dll) |

Kalau digabung jadi satu file, satu file itu akan mengurus dua hal yang berubah karena alasan yang berbeda — dan itu makin lama makin susah dibaca. Dipisah, masing-masing jadi kecil dan jelas. Alurnya kira-kira begini:

```
LLMService (interface)   →  kontrak: tiap provider bisa Chat()        [Strategy]
├─ OpenCodeLLMService
└─ AnthropicLLMService

Registry                 →  simpan provider, cari berdasarkan nama    [Registry]

Dispatcher               →  pilih provider (mode/kill-switch),
                             panggil, fallback kalau gagal             [Facade + policy]
                             (dia yang PAKAI Registry)

SessionService           →  cukup panggil dispatcher.Chat(...)
                             (tidak tahu soal registry/toggle/fallback)
```

`SessionService` jadi bersih — dia tidak tahu ada OpenCode atau Anthropic, tidak tahu soal kill-switch. Semua itu tersembunyi rapi di balik satu pemanggilan method.

## Studi Kasus: OTP SMS dan Integrasi LLM Dua Provider

Sekarang mari kita kembali ke dua kasus nyata yang saya ceritakan di awal, dan lihat bagaimana keduanya cocok dengan pola yang sama.

Untuk **integrasi LLM**, kondisinya persis seperti contoh kode di atas — dua provider (OpenCode dan Anthropic) yang bisa ditukar tergantung mode (misalnya mode cepat vs mode reasoning), plus ada kebutuhan kill-switch kalau salah satu provider bermasalah, dan fallback otomatis ke provider default. Ini kasus yang jelas-jelas butuh Registry **dan** Dispatcher, karena dua syarat pentingnya terpenuhi: implementasinya bisa ditukar saat runtime, dan aturan pemilihannya tidak sepele.

Untuk **OTP SMS**, pola yang sama berlaku di level yang lebih sederhana. Registrasinya kira-kira begini:

```go
type SMSProvider interface {
	SendOTP(phoneNumber, code string) error
}

smsRegistry := NewSMSRegistry()
smsRegistry.Register("primary", &PrimarySMSProvider{apiKey: primaryAPIKey})
smsRegistry.Register("backup", &BackupSMSProvider{apiKey: backupAPIKey})

smsDispatcher := &SMSDispatcher{
	registry:        smsRegistry,
	defaultProvider: "primary",
}
```

Kalau provider SMS utama sedang down atau limit kuota habis, `SMSDispatcher` yang menentukan kapan harus beralih ke provider cadangan — tanpa `SessionService` atau handler HTTP yang mengirim OTP perlu tahu detail itu sama sekali.

Tapi perlu diingat catatan jujur dari pengalaman saya tadi: tidak semua bagian sistem butuh pola ini. STT dan TTS yang saat ini baru punya satu provider, saya biarkan apa adanya — tanpa registry, tanpa dispatcher. Begitu juga kalau nanti sistem ini berkembang jadi SaaS dan butuh payment gateway kedua (Midtrans, Stripe, Xendit), pola yang sama bisa dipakai lagi — tapi baru saat kebutuhannya benar-benar muncul, bukan lebih awal dari itu.

Contoh dispatcher lain yang mungkin sudah sering kamu pakai tanpa sadar: HTTP router (seperti Echo) yang men-dispatch request ke handler berdasarkan path, atau notification dispatcher yang mengirim lewat email, SMS, atau push tergantung preferensi user. Semuanya pola yang sama: tentukan target, jalankan, dan tangani kalau gagal.

## Kesimpulan

Registry Pattern dan Dispatcher Pattern lahir dari masalah yang sama: kode kita mulai punya banyak implementasi yang bisa saling ditukar, dan kita butuh cara memilihnya tanpa menumpuk `switch/if-else` yang terus memanjang. Registry menjawab pertanyaan "implementasi apa yang tersedia", sedangkan Dispatcher menjawab "yang mana yang harus dipakai sekarang, dan apa yang terjadi kalau gagal".

Yang paling penting untuk diingat: jangan pasang kedua pattern ini di semua tempat secara default. Cek dulu sinyalnya — apakah implementasinya benar-benar bisa bertambah, dan apakah aturan pemilihannya cukup rumit untuk butuh dipisah. Kalau tidak, `if/else` sederhana atau pemanggilan langsung sudah lebih dari cukup, dan justru itu pilihan yang lebih bersih.

Jika Anda memiliki tambahan atau koreksi terhadap pembahasan di atas, mari kita diskusikan di kolom komentar. Semoga membantu 👋.
