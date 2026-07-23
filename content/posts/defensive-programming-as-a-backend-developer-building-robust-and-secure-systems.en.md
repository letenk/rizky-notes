---
title: "Defensive Programming as a Backend Developer: Building Robust and Secure Systems"
date: 2024-11-03T11:42:30+07:00
tags: ["tips", "backend engineering"]
cover:
  image: "/images/defensive-programming-as-a-backend-developer-building-robust-and-secure-systems/cover.webp"
description: "Defensive programming techniques for backend developers — input validation, error handling, and building robust, secure systems."
slug: "defensive-programming-as-a-backend-developer-building-robust-and-secure-systems"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

In backend application development, ensuring application security and stability is an absolute must. The backend is the backbone of the application, which is responsible for handling business logic, storing data, and interacting with external systems. Writing strong and reliable code is essential for all software developers. However, no matter how careful we are, bugs and unexpected situations can still occur. This is where Defensive programming comes into play.

Defensive programming is a coding practice aimed at ensuring that software functions correctly even when unexpected events or invalid input occur. For a backend developer defensive programming is an important approach, which allows us to design applications that can survive bad input, system errors, and external attacks. 

In this article, we will discuss several points on how defensive programming can be applied to increase the resilience of backend applications and provide examples in the Golang language to illustrate how to implement it, although its implementation is not tied to just one language.

## Validate Input Data from External Sources
External sources such as third-party API users, or databases can be entry points for various attacks, especially if the input provided is invalid or malicious. Attacks such as SQL injection, cross-site scripting (XSS), and command injection often occur due to input that is not properly filtered. We can apply the following points to overcome this:

### 1. Input Sanitation 
Any input from outside sources must be sanitized. Input sanitization is the process of ensuring that data received from users or external sources is cleaned of malicious characters before it is used in an application, especially when the data is used for SQL queries, system commands, or output to the browser. For example, if you receive string input from a form, avoid entering that input directly into a SQL query without sanitization. What you can do is use **prepared statements** to prevent SQL Injection. With prepared statements, user input is not allowed to be part of the SQL command, but rather as a safe parameter. For example, we have input to check the user's *username* and *password* for login and our backend system, rather than directly running the following query:

```javascript
// direct query with parameters
query := fmt.Sprintf("SELECT * FROM users WHERE username = '%s' AND password = '%s'", "john_doe", "12345")
rows, err := db.Query(query)
```

It is better to use prepared statements, where we ensure that user input is never executed as part of a SQL query. Input is considered a value, not part of a SQL command as follows:

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

### 2. Data Type Validation 
Data type validation is the process of checking and ensuring that the type of data received is as expected before further processing. This is important to prevent errors in data processing and also reduce security risks, such as SQL injection and XSS. For example, if an API expects an email format, validate that the input is indeed an email format. The following is an example of carrying out the data type validation process in Golang:

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
Here, we use a regular expression to validate whether the input corresponds to the correct email format.

### 3. Whitelist & Blacklist 
**Whitelist** and **blacklist** are two approaches used to validate and manage user input in applications. Both have the goal of improving security and preventing exploits, but they work and are applied differently.

#### - whitelist
Whitelisting is an approach where only certain data or characters are **allowed** to be processed by the application. In the context of user input, a whitelist determines what is considered "safe" and allows only input that meets those criteria. It is often used to validate very specific data. Example of use:

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

In the example above, the use of `regex ^[a-zA-Z0-9_-]+$` is used to limit the characters allowed in the username. Only letters, numbers, _ (underscore), and - (dash) are accepted.

#### - Blacklist
Blacklisting is an approach where you specify certain data or characters that are **not allowed**. In this case, all other inputs are considered safe, except those on the blacklist. This approach is often used when it is difficult to predict all possible safe characters. Example of use:

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
Here, we use a blacklist to check whether the input contains unwanted characters. If present, the input is considered invalid.

### 4. Input Limit
Input Limit is the practice of limiting the amount of data or size of input that can be accepted from users in an application. The goal is to prevent excessive use of resources, improve application performance, and protect against potential attacks, such as Denial of Service (DoS) or SQL injection. The following is an example of its implementation:

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

