---
title: "Registry Pattern: Cara Elegan Mengelola Banyak Provider"
date: 2026-07-31T09:00:00+07:00
tags: ["go", "golang", "tips", "design pattern"]
cover:
  image: "/images/registry-pattern-dan-dispatcher-pattern-cara-elegan-mengelola-banyak-provider/cover.webp"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

Beberapa waktu lalu saya mengerjakan project yang mengintegrasikan AI dengan dua provider sekaligus, yaitu OpenCode dan Anthropic.
Hal yang biasa saya lakukan sebelum mulai menulis kode adalah memikirkan dan membayangkan kira-kira kode atau case apa yang akan terjadi ke depannya. Saya juga suka dengan kode yang bersih dan mudah dibaca.
Muncul pertanyaan:

> Bagaimana ya agar saya bisa mengimplementasikan dua provider ini, dan kalau nanti ada provider baru, kode saya tidak berubah menjadi tumpukan `switch/if-else` yang terus memanjang?

Dan saya butuh teman diskusi dan pilihan teman diskusi yang saya ajak adalah AI. Dengan bantuan model Opus dari Claude, saya mendapat saran untuk menggunakan *Registry Pattern* dan *Dispatcher*.
Dari sini rasa penasaran saya muncul, dan akhirnya saya menemukan beberapa konsep menarik yang saya gunakan. Mari kita bahas.

## Masalah: Switch-Case yang Terus Tumbuh

Mari kita mulai dari titik paling awal, sebelum ada satu baris `switch` pun. Bayangkan kita baru mulai mengintegrasikan LLM ke aplikasi, dan saat itu baru ada satu provider: OpenCode.

Client-nya kira-kira begini:

```go
package main

import (
	"fmt"
	"log"
)

type OpenCodeClient struct {
	apiKey string
}

func NewOpenCodeClient(apiKey string) *OpenCodeClient {
	return &OpenCodeClient{apiKey: apiKey}
}

func (c *OpenCodeClient) Chat(prompt string) (string, error) {
	if c.apiKey == "" {
		return "", fmt.Errorf("opencode: api key is empty")
	}

	return fmt.Sprintf("[OpenCode] Reply for: %q", prompt), nil
}

var openCodeClient = NewOpenCodeClient("dummy-api-key-opencode")

func Chat(prompt string) (string, error) {
	return openCodeClient.Chat(prompt)
}

func main() {
	prompt := "Explain what the Registry Pattern is"

	reply, err := Chat(prompt)
	if err != nil {
		log.Fatalf("chat failed: %v", err)
	}

	fmt.Println(reply)
}
```

Dan lihat function `Chat` masih sangat sederhana. Kita cukup memanggil method `Chat` dari instance `openCodeClient` secara langsung:

```go
func Chat(prompt string) (string, error) {
	return openCodeClient.Chat(prompt)
}
```

Sederhana dan tidak ada masalah. Tapi begitu Anthropic (Claude) masuk sebagai provider kedua, ada dua hal yang berubah. Pertama, kita menambah satu client baru dengan bentuk yang mirip:

```go
type AnthropicClient struct {
	apiKey string
}

func NewAnthropicClient(apiKey string) *AnthropicClient {
	return &AnthropicClient{apiKey: apiKey}
}

func (c *AnthropicClient) Chat(prompt string) (string, error) {
	if c.apiKey == "" {
		return "", fmt.Errorf("anthropic: api key is empty")
	}

	return fmt.Sprintf("[Anthropic] Reply for: %q", prompt), nil
}

var anthropicClient = NewAnthropicClient("dummy-api-key-anthropic")
```

Kedua, dan ini bagian yang mulai jadi masalah, `Chat` sekarang harus tahu provider mana yang mau dipakai:

```go
func Chat(provider string, prompt string) (string, error) {
	switch provider {
	case "opencode":
		return openCodeClient.Chat(prompt)

	case "anthropic":
		return anthropicClient.Chat(prompt)

	// case "gemini":
	//     ...

	default:
		return "", fmt.Errorf("unknown provider: %s", provider)
	}
}
```

Kelihatannya masih aman-aman saja, kan?

Dengan dua provider, kode seperti ini masih mudah dibaca. Tapi coba bayangkan kalau provider terus bertambah, setiap kali ada provider baru, kita harus kembali ke function `Chat` ini dan menambahkan `case` baru. Lama-lama function ini bukan hanya menangani proses `Chat`, tetapi juga harus mengetahui provider apa saja yang tersedia dan bagaimana cara memanggil masing-masing provider. Di titik ini kita bisa mulai bertanya:

> **Apakah ada cara supaya `Chat` tidak perlu tahu semua provider?**

Salah satu jawabannya adalah **Registry Pattern**.

## Registry Pattern: Buku Alamat untuk Implementasi

Registry Pattern bukan istilah yang saya buat sendiri. Ini adalah design pattern yang dibahas Martin Fowler dalam *Patterns of Enterprise Application Architecture*. Secara sederhana, Registry adalah tempat yang menyimpan object atau service sehingga object lain dapat menemukannya berdasarkan sebuah key.

### Analogi: Contacts di Smartphone

Analoginya seperti ini: bayangkan kita sedang menggunakan fitur pencarian pada aplikasi **Contacts** di smartphone. Kita mencari kontak bernama "Anthropic", lalu aplikasi tersebut mengembalikan nomor yang tersimpan untuk kontak tersebut. Aplikasi Contacts **tidak tahu kapan kita akan menelepon atau untuk keperluan apa nomor tersebut akan digunakan**. Tugasnya hanya menyimpan dan memberikan informasi yang kita cari.

Kembali ke use case kita.

Begitu juga dengan Registry. Goalnya adalah function `Chat` tidak perlu tahu apapun. Ketika kita memberikan key `"anthropic"`, Registry akan mengembalikan implementation yang terdaftar untuk key tersebut, yaitu `AnthropicClient`. Begitu juga dengan provider lainnya.

Registry tidak menentukan kapan atau bagaimana implementation tersebut akan digunakan. Keputusan itu menjadi tanggung jawab bagian lain dari aplikasi. Ia cukup tahu:

> Ada sesuatu yang bisa melakukan `Chat()`.

## Struktur File yang Akan Kita Bangun

Sebelum masuk ke kode, ada satu hal yang perlu diluruskan dulu: semua contoh di artikel ini saya tulis berurutan supaya mudah diikuti, tapi di project asli saya, kode-kode ini tidak duduk di satu file yang sama.

Function `Chat`, struct `LLMRegistry`, dan Dispatcher masing-masing punya rumah sendiri. Alasannya sederhana: kalau semua digabung jadi satu file besar, salah satu manfaat utama Registry pattern jadi tidak terlihat: menambah provider baru seharusnya **cuma menambah file, bukan mengubah file lama**.

Jadi sebelum masuk ke Langkah 1, ini gambaran akhir struktur file yang akan kita tuju:

```text
llm/
├── contract.go          // interface LLMService
├── registry.go          // struct + method Register, Resolve
├── dispatcher.go        // struct + method resolveProvider, Chat
├── session.go           // struct SessionService, method Reply
├── client_opencode.go   // implementation OpenCodeClient
├── client_anthropic.go  // implementation AnthropicClient
main.go                  // wiring: registrasi provider, jalankan dispatcher
```

Dua client yang sudah kita tulis di bagian sebelumnya, `OpenCodeClient` dan `AnthropicClient`, juga ikut pindah, masing-masing ke `client_opencode.go` dan `client_anthropic.go`.

Nah, setiap kali saya menunjukkan kode baru di artikel ini, saya akan sebutkan juga file mana yang jadi rumahnya. Tujuannya supaya kamu tidak cuma paham *apa* yang ditulis, tapi juga *di mana* kode itu seharusnya berada.

Cukup jelas ya? Kalau begitu, mari kita mulai dari langkah pertama.

## Membangun Registry

Sekarang mari kita ubah kode diatas secara bertahap. Kita tidak akan langsung membuat Registry dalam bentuk final, tetapi membangunnya satu langkah demi satu langkah agar jelas apa yang berubah dan mengapa kita membutuhkannya.

### Langkah 1: Buat kontrak lewat interface

Perhatikan lagi dua client yang sudah kita tulis tadi. `OpenCodeClient` dan `AnthropicClient` memiliki method `Chat` dengan signature yang sama:

```go
Chat(prompt string) (string, error)
```

Kita bisa membuat sebuah interface sebagai kontrak untuk keduanya. Buat file `contract.go`, isi dengan interface ini:

```go
type LLMService interface {
	Chat(prompt string) (string, error)
}
```

