---
title: "Mastering Enums in Go"
date: 2024-12-31T15:18:47+07:00
tags: ["go", "golang", "tips"]
cover:
  image: "/images/mastering-enum-in-go/cover.jpg"
description: "How to implement clean, type-safe enums in Go, even though the language has no built-in enum support."
slug: "mastering-enums-in-go"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

##### *Image by [Hans-Peter Gauster](https://unsplash.com/@sloppyperfectionist) from [Unsplash](https://unsplash.com/photos/stack-of-jigsaw-puzzle-pieces-3y1zF4hIPCg)*
Let's say we are building an E-commerce API that will receive several orders, each order process has several statuses such as *Pending, Processed, Shipped, Delivered, Cancelled*. And our application receives input strings which will be stored in the database, for example the status is Processed, received Process, Processing or something else that causes data inconsistencies. Here Enum has an important role.

In Golang enums unlike other languages ​​such as Java or C# which offer built-in support for enums, Go takes a different approach. In Go, enums are not a native language feature, but developers have several techniques that can be used to achieve similar functionality.

# Understanding Enum
In Golang, enums (short for enumerations) provide a way to represent a set of named constants. Although Go does not have built-in enum types like some other languages, developers can emulate enum-like behavior using constants or custom types. Let's discuss the purpose and syntax of enums in Go:

## Objective
- **Readability and Maintainability**: Enums make code more readable and easy to understand by giving meaningful names to specific values. This increases the maintainability of the code because the purpose of each constant becomes easier to understand.

- **Type Safety**: Enums help enforce type safety by restricting variables to a predefined set of values. This reduces the possibility of runtime errors caused by using incorrect values.

# Create Enums
Here we will discuss step by step how to create an enum in Golang, so that it is easy to understand at each stage we will explain the meaning of the code we write.

## Create a New Type
The first thing we will do is create a new type for the enum we need. The method is quite easy, we only need to use the keyword *type* and followed by the name of the type here with the name **StatusOrder** and the type here we define the type **unsigned integer** like this:

```javascript
type StatusOrder uint
```

Well, just make it easy.

## Define constant ENUM

With the new type that we have created, now is the time for us to define some of the order statuses that we have with constants. Where we define the type **StatusOrder** which we create as the type, like this:

```javascript
const (
	Pending StatusOrder = iota
	Processed
	Shipped
	Delivered
	Cancelled
)
```

Maybe you ask, what is the keyword `iota`? This keyword makes GO assign a value of 0 to the first constant and then increase the value by 1 sequentially for each subsequent constant. This makes it easier for us rather than defining the values ​​manually 1 by 1. About `iota` you can read [here.](https://go.dev/wiki/Iota)

## Function Strings
The next step we will take is to create a String function that is used to represent each string value from the `StatusOrder` enum.

```javascript
func (s StatusOrder) String() string {
	switch s {
	case Pending:
		return "Pending"
	case Processed:
		return "Processed"
	case Shipped:
		return "Shipped"
	case Delivered:
		return "Delivered"
	case Cancelled:
		return "Cancelled"
	default:
		return "Unknown"
	}
}
```

Does the function name have to be `String`? We'll discuss it at the end.

## Testing
Now we will carry out testing, the last code we will write is, function **main** and in it we print the results using the help of the `fmt` package. yes.

```javascript
func main() {

	processed := Processed
	fmt.Printf("Order Status: %s (%d)\n", processed, processed)

	pending := Pending
	fmt.Printf("Order Status: %s (%d)\n", pending, pending)

}
```

Now the complete code can be seen [here.](https://github.com/letenk/golang-enum)

Of course, we carry out the last step and we will see the results like this:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2hufqo3gl51ngx1a7d2n.png)

## Fmt Stringer
The question may arise, `why is the String function also called when we call the enum constant?`. The answer is because we use the `fmt` package. The fmt package explicitly uses the **fmt.Stringer** interface to process types that implement the String() method. So, if you don't use fmt, the String() method will not be called automatically. To explain more, you can explore in more detail [here.](https://pkg.go.dev/fmt#Stringer)

# Conclusion
Although Golang does not offer native enum types, the techniques we learn here are often used in building applications with Golang. And for the type itself, we can freely use other types, not just integer. By utilizing this technique, readability, ease of maintenance and security can be significantly improved.

Maybe there are some points explained above that you feel are lacking, we can discuss them in the comments column below. Hope it helps 👋.

# Reading References
- [fmt](https://pkg.go.dev/fmt#Stringer)
- [Go Wiki: Iota](https://go.dev/wiki/Iota)
- [Enums in Golang: Techniques, Best Practices, & Use Cases](https://reliasoftware.com/blog/golang-enum)
- [Mastering ENUMs in Go](https://itnext.io/mastering-enums-in-go-04bd85ffcf33)
