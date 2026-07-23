---
title: "Basic Concept & Benefit of API Gateway"
date: 2025-03-27T09:57:41+07:00
tags: ["tips", "backend engineering", "System Design"]
cover:
  image: "/images/basic-concept-and-benefit-of-api-gateway/cover.webp"
description: "The basic concepts and benefits of an API Gateway in modern microservices architecture."
slug: "basic-concept-and-benefit-of-api-gateway"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

##### Photo by <a href="https://unsplash.com/@soymeraki?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Javier Allegue Barros</a> on <a href="https://unsplash.com/photos/silhouette-of-road-signage-during-golden-hour-C7B-ExXpOIE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

Api gateways are an important component in modern software architecture, especially in systems that implement microservices. Api Gateway acts as the main gateway to receive all incoming API requests. With this role, API Gateway simplifies API management and improves overall system performance and security.

Using API Gateway helps build systems that are **scalable** and **easy to maintain**. As system complexity increases, API Gateway plays a critical role in managing effective integration and communication between various backend services and clients.

In this article, we will learn **basic concepts** and **benefits** from using API Gateway. The hope is that this article can provide new understanding or strengthen the insights you already have.

# What is API Gateway ?
An API Gateway is an API management tool that sits between a client and a collection of backend services. It acts as an intermediary, routing client requests to the appropriate backend service required to fulfill them and then returning the corresponding response Additionally, an API Gateway provides several important features such as **load balancing, circuit breaking, logging, authentication, and caching**, making it a crucial component in modern API architecture.

In today's fast-paced world of digital development, efficiency is everything, which is why API Gateways have become essential in modern software projects. Acting as a **central point of control for API** across microservices architecture handling thousands of concurrent API calls efficiently.

# How does API Gateway work ?
Api Gateway work with receive request from internal and external, called "API Calls". API Gateway as software layer that manage traffic for routes them ti appropriate API and then delver the responses to the particular user or devic thath made the request.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7rliw8ixuw1ie048w7pc.png)

This the explain API Gateway Workflow from image above:
1. A client (browser, mobile app, or another service) sends an API request.
2. The API Gateway processes the request with routes the request to the correct backend service.
3. The backend service processes the request and sends a response.
4. The API Gateway modifies or enhances the response.
5. Finally, the response is returned to the client.

# Benefits of API Gateway
Using an API Gateway can bring several benefits such as **enhance performance**, **improve security**, **easier maintenance of multiple backend services**. Here are some key benefits of using an API Gateway:

## 1. Enhanced security
An API Gateway enforce authentication and authorization policies, ensuring that only authorized users can access backend services. Additionally, it can help mitigate security threats through:
- **Rate limiting** to prevent API abuse and DDoS attacks.
- **IP whitelisting and blacklisting** to restrict access.
- **TLS encryption** to secure communication between clients and services.

## 2. Better monitoring and visibility
An API gateway can collect metrics and other data about the requests and responses, providing valuable insights into the performance and behavior of the system. This can help to identify and diagnose problems, and improve the overall reliability and resilience of the system.

## 3. Data Format Transformation
An API Gateway can convert request and response or data data format (e.g., JSON to XML). Making it easier to manage data formats when needed.

## 4. API Versioning and Backward Compatibility
An API Gateway can manage multiple versions of an API, allowing developers to introduce new features or make changes without breaking existing clients. This enables a smoother transition for clients and reduces the risk of service disruptions.

## 5. Enhanced Error Handling
An API Gateway can provide a consistent way to handle errors and generate error responses, improving the user experience and making it easier to diagnose and fix issues.

# Drawbacks of Impelementation API Gateway
In addition to having many benefits that we get when we implement API Gateway, on the other hand we also have disadvantages in using it, here are some points:

## 1. Single Point of Failure
Since the API Gateway acts as a central access point for all API requests, it can become a single point of failure if not properly managed. If the gateway experiences downtime, it could disrupt the entire API ecosystem. 