Interface ini mengatakan bahwa siapa pun yang memiliki method `Chat` dengan bentuk yang sama dapat digunakan sebagai `LLMService`.

`OpenCodeClient` dan `AnthropicClient` sama-sama memiliki method tersebut, sehingga keduanya memenuhi interface `LLMService`. Kita tidak perlu mengubah atau mendeklarasikan hubungan khusus pada kedua client tersebut.

Ini kemudian memungkinkan Registry menyimpan berbagai client yang berbeda dalam satu map:

```go
map[string]LLMService
```

Registry tidak perlu tahu apakah value di dalamnya adalah `*OpenCodeClient`, `*AnthropicClient`, atau provider lainnya. Registry hanya perlu tahu bahwa value tersebut memenuhi kontrak `LLMService`.

### Langkah 2: Buat struct Registry

Sekarang kita membutuhkan tempat untuk menyimpan provider yang tersedia.

Buat file baru `registry.go`, dan isi dengan struct baru bernama `LLMRegistry`:

```go
type LLMRegistry struct {
	services map[string]LLMService
}
```

Kita juga membutuhkan constructor untuk membuat Registry, masih di `registry.go`:

```go
func NewLLMRegistry() *LLMRegistry {
	return &LLMRegistry{
		services: make(map[string]LLMService),
	}
}
```

Sampai di sini kita baru membuat "tempat penyimpanan". Belum ada provider yang dimasukkan ke dalamnya. Kalau kita membuat Registry:

```go
registry := NewLLMRegistry()
```

maka secara sederhana kita bisa membayangkannya seperti ini:

```text
Registry

services:
    {}
```

Belum ada apa-apa di dalamnya. Selanjutnya kita membutuhkan cara untuk memasukkan provider ke dalam Registry.

### Langkah 3: Method `Register`

Buat method `Register` pada `LLMRegistry`, masih di `registry.go`:

```go
func (r *LLMRegistry) Register(name string, service LLMService) {
	r.services[name] = service
}
```

Method ini menerima dua hal:

* `name`= nama yang akan digunakan sebagai key, misalnya `"opencode"`.
* `service` = client yang ingin kita simpan.

Perlu diingat, `Register` di atas akan menimpa begitu saja kalau key yang sama didaftarkan dua kali. Untuk kebutuhan kita di artikel ini itu bukan masalah, tapi kalau nanti kamu butuh lebih strict, method ini bisa dengan mudah diubah agar return error saat key sudah terdaftar sebelumnya.

Sebelum lanjut ke `main()`, mari kita rapikan dulu dua client yang sempat kita tulis bersamaan di satu file di awal artikel tadi. Isinya sama persis, cuma pindah rumah.

`OpenCodeClient` pindah ke `client_opencode.go`. Sekalian kita hapus `var openCodeClient = ...` di level package. Nanti instance-nya dibuat langsung di `main()`, bukan sebagai variabel global:

```go
type OpenCodeClient struct {
	apiKey string
}

func NewOpenCodeClient(apiKey string) *OpenCodeClient {
	return &OpenCodeClient{apiKey: apiKey}
}

func (c *OpenCodeClient) Chat(prompt string) (string, error) {
	if c.apiKey == "" {
		return "", fmt.Errorf("opencode: api key is empty")
	}

	return fmt.Sprintf("[OpenCode] Reply for: %q", prompt), nil
}
```

Begitu juga `AnthropicClient`, pindah ke `client_anthropic.go`, tanpa variabel global:

```go
type AnthropicClient struct {
	apiKey string
}

func NewAnthropicClient(apiKey string) *AnthropicClient {
	return &AnthropicClient{apiKey: apiKey}
}

func (c *AnthropicClient) Chat(prompt string) (string, error) {
	if c.apiKey == "" {
		return "", fmt.Errorf("anthropic: api key is empty")
	}

	return fmt.Sprintf("[Anthropic] Reply for: %q", prompt), nil
}
```

Sekarang kita bisa membuat Registry dan mendaftarkan provider di `main.go`:

```go
func main() {
	openCodeClient := NewOpenCodeClient("dummy-api-key-opencode")
	anthropicClient := NewAnthropicClient("dummy-api-key-anthropic")

	registry := NewLLMRegistry()

	registry.Register("opencode", openCodeClient)
	registry.Register("anthropic", anthropicClient)
}
```

