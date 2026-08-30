---
title: "Registry Pattern: A Clean Way to Manage Multiple Providers"
date: 2026-07-31T09:00:00+07:00
tags: ["go", "golang", "tips", "design pattern"]
cover:
  image: "/images/registry-pattern-dan-dispatcher-pattern-cara-elegan-mengelola-banyak-provider/cover.webp"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
slug: "registry-pattern-clean-way-to-manage-multiple-providers"
---

A while back I worked on a project that integrated AI with two providers at once: OpenCode and Anthropic.
Before I start writing code, I like to sit with the problem for a bit and think through what's likely to come up down the road. I also just like clean, readable code.
The question arises:

> How do I implement these two providers in a way that won't turn into an ever-growing pile of `switch`/`if-else` statements the moment a new one shows up?

And I need someone to talk to, and the person I’ve chosen to talk to is an AI. With help from Claude's Opus model, I got pointed toward the *Registry Pattern* and a *Dispatcher*.
That sent me down a bit of a rabbit hole, and I ended up finding a few ideas worth sharing. Let's get into it.

## The Problem: A Switch Statement That Keeps Growing

Let's start from the very beginning, before a single `switch` statement exists. Imagine you're just starting to integrate an LLM into your app, and at this point there's only one provider: OpenCode.

The client looks something like this:

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

Notice that the `Chat` function is still dead simple. We just call the `Chat` method on the `openCodeClient` instance directly:

```go
func Chat(prompt string) (string, error) {
	return openCodeClient.Chat(prompt)
}
```

Simple, no problems here. But the moment Anthropic (Claude) comes in as a second provider, two things change. First, we add a new client with a similar shape:

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

Second, and this is where things start to get messy, `Chat` now needs to know which provider to use:

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

Looks harmless enough, right?

With two providers, code like this is still readable. But imagine providers keep piling up. Every new one means coming back to this `Chat` function and adding another `case`. Over time, this function stops being just about handling chat, it also has to know every provider that exists and how to call each one. At this point, a question starts to form:

> **Is there a way to keep `Chat` from having to know about every provider?**

One answer is the **Registry Pattern**.

## Registry Pattern: An Address Book for Implementations

The Registry Pattern isn't something I came up with. It's a design pattern documented by Martin Fowler in *Patterns of Enterprise Application Architecture*. In short, a Registry is a place that stores objects or services so other objects can look them up by a key.

### Analogy: Your Phone's Contacts App

Here's the analogy: think about using the search feature in your phone's **Contacts** app. You look up a contact named "Anthropic," and the app hands back the number saved under that name. The Contacts app has no idea when you're going to call, or what for. Its only job is to store and return the information you're looking for.

Back to our use case.

A Registry works the same way. The goal is for the `Chat` function to not need to know anything. Give it the key `"anthropic"`, and the Registry hands back whatever implementation is registered under that key, in this case, `AnthropicClient`. Same for every other provider.

The Registry doesn't decide when or how that implementation gets used. That decision belongs to some other part of the app. All it knows is:

> There's something out there that can do `Chat()`.

## The File Structure We're Building Toward

Before we get into code, one thing needs clearing up: I'm writing every example in this post sequentially so it's easy to follow, but in my actual project, none of this code lives in a single file.

The `Chat` function, the `LLMRegistry` struct, and the Dispatcher each get their own home. The reason is simple: cram everything into one big file, and one of the Registry pattern's biggest benefits disappears. Adding a new provider should mean adding a file, not editing an old one.

So before Step 1, here's the file structure we're aiming for:

```text
llm/
├── contract.go          // LLMService interface
├── registry.go          // struct + Register, Resolve methods
├── dispatcher.go        // struct + resolveProvider, Chat methods
├── session.go           // SessionService struct, Reply method
├── client_opencode.go   // OpenCodeClient implementation
├── client_anthropic.go  // AnthropicClient implementation
main.go                  // wiring: register providers, run the dispatcher
```

The two clients we already wrote, `OpenCodeClient` and `AnthropicClient`, move too, into `client_opencode.go` and `client_anthropic.go` respectively.

Now, every time I show new code in this post, I'll mention which file it belongs in. That way you don't just understand *what's* being written, but *where* it's supposed to live.