## 2. Additional Complexity
Integrating an API Gateway introduces an additional layer of complexity to your architecture. It requires careful configuration, monitoring, and maintenance. If not managed efficiently, it can slow down development and increase operational overhead.

## 3. Increased Latency
An API Gateway processes incoming requests before forwarding them to the appropriate services, which can introduce latency. This delay may impact overall system performance, especially if multiple processing steps (such as authentication, logging, and rate limiting) are involved.

## 4. Cost
Operating an API Gateway, particularly in high-traffic environments, can add significant costs to your infrastructure. Expenses may include hosting, licensing fees, or managed API Gateway services from cloud providers.

# Simple Example of an API Gateway
To implement an API Gateway, you can use a popular API Gateway such as **Nginx**, **Kong**, **KrakenD**, and many more popular choices. However, our goal for the topic is to understand how API Gateway works. So, we can understand by simply building a simple API Gateway using golang. Let's begin.

> For the complete code you can see following repository: [Click me](https://github.com/letenk/simply-api-gateway)

## The structure Folder
We can create a simply the API Gateway following the structure folder:

```go
├── Makefile
├── api_gateway
│   ├── go.mod
│   ├── go.sum
│   └── main.go
├── service_cart
│   ├── go.mod
│   ├── go.sum
│   └── main.go
├── service_order
│   ├── go.mod
│   ├── go.sum
│   └── main.go
└── service_product
    ├── go.mod
    ├── go.sum
    └── main.go
```

## The rate limitter function code
First, we can create a file with the name **main.go** in the **api_gateway** folder which contains: 
```go
package main

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

func rateLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Expiration: time.Second * 60,
		Max:        5,
	})

}
```

The **rateLimiter()** function is used to limit the number of requests per client. Where this rate limiter is useful for **Preventing abuse & DDoS**, **Controlling API traffic**, **Protecting backend services from overload**. 

With the configuration `Expiration: time.Second, Max: 5`, each client can only make 5 requests per second. If this limit is reached, the client will receive error **HTTP 429 Too Many Requests**. After 1 second, the limit will be reset and the client can send requests again.

## The proxy function code
Second, we also create a function with the name **reverseProxy**:
```go

package main

import (
	// ... other import libraries
        "log"
        "github.com/gofiber/fiber/v2/middleware/proxy"
)

// ... rate limitter function

func reverseProxy(target string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		url := target + c.OriginalURL()
		return proxy.Do(c, url)
	}
}

```

The **proxy(target string)** function is used to forward requests (proxy requests) from clients to other backend servers specified in the target. This function returns a **middleware handler (fiber.Handler)** that can be used on Fiber.

We also see **c.OriginalURL()** returns the path and query parameters of the original request sent by the client. For example, if the client accesses http://localhost:3000/api/orders?id=10, then:
```json
/api/orders?id=10
```

And last we return **proxy.Do(c, url)** is used to forward requests to the destination url. This url is a combination of target and c.OriginalURL(), so all incoming requests will be directed to another server with the same path. In this way, requests that enter the API Gateway will be automatically directed to the appropriate backend service without the client knowing.

## Then main function code
And latest file we create **main** function, is a entrypoint of this application. In this case, it acts as an API Gateway. The code is like this:

```go
package main

import (
	// ... other import libraries
        "github.com/gofiber/fiber/v2/middleware/logger"
)


func main() {
	app := fiber.New()

	app.Use(logger.New())

	// Implement rate limitter
	app.Use(rateLimiter())

	// Implement proxy
	// Redirect request to service product
	app.Use("/product", reverseProxy("http://localhost:5001"))

	// Redirect request to service order
	app.Use("/order", reverseProxy("http://localhost:5002"))

	// Redirect request to service cart
	app.Use("/cart", reverseProxy("http://localhost:5003"))

	port := ":3000"
	log.Printf("Starting API Gateway in port %s", port)
	log.Fatal(app.Listen(port))
}
```

We can focus on the code part: 
```go
	// Implement rate limitter
	app.Use(rateLimiter())
```

This code applies rate limiting to the entire application with Fiber's limiter middleware. This middleware is attached with **app.Use(rateLimiter())**, which means it will apply to all routes. The function **rateLimiter()** returns the rate limiter middleware we created earlier with **limiter.New()**.

And also for some of these code:
```go
    // Implement proxy
	// Redirect request to service product
    app.Use("/product", reverseProxy("http://localhost:5001"))

	// Redirect request to service order
	app.Use("/order", reverseProxy("http://localhost:5002"))

	// Redirect request to service cart
	app.Use("/cart", reverseProxy("http://localhost:5003"))
```

This code uses the **reverseProxy** function we created earlier, which will forward the request to the appropriate service.

As we know in the **The structure Folder** section, we also have several service folders that will be directed according to incoming requests from clients.

> For the complete code you can see following repository: [Click me](https://github.com/letenk/simply-api-gateway)

## Let's run it
To run it there are several ways, if Makefile is installed on your computer you only need to run the command below in the terminal on root folder project:

```go
make run
```

If not you can run it one by one by going into all folders and starting to run with the command:
```go
cd service_product && go run main.go

cd service_order && go run main.go

cd service_cart && go run main.go

cd api_gateway && go run main.go

```

If successful, you can see display like this:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1psq6jg2zj57oyj0w1jx.png)

From the image above you can see several services running on their respective ports.

```go
Service API Gateway running on port 3000

Service product running on port 5001

Service order running on port 5002

Service cart running on port 5003
```

Here is the advantage of using API Gateway, imagine you have more than 3 services and on the client we have several features that must be run simultaneously. Do we have to define the url with each specific port? of course it is very troublesome. And later one of the services must change its url address, of course it is even more troublesome to have to refactor here and there on the client side.

But with API Gateway you only need to know the url on the API Gateway and define the appropriate url, let's try to access several services via the API Gateway url only. Run this command:
```
curl http://localhost:3000/product/1
curl http://localhost:3000/order
curl http://localhost:3000/cart
```

And the result is you can access multiple services with just one URL.

<!-- add image curl result -->
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8iidjtkylpt2i98zptoi.png)