Of course, some of the points above can be applied to any programming language and can be used using libraries that are widely available so that the data validation process is easier than carrying out a manual validation process like some of the examples above.

## Data Security
Sensitive data such as personal information or credentials must always be protected, both when stored and when transferred. We can apply the following points to overcome this:

### 1. Data encryption 
Sensitive data such as passwords or credit card information should always be encrypted. Encryption involves the process of converting readable data (plaintext) into an unintelligible form (ciphertext) using an encryption algorithm and encryption key. The main purpose of encryption is to ensure that even if data falls into the wrong hands, it cannot be read without the right key to decrypt it.

Use modern encryption algorithms such as **AES** and avoid outdated algorithms such as **MD5** or SHA1.

### 2. Use HTTPS 
Use HTTPS (Hypertext Transfer Protocol Secure) to ensure that all data transferred between the client and server is properly encrypted. HTTPS (Hypertext Transfer Protocol Secure) is a secure version of HTTP, which is a protocol used for data transfer between a browser (client) and a server. 

HTTPS works by adding a layer of security by using TLS (Transport Layer Security) or SSL (Secure Sockets Layer) to encrypt data sent over the network. This is especially important in backend development because it prevents third parties (such as hackers) from reading or modifying data that is being sent between the client and the server.

### 3. Tokenization & Masking 
In certain cases, tokenization or masking can be used to reduce the risk of a data breach. **Tokenization** and **Masking** are two data security techniques frequently used in backend applications to protect sensitive data.

Tokenization is the process of replacing sensitive data (such as credit card numbers) with meaningless values ​​called “tokens.” The original data is stored separately and can only be linked back to the token through a system that has access to the system that manages the token. This is important because if a data leak occurs, but the leaked data is only a token and not real data, the risk of attack is greatly reduced because the token has no value outside the system context. For example, in online payments, credit card numbers can be replaced with tokens so that card data does not actually need to be stored on the server.

Data masking is the process of hiding part of sensitive data so that only some parts are visible. This is often used in user interfaces or reports to prevent complete information from being exposed. How does this work? data masking protects sensitive information when displayed to users who do not need to know the full data. Even if the data displayed in the UI or logs is stolen, the masked data only shows partial information, so the risk is lower. An example that we may often see is hiding part of a credit card number in a display like this: `**** **** **** 1234`.

## Error Management & Logging
In building a system errors will always occur, but how we handle them determines whether our application can survive without causing damage or loss of data. Good logging helps track problems in production systems and detect suspicious patterns. Here are some points that we do:

### 1. Handle Errors Appropriately 
Don't just catch errors without taking action or providing information. It's best to log errors and provide a good fallback to avoid a total crash. For example, if the connection to the database fails, try retrying or switching to read-only mode temporarily.

### 2. Granular Logging 
Log critical events such as API requests, authentication failures, or database connection problems with a sufficient level of detail. However, remember to avoid recording sensitive information such as passwords in logs.

### 3. Log Splitting 
Use different log levels such as INFO, WARNING, and ERROR to separate different types of events. More granular logs make it easier for developers to diagnose problems.