Make sense? Alright, let's start with step one.

## Building the Registry

Now let's transform the code above step by step. We won't jump straight to the final Registry; instead, we'll build it one step at a time so it's clear what changes and why we need it.

### Step 1: Define a Contract via an Interface

Look again at the two clients we wrote earlier. `OpenCodeClient` and `AnthropicClient` both have a `Chat` method with the same signature:

```go
Chat(prompt string) (string, error)
```

We can define an interface as a contract for both of them. Create a file called `contract.go` and add this interface:

```go
type LLMService interface {
	Chat(prompt string) (string, error)
}
```

This interface says that anything with a `Chat` method matching this shape can be used as an `LLMService`.

`OpenCodeClient` and `AnthropicClient` both already have that method, so they automatically satisfy the `LLMService` interface. We don't need to change either client or declare any special relationship between them.

This is what lets a Registry store different clients inside a single map:

```go
map[string]LLMService
```

The Registry doesn't need to know whether a value is a `*OpenCodeClient`, a `*AnthropicClient`, or something else entirely. It just needs to know that whatever's in there satisfies the `LLMService` contract.

### Step 2: Create the Registry Struct

Now we need somewhere to store the providers we have available.

Create a new file, `registry.go`, and add a new struct called `LLMRegistry`:

```go
type LLMRegistry struct {
	services map[string]LLMService
}
```

We also need a constructor to create a Registry. Still in `registry.go`:

```go
func NewLLMRegistry() *LLMRegistry {
	return &LLMRegistry{
		services: make(map[string]LLMService),
	}
}
```

At this point, we've only built the "storage." No providers are in it yet. If we create a Registry:

```go
registry := NewLLMRegistry()
```

we can picture it simply as this:

```text
Registry

services:
    {}
```

There's nothing in it yet. Next, we need a way to actually put providers into the Registry.

### Step 3: The Register Method

Add a `Register` method to `LLMRegistry`, still in `registry.go`:

```go
func (r *LLMRegistry) Register(name string, service LLMService) {
	r.services[name] = service
}
```

This method takes two things:

* `name`: the key we'll use to look it up later, e.g. `"opencode"`.
* `service`: the client we want to store.

One thing to note: `Register` above will happily overwrite an existing entry if the same key gets registered twice. That's fine for what we need here, but if you need something stricter, it's easy to change this to return an error when the key is already taken.

Before we move on to `main()`, let's clean up the two clients we wrote together in one file earlier. The content stays exactly the same, they're just moving house.

`OpenCodeClient` moves to `client_opencode.go`. While we're at it, let's drop the `var openCodeClient = ...` package-level variable too. We'll create the instance directly inside `main()` instead of as a global:

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

Same goes for `AnthropicClient`. It moves to `client_anthropic.go`, no global variable either:

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

Now we can create the Registry and register our providers in `main.go`:

```go
func main() {
	openCodeClient := NewOpenCodeClient("dummy-api-key-opencode")
	anthropicClient := NewAnthropicClient("dummy-api-key-anthropic")

	registry := NewLLMRegistry()

	registry.Register("opencode", openCodeClient)
	registry.Register("anthropic", anthropicClient)
}
```

Look at what's happening: first, we explicitly create both client instances, then a new instance from the `NewLLMRegistry()` constructor, and only then do we register both through the `Register` method. This is where the real shift happens. We used to do the provider mapping inside the `Chat` function; now it's moved into `Register`.

`main.go` ends up genuinely clean. It's just wiring: create the client instances, create the Registry, then register which provider goes under which key. No implementation details of `OpenCodeClient` or `AnthropicClient` are hiding in this file, and there's not a single global variable that other files depend on.

That means `Chat()` no longer needs to know which client to call for which provider. But we still need one thing: how do we get a provider back out of the Registry?

### Step 4: The Resolve Method

We already have a method for putting providers in: `Register`.

Now let's add a method called `Resolve` to fetch a provider by name, still in `registry.go`:

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

Now we can fetch the provider we want, still in `main.go`:

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

Now, if `"anthropic"` was registered earlier, `Resolve` returns `anthropicClient`. If that provider can't be found, `Resolve` returns an error instead.