And in the log you can see that the api gateway actually forwards the request to the service that corresponds to the address being called.

<!-- add image log -->
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kii6jugw66v2gow0mehi.png)

And I give a challenging task, try to make more requests than the maximum rate limiter that we have set in the **rateLimiter** function until you get the error **HTTP 429 Too Many Requests**.

# Conclusion
API Gateway acts as the primary gateway to manage request traffic in a microservice system. With rate limiting, APIs are more secure from abuse such as DDoS. Reverse proxies allow requests to be directed to the appropriate backend service without changing the client side, increasing flexibility and ease of management. In addition, API Gateway also supports caching, logging, monitoring, and other security features such as authentication & authorization. With proper implementation, API Gateway can improve the security, performance, and scalability of the overall system.

However, implementing API Gateway also has some drawbacks that we must be aware of such as a single point of failure, additional complexity, increased latency, and higher operational costs. Despite these drawbacks, a well-implemented API Gateway remains essential for scalable and secure microservice architectures.

Hopefully this article can help to improve understanding or recall what is already known. If you have additions or corrections to the discussion above, let's discuss it in the comments column. Hopefully it helps 👋.

## Reading References
- [What is an API Gateway?](https://konghq.com/blog/learning-center/what-is-an-api-gateway)
- [What does an API gateway do?](https://www.redhat.com/en/topics/api/what-does-an-api-gateway-do)
- [Advantages and disadvantages of using API gateway](https://www.designgurus.io/course-play/grokking-system-design-fundamentals/doc/advantages-and-disadvantages-of-using-api-gateway)
- [Deciphering the Decision: Should You Use an API Gateway or Not?](https://medium.com/@ftieben/deciphering-the-decision-should-you-use-an-api-gateway-or-not-6f371ad4ce00)