Perhatikan kode diatas: pertama kita membuat instance kedua client secara eksplisit, lalu instance baru dari constructor `NewLLMRegistry()`, baru kemudian mendaftarkan keduanya lewat method `Register`. Di sinilah point utama terjadi. Sebelumnya mapping provider kita lakukan pada function `Chat`, tapi kali ini kita memindahkanya ke method `Register`.

`main.go` pun jadi benar-benar bersih. Isinya cuma wiring: bikin instance client, bikin Registry, lalu daftarkan provider yang mana ke key apa. Tidak ada lagi detail implementasi `OpenCodeClient` atau `AnthropicClient` yang nyempil di file ini, dan tidak ada satu pun variabel global yang bergantung ke file lain.

Dengan begitu, `Chat()` nantinya tidak perlu mengetahui lagi client mana yang harus dipanggil untuk setiap provider. Tapi kita masih membutuhkan satu hal: **bagaimana cara mengambil kembali provider dari Registry?**

### Langkah 4: Method `Resolve`

Kita sudah memiliki method untuk memasukkan provider, yaitu `Register`.

Sekarang buat method dengan nama Resolve untuk mengambil provider berdasarkan namanya, masih di `registry.go`:

```go
func (r *LLMRegistry) Resolve(name string) (LLMService, error) {
	service, ok := r.services[name]

	if !ok {
		return nil, fmt.Errorf(
			"registry: provider %q is not registered",
			name,
		)
	}

	return service, nil
}
```

Sekarang kita bisa mengambil provider yang kita inginkan, masih di `main.go`:

```go
func main() {
	openCodeClient := NewOpenCodeClient("dummy-api-key-opencode")
	anthropicClient := NewAnthropicClient("dummy-api-key-anthropic")

	registry := NewLLMRegistry()
	registry.Register("opencode", openCodeClient)
	registry.Register("anthropic", anthropicClient)

	// Call provider
	service, err := registry.Resolve("anthropic")
	if err != nil {
		log.Fatal(err)
	}
}
```

Sekarang jika `"anthropic"` sudah didaftarkan sebelumnya, `Resolve` akan mengembalikan `anthropicClient` dan kalau provider tersebut tidak ditemukan, `Resolve` akan mengembalikan error.

### Langkah 5: Gunakan Registry di `Chat`

Sekarang kita sudah memiliki semua bagian yang dibutuhkan. Sebelumnya kita sudah membuat instance Registry dan mendaftarkan provider saat aplikasi dimulai. Dan Sebelumnya, function`Chat` harus mengetahui setiap provider secara langsung:

```go
func Chat(provider string, prompt string) (string, error) {
	switch provider {
	case "opencode":
		return openCodeClient.Chat(prompt)

	case "anthropic":
		return anthropicClient.Chat(prompt)

	default:
		return "", fmt.Errorf("unknown provider: %s", provider)
	}
}
```

Sekarang kita bisa mengubahnya menjadi seperti ini. Kode ini masih di `main.go`:

```go
func Chat(registry *LLMRegistry, provider string, prompt string) (string, error) {
	service, err := registry.Resolve(provider)
	if err != nil {
		return "", err
	}

	return service.Chat(prompt)
}
```

Perhatikan apa yang berubah. Function`Chat()` sekarang tidak lagi memiliki:

```go
switch provider {
	// ...
}
```

Ia juga tidak perlu mengetahui bahwa `"opencode"` berarti `OpenCodeClient`, atau bahwa `"anthropic"` berarti `AnthropicClient`.

Informasi tersebut sudah menjadi tanggung jawab Registry, dan function `Chat()` hanya melakukan dua hal:
1. Minta Registry mencari provider.
2. Panggil Chat() pada provider tersebut.

Sekarang coba bayangkan kita menambahkan provider ketiga, misalnya Gemini. Kita tetap perlu membuat `GeminiClient` di file barunya sendiri `client_gemini.go`, kemudian mendaftarkannya di `main.go`. Karena implementasi kodenya pasti berbeda dengan provider lainnya misalnya pemilihan model, cara interaksi ke provider dan logic lainnya:

```go
registry.Register("gemini", geminiClient)
```

Kita tidak perlu lagi mengubah function `Chat()` untuk menambahkan provider baru seperti `"gemini"`. Fokus kita hanya pada kode provider baru itu sendiri, tanpa menyentuh kode lama yang sudah berjalan dan risiko bug regresi pun jadi lebih kecil. Inilah manfaat utama yang ingin saya jelaskan dari penggunaan Registry pattern, dalam contoh ini:

> **Consumer tidak perlu mengetahui mapping antara nama provider dan implementation. Mapping tersebut dikelola oleh Registry.**

Coba bayangkan sekarang: kalau besok ada provider ketiga seperti Gemini yang masuk, apa saja yang sebenarnya berubah?

Supaya tidak abstrak, ini perbandingan langsungnya:

| Skenario | Sebelum (switch, 1 file) | Sesudah (Registry, split file) |
|---|---|---|
| Tambah provider Gemini | Edit `main.go`: tambah client baru **dan** tambah `case` baru di `Chat` | Buat `client_gemini.go` baru, lalu tambah satu baris `registry.Register("gemini", geminiClient)` di `main.go` |
| File lama yang disentuh | `main.go`, function `Chat` ikut berubah | Tidak ada. `registry.go` dan `client_*.go` yang lain tetap utuh |
| Risiko regresi | Ada, karena kode yang sudah jalan ikut diedit | Minim, karena kode lama sama sekali tidak disentuh |

Perhatikan baris kedua. Itu poin paling penting dari semuanya: dengan Registry, provider baru itu murni **penambahan**, bukan **perubahan**. Manfaat ini baru terasa nyata begitu kode benar-benar dipisah ke beberapa file seperti struktur yang kita siapkan di awal tadi, bukan sekadar function `Chat` yang jadi lebih pendek.

## Dispatcher: Tempat Mengambil Keputusan

Registry ternyata belum cukup untuk semua kebutuhan. Registry menjawab **Provider mana yang tersedia dan bagaimana cara menemukannya?**

Tetapi ia tidak seharusnya menjawab **Untuk mode ini harus menggunakan provider mana?** atau **Kalau provider utama gagal, apa yang harus dilakukan?** atau juga **Kalau sedang ada masalah, apakah trafik harus diarahkan ke provider tertentu?**

Aturan seperti itu merupakan **routing atau policy**. Di sinilah kita bisa menggunakan sebuah komponen yang kita sebut **Dispatcher**.

Perlu diperjelas: Dispatcher bukan sebuah design pattern formal dengan struktur baku yang sedang kita terapkan di sini. Dalam artikel ini, Dispatcher adalah nama untuk sebuah komponen yang bertanggung jawab melakukan routing dan orchestration.

Dalam desain kita, Dispatcher menggunakan Registry untuk menemukan provider yang sudah dipilih.

### Analogi: Resepsionis

Bayangkan sebuah kantor.

**Registry** adalah aplikasi Contacts. Kita berkata:

> Cari kontak Anthropic.

Contacts memberikan informasi kontak tersebut. Contacts tidak menentukan apa yang akan kamu lakukan setelah mendapatkan nomor tersebut.

Sedangkan **Dispatcher** adalah resepsionis. Kita berkata:

> Saya ingin menghubungi provider untuk mode reasoning.

Resepsionis tahu bahwa mode `reasoning` harus diarahkan ke Anthropic. Kemudian ia mencari Anthropic melalui Registry. Kalau ada aturan seperti kill-switch atau fallback, Dispatcher juga yang menerapkan aturan tersebut.

### Langkah 1: Struct `Dispatcher`

Buat file baru `dispatcher.go`, dan isi dengan struct sederhana ini:

```go
type Dispatcher struct {
	registry        *LLMRegistry
	defaultProvider string
	killSwitch      bool
}
```

Field tersebut mewakili kebutuhan dasar Dispatcher:

* `registry` → tempat mencari provider.
* `defaultProvider` → provider default.
* `killSwitch` → kondisi untuk mengarahkan trafik ke provider tertentu.

Dalam contoh sederhana ini kita menggunakan `defaultProvider` untuk beberapa kebutuhan sekaligus. Pada sistem nyata, provider default, fallback, dan target kill-switch belum tentu harus sama.

### Langkah 2: Tentukan Provider dari Mode

Buat method `resolveProvider`, masih di `dispatcher.go`. Buat versi paling sederhana terlebih dahulu:

```go
func (d *Dispatcher) resolveProvider(mode string) string {
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

Perhatikan bahwa kita masih menggunakan `switch`.

Dan itu **tidak masalah**.

Di sini `switch` hanya melakukan pemetaan sederhana dari mode ke nama provider: `"fast"` ke `"opencode"`, `"reasoning"` ke `"anthropic"`. Ia tidak mengetahui bagaimana cara memanggil `OpenCodeClient` atau `AnthropicClient`.

Ini berbeda dengan `switch` di awal artikel yang secara langsung mengetahui implementation mana yang harus dipanggil.

Sekarang kita tambahkan aturan kill-switch:

```go
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

Kalau `killSwitch` aktif, mode diabaikan dan request diarahkan ke `defaultProvider`.

### Langkah 3: Method `Chat`

Sekarang kita gabungkan Dispatcher dengan Registry lewat method `Chat`, masih di `dispatcher.go`. Dan jangan lupa, function `Chat` lama di `main.go` yang menerima `registry`, `provider`, dan `prompt` sudah tidak terpakai lagi dan bisa dihapus:

```go
func (d *Dispatcher) Chat(
	mode string,
	prompt string,
) (string, error) {

	provider := d.resolveProvider(mode)

	service, err := d.registry.Resolve(provider)
	if err != nil {
		return "", err
	}

	return service.Chat(prompt)
}
```

Kalau provider utama gagal dan kita memang ingin memiliki fallback, policy tersebut juga bisa ditangani oleh Dispatcher.

Misalnya:

```go
func (d *Dispatcher) Chat(
	mode string,
	prompt string,
) (string, error) {

	provider := d.resolveProvider(mode)

	service, err := d.registry.Resolve(provider)
	if err != nil {
		return "", err
	}

	result, err := service.Chat(prompt)

	if err != nil && provider != d.defaultProvider {
		fallback, resolveErr := d.registry.Resolve(
			d.defaultProvider,
		)

		if resolveErr != nil {
			return "", err
		}

		return fallback.Chat(prompt)
	}

	return result, err
}
```

Contoh ini sengaja dibuat sederhana. Dalam sistem production, tidak semua error otomatis layak menyebabkan fallback.

Misalnya `400 Bad Request` atau `401 Unauthorized` belum tentu perlu mencoba provider lain, sedangkan timeout, rate limit tertentu, atau `5xx` mungkin lebih masuk akal untuk ditangani dengan fallback.

Detail tersebut merupakan bagian dari policy aplikasi dan bisa menjadi jauh lebih kompleks.

### Langkah 4: Sembunyikan detail dari pemanggil

`SessionService` adalah lapisan yang dipakai oleh bagian lain aplikasi kita untuk memulai chat, jadi ia layak punya file sendiri: `session.go`.

```go
type SessionService struct {
	dispatcher *Dispatcher
}

func NewSessionService(dispatcher *Dispatcher) *SessionService {
	return &SessionService{dispatcher: dispatcher}
}

func (s *SessionService) Reply(mode string,prompt string) (string, error) {
	return s.dispatcher.Chat(mode, prompt)
}
```

`SessionService` tidak perlu tahu soal OpenCode, Anthropic, Registry, kill-switch, atau fallback. Ia cukup mengetahui bahwa ada Dispatcher yang bisa menangani chat.

### Langkah 5: Satukan di `main.go` dan Jalankan

Sejauh ini `Chat()` sudah berubah beberapa kali: dari yang cuma menerima `prompt`, ke yang menerima `provider` dan `prompt`, sampai yang menerima `registry` secara eksplisit di Langkah 5 pembuatan Registry. Sekarang saatnya versi final: lewat Dispatcher dan `SessionService`, dipanggil dari satu `main.go` yang benar-benar bisa dijalankan.

Sekarang `main.go` versi lengkap. Kita buat program yang menerima `mode` dan prompt lewat argumen terminal:

```go
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	openCodeClient := NewOpenCodeClient("dummy-api-key-opencode")
	anthropicClient := NewAnthropicClient("dummy-api-key-anthropic")

	registry := NewLLMRegistry()
	registry.Register("opencode", openCodeClient)
	registry.Register("anthropic", anthropicClient)

	dispatcher := &Dispatcher{
		registry:        registry,
		defaultProvider: "opencode",
	}

	session := NewSessionService(dispatcher)

	mode := os.Args[1]
	prompt := os.Args[2]

	reply, err := session.Reply(mode, prompt)
	if err != nil {
		log.Fatalf("chat failed: %v", err)
	}

	fmt.Println(reply)
}
```