### Step 5: Use the Registry Inside Chat

We now have every piece we need. We've already created a Registry instance and registered our providers when the app starts up. Before all this, the `Chat` function had to know about every provider directly:

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

Now we can turn it into this. This code still lives in `main.go`:

```go
func Chat(registry *LLMRegistry, provider string, prompt string) (string, error) {
	service, err := registry.Resolve(provider)
	if err != nil {
		return "", err
	}

	return service.Chat(prompt)
}
```

Notice what changed. The `Chat()` function no longer has:

```go
switch provider {
	// ...
}
```

It also doesn't need to know that `"opencode"` means `OpenCodeClient`, or that `"anthropic"` means `AnthropicClient`.

That information is now the Registry's responsibility, and the `Chat()` function only does two things:
1. Ask the Registry to find the provider.
2. Call `Chat()` on that provider.

Now imagine we add a third provider, say Gemini. We'd still need to create a `GeminiClient` in its own file, `client_gemini.go`, then register it in `main.go`. Its implementation will inevitably look different from the other providers, things like model selection, how it talks to the provider, and other logic:

```go
registry.Register("gemini", geminiClient)
```

We no longer need to touch the `Chat()` function to add a new provider like `"gemini"`. All our focus stays on the new provider's own code, without touching anything that already works, which also means less risk of regression bugs. This is the core benefit I wanted to get across with the Registry pattern in this example:

> **Callers don't need to know the mapping between a provider's name and its implementation. The Registry owns that mapping.**

Now think about it this way: if a third provider like Gemini shows up tomorrow, what actually changes?

To make this concrete, here's a direct comparison:

| Scenario | Before (switch, 1 file) | After (Registry, split files) |
|---|---|---|
| Adding the Gemini provider | Edit `main.go`: add a new client **and** add a new `case` in `Chat` | Create a new `client_gemini.go`, then add one line, `registry.Register("gemini", geminiClient)`, in `main.go` |
| Old files touched | `main.go`, the `Chat` function changes | None. `registry.go` and the other `client_*.go` files stay untouched |
| Regression risk | Yes, since working code gets edited | Minimal, since old code isn't touched at all |

Look at the second row. That's the whole point: with a Registry, a new provider is purely an **addition**, not a **change**. This benefit only becomes real once the code is actually split across files like the structure we laid out earlier, not just because the `Chat` function got shorter.

## Dispatcher: Where Decisions Get Made

It turns out a Registry isn't enough on its own. A Registry answers **which provider is available, and how do I find it?**

But it shouldn't be answering **which provider should this mode use?** or **what happens if the primary provider fails?** or **should traffic get redirected to a specific provider when something's wrong?**

Rules like that are routing, or policy. This is where a component we'll call a **Dispatcher** comes in.

One thing worth clarifying: Dispatcher isn't a formal design pattern with a fixed structure that we're implementing here. In this post, Dispatcher is just the name for a component responsible for routing and orchestration.

In our design, the Dispatcher uses the Registry to find whichever provider it has already decided on.

### Analogy: The Receptionist

Picture an office.

The **Registry** is the Contacts app. We say:

> Find me Anthropic's contact.

Contacts hands back that info. It doesn't decide what you do with the number afterward.

The **Dispatcher**, on the other hand, is the receptionist. We say:

> I need to reach the provider for reasoning mode.

The receptionist knows that `reasoning` mode routes to Anthropic. Then they look up Anthropic through the Registry. If there are rules like a kill switch or a fallback, the Dispatcher is the one enforcing them too.

### Step 1: The Dispatcher Struct

Create a new file, `dispatcher.go`, and add this simple struct:

```go
type Dispatcher struct {
	registry        *LLMRegistry
	defaultProvider string
	killSwitch      bool
}
```

These fields cover the Dispatcher's basic needs:

* `registry` → where it looks up providers.
* `defaultProvider` → the fallback provider.
* `killSwitch` → a condition that forces traffic to a specific provider.

In this simplified example, we're using `defaultProvider` for multiple purposes at once. In a real system, the default provider, the fallback target, and the kill-switch target won't necessarily be the same thing.

### Step 2: Determine the Provider from the Mode