For a more complete discussion and examples of **Error Management & Logging** I have written an article about this here: [Observability - Why logging is important](https://dev.to/tentanganak/observability-why-logging-its-important-104b) 

## Avoid mistakes elegantly
Crashing is a response that occurs when the system encounters an unexpected error. However, errors can be avoided or minimized through better handling. The strategies below can help us handle errors elegantly to make the system more resilient.

### 1. Timeouts
When backend applications access external services or wait for resources such as databases, it is important to use timeouts. Timeouts prevent code from being "stuck" in an indefinite waiting state, thereby maintaining application performance and avoiding deadlocks. The following is an example of implementing a timeout when accessing an external service:

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

In this example, we set a 5 second timeout for HTTP requests. If the service doesn't respond within 5 seconds, the app won't hang, and we can handle the error by announcing the failure.

### 2. Resource Existence Checks
Before accessing other resources such as databases, files or APIs, always verify their existence and availability. This prevents applications from making requests to resources that may not exist, which saves time and avoids unnecessary errors. Here's an example of how we check:

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
When the system carries out certain processes, we might get an error. For example, our system sends an OTP during the authentication process. When the OTP sending process fails or gets an error, we can use a fallback mechanism or backup method, such as diverting OTP sending to our backup provider.

By implementing the strategies above, we can reduce the frequency of errors that cause crashes, maintain application performance, and improve the overall user experience.

## Secure and Solid API Design
We can see that APIs function as the backbone for applications or web that require dynamic data resources. However, because they are considered such a critical backbone, APIs are often the main target for attacks, so it is important to ensure APIs that are secure and difficult to exploit.

### 1. Authentication & Authorization 
Use strong authentication (such as OAuth or JWT) to ensure that only authorized users or systems can access our APIs. Implement granular access control to limit the access rights of clients who access the API that we have. This can prevent clients with malicious intent from accessing the resources we have.

### 2. Rate Limiting and Throttling
Rate Limiting and Throttling are critical to controlling API usage and preventing misuse or overloading. The application of rate limiting is also to prevent attacks such as DDoS or excessive exploitation of the API by users or bots, and also to maintain the stability and availability of the API for all users. Rate Limiting works by regulating the volume of requests from API clients within set intervals, ensuring fair and equal access to the resources we have.

## Efficient Use of Resources
Backend systems often have to manage various resources such as database connections, files, or memory. Efficient resource management is critical to maintaining application stability and performance. By handling resources wisely, we can avoid problems such as "resource leaks" and system failures. The following are several strategies that can be used for efficient use of resources:

### 1. Connection Pooling 
Connection Pooling is a technique where a number of connections to a service such as a database are recycled rather than creating a new connection every time an application needs access. With connection pooling, applications do not need to create expensive new connections every time there is a request, but instead use existing connections in the "pool".

Why is connection pooling important?, Every connection to a database or other service has overhead in terms of time and memory. Continuously opening and closing connections can drain system resources. By recycling existing connections, applications can respond more quickly and reduce the load on external services such as databases.

### 2. File & Memory Management 
When dealing with files or memory allocation, it is important to ensure that resources are released after they have been used. If not, it could cause resource leaks which result in the application running out of memory or file handles.

For example, in Golang we can use the built-in function **defer** to ensure files, connections, or other resources are always released after they are finished using them. Then also check for errors (error handling) when working with resources, so that if a problem occurs, the resource can still be released correctly. 

Here's a little code snippet of how we use defer to turn off an operation and close it after a function has finished carrying out a process:

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
By using defer, we ensure that the file will be closed as soon as the function exits, whether it is successful or an error occurs. This helps prevent file handle leaks that can occur if you forget to close a file.

### 3. Asynchronous Operations 
In situations where the application performs heavy tasks or slow I/O operations (such as accessing large files, or calling external APIs), running it **Asynchronously** is an efficient way to avoid blocking the application. Where applications that perform synchronous operations can be hampered while waiting for heavy tasks to complete, which will affect overall performance. So the use of asynchronous processes is sometimes important because it allows applications to continue other tasks while waiting for I/O or network tasks to complete.

Let's say we have a case where we clear the Redis cache after data input. The cache deletion process can be run asynchronously so as not to slow down the main process. This means the application does not need to wait for Redis to respond before continuing to execute the next code. As a result, the application remains responsive and efficient.

# Conclusion
As a backend developer, defensive programming is an essential approach to ensuring that the applications we build can handle errors, invalid input, and external threats properly. By practicing the techniques above, we can ensure that the backend applications we build are more secure, stable and resilient in facing various unexpected situations. Defensive programming helps us create systems that not only function well, but are also able to survive the worst conditions.

Of course, there may be many other important points that are not discussed above, you can add or provide suggestions in the comments column above.

Hopefully it's useful 👋.

# Reference
- [The Code Knight: Mastering the Craft of Defensive Programming](https://www.conquer-your-risk.com/2023/07/20/the-code-knight-mastering-the-craft-of-defensive-programming/)
- [Defensive Programming in C#: Best Practices and Examples
](https://medium.com/c-sharp-programming/defensive-programming-in-c-best-practices-and-examples-f1edeb676e97)
- [The Art of Defensive Programming](https://medium.com/@arumukherjee121/the-art-of-defensive-programming-62c6f22b2758)