(Supaya fokus tetap di Registry dan Dispatcher, saya sengaja tidak menambahkan validasi jumlah argumen. Di aplikasi nyata, tentu ini perlu dicek dulu sebelum diakses.)

Sekarang coba jalankan dengan mode `fast`:

```bash
$ go run . fast "Apa itu Registry Pattern?"
[OpenCode] Reply for: "Apa itu Registry Pattern?"
```

Dan dengan mode `reasoning`:

```bash
$ go run . reasoning "Jelaskan konsep Dispatcher"
[Anthropic] Reply for: "Jelaskan konsep Dispatcher"
```

Kelihatan jelas sekarang: mode `fast` diarahkan `resolveProvider` ke `"opencode"`, Registry mencarikan instance `OpenCodeClient`nya, lalu `Chat()` dipanggil. Begitu juga `reasoning` yang berakhir di `AnthropicClient`. Tidak ada satu pun bagian di `main.go` yang tahu detail ini, semuanya sudah ditangani Dispatcher dan Registry.

Kalau nanti Gemini masuk sebagai provider ketiga, misalnya khusus untuk mode `creative` karena karakteristiknya yang lebih cocok untuk brainstorming atau tulisan kreatif, yang berubah cuma dua tempat:

```go
// dispatcher.go: tambah satu case
case "creative":
	return "gemini"
```

```go
// main.go: tambah satu baris registrasi
registry.Register("gemini", geminiClient)
```

```bash
$ go run . creative "Berikan 3 ide nama startup AI"
[Gemini] Reply for: "Berikan 3 ide nama startup AI"
```

`main()` tidak berubah strukturnya sama sekali. Argumen tetap `mode` dan `prompt`, `session.Reply(...)` tetap dipanggil dengan cara yang sama. Provider baru masuk, tapi titik panggilnya tidak ikut berubah.

## Registry vs Dispatcher

Mungkin muncul pertanyaan:

> Kenapa tidak digabung saja?

Karena Registry dan Dispatcher menjawab pertanyaan yang berbeda.

|                | Registry                            | Dispatcher                          |
| -------------- | ----------------------------------- | ----------------------------------- |
| Pertanyaan     | "Implementation apa yang tersedia?" | "Sekarang harus memakai yang mana?" |
| Tanggung jawab | Mekanisme lookup                    | Routing dan policy                  |
| Contoh         | `Resolve("anthropic")`              | `mode = reasoning → anthropic`      |
| Fallback       | Tidak                               | Bisa                                |
| Kill-switch    | Tidak                               | Bisa                                |

Alurnya kira-kira seperti ini:

1. **`LLMService`**: kontrak yang harus dipenuhi setiap provider.
2. **`OpenCodeClient`** dan **`AnthropicClient`**: implementation dari kontrak tersebut.
3. **Registry**: menyimpan dan mencari provider berdasarkan key.
4. **Dispatcher**: menentukan provider mana yang dipakai, sekaligus menerapkan policy seperti kill-switch dan fallback.
5. **`SessionService`**: cukup memanggil `dispatcher.Chat(...)`.

Dengan pemisahan ini, `SessionService` tidak perlu mengetahui detail provider yang digunakan.

## Registry Bukan Konsep Eksklusif Go

Registry adalah sebuah konsep, bukan fitur eksklusif Go. Implementasinya bisa berbeda-beda tergantung bahasa dan kebutuhan. Yang penting adalah idenya:

> **Sebuah implementation didaftarkan, kemudian dapat ditemukan kembali berdasarkan sebuah key.**

Contoh yang cukup dekat bisa kita temukan di package `database/sql` milik Go.

Database driver dapat didaftarkan berdasarkan nama, kemudian aplikasi menggunakan nama tersebut ketika membuka koneksi:

```go
import (
	"database/sql"
	_ "github.com/lib/pq"
)

func main() {
	db, err := sql.Open(
		"postgres",
		"postgres://user:pass@localhost/dbname",
	)

	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()
}
```

Secara konsep, `"postgres"` digunakan untuk menemukan driver yang sebelumnya sudah didaftarkan.

Implementasi internal `database/sql` tentu berbeda dengan Registry sederhana yang kita buat, tetapi idenya mirip: **nama digunakan untuk menemukan implementation yang tersedia**.

## Kapan Pakai Registry, dan Kapan Tidak?
Registry, seperti pattern lainnya, tidak selalu perlu digunakan. Ada beberapa kondisi yang bisa menjadi pertimbangan.