Add a `resolveProvider` method, still in `dispatcher.go`. Let's start with the simplest version:

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

Notice we're still using a `switch`.

And that's **fine**.

Here, the `switch` is just doing a simple mapping from mode to provider name: `"fast"` to `"opencode"`, `"reasoning"` to `"anthropic"`. It has no idea how to actually call `OpenCodeClient` or `AnthropicClient`.

That's different from the `switch` back at the start of this post, which knew directly which implementation to call.

Now let's add the kill-switch rule:

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

When `killSwitch` is on, the mode gets ignored and the request goes straight to `defaultProvider`.

### Step 3: The Chat Method

Now let's connect the Dispatcher to the Registry through a `Chat` method, still in `dispatcher.go`. And don't forget: the old `Chat` function in `main.go`, the one that took `registry`, `provider`, and `prompt`, is no longer used and can be deleted:

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

If the primary provider fails and we actually want a fallback, that policy can live in the Dispatcher too.

For example:

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

This example is deliberately simplified. In a production system, not every error automatically deserves a fallback.

A `400 Bad Request` or a `401 Unauthorized` probably doesn't warrant trying another provider, while a timeout, certain rate limits, or a `5xx` might genuinely make sense to handle with a fallback.

That level of detail is part of your application's policy, and it can get a lot more complex than this.

### Step 4: Hide the Details from the Caller

`SessionService` is the layer the rest of our app uses to start a chat, so it deserves its own file: `session.go`.

```go
type SessionService struct {
	dispatcher *Dispatcher
}

func NewSessionService(dispatcher *Dispatcher) *SessionService {
	return &SessionService{dispatcher: dispatcher}
}

func (s *SessionService) Reply(mode string, prompt string) (string, error) {
	return s.dispatcher.Chat(mode, prompt)
}
```

`SessionService` doesn't need to know about OpenCode, Anthropic, the Registry, the kill switch, or fallback. All it knows is that there's a Dispatcher that can handle chat.

### Step 5: Wire It All Together in main.go and Run It

By now, `Chat()` has changed shape several times: from taking just a `prompt`, to taking a `provider` and a `prompt`, to explicitly taking a `registry` back in Step 5 of building the Registry. Now it's time for the final version: through the Dispatcher and `SessionService`, called from a single `main.go` that actually runs.

Here's the complete `main.go`. We'll build a program that takes a mode and a prompt as terminal arguments:

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

(To keep the focus on Registry and Dispatcher, I'm skipping argument validation on purpose. In a real app, you'd obviously want to check this before accessing it.)

Now let's run it with `fast` mode:

```bash
$ go run . fast "Apa itu Registry Pattern?"
[OpenCode] Reply for: "Apa itu Registry Pattern?"
```

And with `reasoning` mode:

```bash
$ go run . reasoning "Jelaskan konsep Dispatcher"
[Anthropic] Reply for: "Jelaskan konsep Dispatcher"
```

It's clear now: `fast` mode gets routed by `resolveProvider` to `"opencode"`, the Registry finds its `OpenCodeClient` instance, and `Chat()` gets called. Same story for `reasoning`, which ends up at `AnthropicClient`. Not a single part of `main.go` knows any of this detail. Dispatcher and Registry handle it all.

If Gemini later comes in as a third provider, say, dedicated to a `creative` mode because it's better suited for brainstorming or creative writing, only two things change:

```go
// dispatcher.go: add one case
case "creative":
	return "gemini"
```

```go
// main.go: add one registration line
registry.Register("gemini", geminiClient)
```

```bash
$ go run . creative "Berikan 3 ide nama startup AI"
[Gemini] Reply for: "Berikan 3 ide nama startup AI"
```

`main()`'s structure doesn't change at all. The arguments are still `mode` and `prompt`, `session.Reply(...)` is still called the exact same way. A new provider shows up, but the call site never changes.

## Registry vs. Dispatcher

A question might come up:

> Why not just combine the two?

Because Registry and Dispatcher answer different questions.

|                | Registry                              | Dispatcher                          |
| -------------- | -------------------------------------- | ------------------------------------ |
| Question       | "What implementations are available?" | "Which one should I use right now?" |
| Responsibility | Lookup mechanism                       | Routing and policy                  |
| Example        | `Resolve("anthropic")`                 | `mode = reasoning → anthropic`      |
| Fallback       | No                                     | Yes                                  |
| Kill switch    | No                                     | Yes                                  |

The flow looks roughly like this:

1. **`LLMService`**: the contract every provider has to satisfy.
2. **`OpenCodeClient`** and **`AnthropicClient`**: implementations of that contract.
3. **Registry**: stores and looks up providers by key.
4. **Dispatcher**: decides which provider to use, and enforces policy like kill switches and fallback.
5. **`SessionService`**: just calls `dispatcher.Chat(...)`.

With this separation, `SessionService` never needs to know which provider is actually being used.

## Registry Isn't a Go-Only Concept

A Registry is a concept, not a Go-specific feature. The implementation varies depending on the language and the need. What matters is the core idea:

> **An implementation gets registered, and can later be found again by a key.**

A pretty close example is right there in Go's own `database/sql` package.

Database drivers get registered under a name, and the app uses that name when opening a connection:

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

Conceptually, `"postgres"` is used to find a driver that was registered earlier.

The internal implementation of `database/sql` is obviously more involved than the simple Registry we built, but the idea is the same: **a name is used to find an available implementation**.

## When to Use a Registry, and When Not To

Like any pattern, a Registry isn't something you always need. There are a few conditions worth weighing.

### Use a Registry when:

**1. There are multiple interchangeable implementations.**

For example, you have several AI providers your app needs, an SMS provider for sending OTPs, or a few payment gateways like Midtrans, Stripe, and Xendit.

**2. The implementation is chosen at runtime.**

For example, the provider choice might depend on:

* configuration
* a database
* user input
* the request type
* a specific mode

**3. The list of implementations is genuinely likely to keep growing.**

If new providers are likely to keep showing up, a Registry helps keep callers from having to change every time.

### Don't use a Registry when:

**1. There's only one implementation and no real need to add more.**

Not every piece of code needs an extra layer of abstraction.

**2. The choice is simple and fixed.**

If the provider is known upfront and doesn't need to be picked at runtime, plain old dependency injection can be simpler.

**3. Your `if/else` or `switch` is still small and clear.**

Don't turn simple code into something more complex just because you know a pattern exists.

If I had to sum it up:

> **If you need to pick an implementation by key at runtime, the list of options is likely to grow, and the selection logic is starting to need its own abstraction, a Registry is worth considering.**

Otherwise, if the choice is simple, plain `if/else`, `switch`, or regular dependency injection is probably the cleaner option.

From my own experience: for the LLM case, I used a Registry because I already knew Anthropic was coming in as a second provider.

But for STT (*speech-to-text*) and TTS, which only had one provider at the time, I didn't bother with a Registry.

That's pure YAGNI (*You Aren't Gonna Need It*).

If a second provider genuinely becomes necessary later, that's when the abstraction can be added.

## Wrapping Up

We started with simple code:

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

With two providers, code like this is still perfectly fine.

The problem starts once providers keep piling up, and every new one forces us back into editing the same function.

We then moved that mapping into a Registry:

```text
Registry
    │
    ├── "opencode"  → OpenCodeClient
    ├── "anthropic" → AnthropicClient
    └── "gemini"    → GeminiClient
```

Now the caller just says:

```go
registry.Resolve("anthropic")
```

The Registry answers:

> **What implementation is available, and how do I find it?**

While the Dispatcher answers:

> **Which implementation should be used right now, and what policy should apply?**

The flow becomes: a request comes in to the Dispatcher, the Dispatcher decides which provider to use, the Registry finds its implementation, and only then does `Chat()` get called on that provider.

And one thing worth remembering above all:

> **`switch` or `if/else` isn't the enemy.**

When the routing is small and clear, both can be the better solution. A Registry only starts to earn its keep once you genuinely have multiple interchangeable implementations, need runtime selection, and the lookup mechanism starts paying for itself.

Don't reach for Registry and Dispatcher just because you know the pattern's name. A pattern should **reduce complexity**, not add another layer of abstraction just because you know that layer exists.

If you have anything to add or correct, let's talk in the comments.
Hope this helps 👋