### Pakai Registry kalau:

**1. Ada beberapa implementation yang bisa saling ditukar.**

Misalnya kita memiliki beberapa provider AI yang akan digunakan untuk kebutuhan aplikasi kita, provider SMS untuk mengirim OTP, atau beberapa payment gateway seperti Midtrans, Stripe, dan Xendit.

**2. Implementation dipilih saat runtime.**

Misalnya pilihan provider ditentukan berdasarkan:

* configuration
* database
* input user
* tipe request
* mode tertentu

**3. Daftar implementation memang berpotensi terus bertambah.**

Kalau provider baru kemungkinan akan terus ditambahkan, Registry bisa membantu agar consumer tidak terus berubah.

### Jangan pakai Registry kalau:

**1. Hanya ada satu implementation dan belum ada kebutuhan nyata untuk menambah provider.**

Tidak semua kode membutuhkan abstraction tambahan.

**2. Pemilihannya sederhana dan tetap.**

Kalau provider sudah diketahui sejak awal dan tidak perlu dipilih saat runtime, dependency injection biasa bisa lebih sederhana.

**3. `if/else` atau `switch` masih kecil dan jelas.**

Jangan mengubah kode sederhana menjadi lebih kompleks hanya karena kita mengetahui sebuah pattern.

Kalau saya ringkas:

> **Kalau kita perlu memilih implementation berdasarkan sebuah key pada runtime, daftar pilihannya berpotensi berkembang, dan mekanisme pemilihannya mulai membutuhkan abstraction, Registry layak dipertimbangkan.**

Sebaliknya, kalau pemilihannya sederhana, `if/else`, `switch`, atau dependency injection biasa bisa menjadi pilihan yang lebih bersih.

Contoh dari pengalaman saya sendiri: untuk LLM, saya menggunakan Registry karena sudah tahu Anthropic akan masuk sebagai provider kedua.

Tapi untuk STT (*speech-to-text*) dan TTS yang saat itu masih satu provider saja, saya tidak memasang Registry.

Itu murni YAGNI (*You Aren't Gonna Need It*).

Kalau nanti benar-benar membutuhkan provider kedua, barulah abstraction tersebut bisa ditambahkan.

## Kesimpulan

Awalnya kita memiliki kode sederhana:

```go
func Chat(provider string, prompt string) (string, error) {
	switch provider {
	case "opencode":
		return openCodeClient.Chat(prompt)

	case "anthropic":
		return anthropicClient.Chat(prompt)

	default:
		return "", fmt.Errorf("unknown provider: %s", provider)
	}
}
```

Dengan dua provider, kode seperti ini masih baik-baik saja.

Masalah mulai muncul ketika provider terus bertambah dan setiap provider baru mengharuskan kita kembali mengubah function yang sama.

Kita kemudian memindahkan mapping tersebut ke Registry:

```text
Registry
    │
    ├── "opencode"  → OpenCodeClient
    ├── "anthropic" → AnthropicClient
    └── "gemini"    → GeminiClient
```

Sekarang consumer cukup mengatakan:

```go
registry.Resolve("anthropic")
```

Registry menjawab:

> **Implementation apa yang tersedia dan bagaimana cara menemukannya?**

Sementara Dispatcher menjawab:

> **Implementation mana yang harus dipakai sekarang dan policy apa yang harus diterapkan?**

Alurnya menjadi: request masuk ke Dispatcher, Dispatcher menentukan provider yang harus dipakai, Registry mencarikan implementation-nya, dan barulah `Chat()` pada provider tersebut dipanggil.

Dan satu hal yang paling penting untuk diingat:

> **`switch` atau `if/else` bukan musuh.**

Kalau routing-nya kecil dan jelas, keduanya bisa menjadi solusi yang lebih baik. Registry baru menarik ketika kita memang memiliki beberapa implementation yang bisa saling ditukar, membutuhkan runtime selection, dan mekanisme lookup tersebut mulai memberikan manfaat nyata.

Jangan memasang Registry dan Dispatcher hanya karena kita mengetahui nama pattern-nya. Pattern seharusnya **mengurangi kompleksitas**, bukan menambah lapisan abstraksi hanya karena kita tahu bahwa lapisan tersebut ada.

Jika Anda memiliki tambahan atau koreksi terhadap pembahasan di atas, mari kita diskusikan di kolom komentar.
Semoga membantu 👋