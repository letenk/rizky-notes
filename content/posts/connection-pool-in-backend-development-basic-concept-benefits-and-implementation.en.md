---
title: "Connection Pool in Backend Development: Basic Concept, Benefits, and Implementation"
date: 2025-02-06T09:46:35+07:00
tags: ["go", "golang", "tips"]
cover:
  image: "/images/connection-pool-in-backend-development-basic-concept-benefits-and-implementation/cover.webp"
description: "What a connection pool is, why it matters for performance, and how to configure one in backend applications."
slug: "connection-pool-in-backend-development-basic-concept-benefits-and-implementation"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

##### Photo by <a href="https://unsplash.com/@buying_thyme?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Christine Tutunjian</a> on <a href="https://unsplash.com/photos/assorted-color-balloons-7oLuQ0ZEQ9A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
      
Connection Pooling is a mechanism that creates and manages a pool of database connections that can be used by applications. This concept is important in managing connections to the database with the aim of optimizing resource use and improving the performance of applications that frequently interact with the database.

Instead of creating a new connection every time it is needed (which is expensive in terms of time and resources), connection pools allow applications to borrow/use existing connections and return them to the pool when they are finished using them. That's why it's called **connection pool**.

## Why connection pool is important ?
The important question is why is connection polling important? why not just make 1 connection to be used alternately. Let's discuss 1 by 1 why connection pooling is important.

### Better performance
Opening a new connection to the database can take time because it goes through several processes such as authentication, network settings and so on. With a connection pool, applications can avoid this process because connections are already available if needed.

### Resource savings
Without a pool, if the application gets 100 requests, the application will create 100 new connections. This can burden the database server which is always busy carrying out the initialization process. The connection pool can limit the number of connections used simultaneously, this keeps the database server load stable.

### Scalability
Connection pooling helps applications manage load well when the application scales up. With good connection pooling settings, we can handle a large number of requests coming at the same time and ensure the application remains responsive.

### Load configuration
The connection pool can be configured with a maximum number of connections according to needs. So it can prevent applications from flooding connections to the database.

## How to Works ?
Now that we understand why connection pooling is important to use, we will now discuss how connection polling works.

### Pool Initialization
The first time an application is run, it makes a certain number of connections to the database (for example, 10 connections). This number is called **Pool size**. This connection will be idling waiting to be used.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7u7gb5oktn39jso9udvo.png)

### Connection usage

When the application needs a connection to the database it no longer creates a new connection, instead it requests a connection from the pool. If a connection is available in the pool, it will be assigned to the application. If no connections are available, the application may have to wait until a connection is released and returns to the pool after being used by another process.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2x21w8mjh95ab3s9pq4k.png)

### Restore connection
Once an application has finished using a connection, it will not close the connection. Instead, the connection is returned to the pool to be used again by the next request.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6u4x5nhh1zypyds0hmjt.png)

## The common main parameter in connection pool
The following are some of the main parameters that are commonly used when creating a connection pool. I will try to explain in detail followed by analogies that can help us understand each context better.

### Pool Size
We can determine the number of connections provided in **Pool Size**. If all connections are used then when there is a request to use the connection it will queue up waiting for an available connection or it will fail if the queue is full.

For example, if we set the max pool size to 10, only 10 active connections can be used by the application. If an 11th request comes, this request will wait for a connection from the pool that is already in use. The analogy is like this:

- Imagine there is a **parking lot,** if all the slots are full, a new car that wants to enter **(connection request)** has to wait until another car comes out **(idle connection).**
- If we want to accommodate more cars, we have to build more parking slots (increase **MaxPoolSize)** so that we can accommodate more cars. But there are increased maintenance costs (**server resources).**

### Minimum Connections
Minimum connection is the minimum number of connections that will be created the first time the application is run. This is a connection that will always be on standby waiting to be used, even when there are no requests. For example, if we set **minimum pool size 5,** the pool will ensure there are always 5 idle connections. Even if there are no active requests, the pool will still make sure these 5 connections are open to reduce the connection opening time when a request comes in.

This is useful for anticipating erratic loads, for example suddenly our application gets a lot of requests and connections are available ready to use without having to open a new connection. The analogy is like this:

- Imagine that a restaurant has 10 chairs that are deliberately not arranged in the dining room, but are stored in the warehouse. But when there are a lot of visitors, we need extra chairs, we don't need long to buy them at the shop. But just need to go to the warehouse and pick up the 10 chairs needed for use.

### Idle Connection
Idle connections are the number of connections that are not being used but remain open in the pool, which can also be called "idle connections". This parameter is usually set by:

- **Maximum Idle Time**: How long an idle connection is maintained before being closed.
- **Maximum Idle Connections**: The number of idle connections allowed to remain in the pool.

For example, if we set **MaxIdleConnections = 5,** the pool will maintain a maximum of 5 idle connections. If there are more idle connections it will be closed. If there are no new requests within a certain time (for example, 10 minutes), these idle connections may be removed to save resources. The analogy is like this:

- In the supermarket there are 5 cashiers, 3 cashiers are serving buyers (active connection) and 2 cashiers are on standby in their positions without a queue of buyers (idle connection) and are ready whenever a buyer comes.
- Supermarkets have a rule, "If the cashier is on standby for 30 minutes without a customer, then they can go home." These 30 minutes are idle time.

### Timeout
We can set the maximum time the application waits for a connection from the pool before it fails (error). This is done to prevent applications from waiting too long for available connections from the pool, if the pool is busy or full. This is useful to prevent the application from waiting too long for a connection which will cause the application to "freeze" where it is better to give an error to the user, so that it can provide information to the user to try again rather than resulting in a freeze request.

For example, if we set a timeout of 5 seconds, if a request does not get a connection, after waiting for 5 seconds it will receive an error. The point to remember is that a timeout that is too short can cause the request to fail too quickly and a timeout that is too long means the request will hang for too long. The analogy is like this:

- We are queuing to buy at a restaurant (request), but we can't wait for the queue (timeout limit). And we decided to leave the restaurant (return error).

### Max lifetime
Lifetime determines **how long a connection can live before being reset or closed** by the pool, even if the connection is active. Usually used to avoid old connection problems or update configurations to ensure connections remain fresh and reliable.

For example, if we set **max lifetime** 20 minutes, any connection that has been used for 20 minutes will be **closed and removed from the pool** and will be replaced by a new connection that will be created.

This is important because sometimes some database servers have a time limit for old connections which can prevent stale connections** problems. The analogy is like this:

- An office has 3 security officers per shift. Each officer works a maximum of 8 hours (Max Lifetime)
- After 8 hours, the officers must be replaced with new officers, even though the previous 5 officers are still in good condition, there are no problems and work is running smoothly. But it prevents officers from getting tired and losing concentration when checking incoming visitors (requests).

## Implementation
Now we will try to implement a connection pool using Golang. Note the following code:

```javascript
package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	dsn := "username:password@tcp(127.0.0.1:3306)/dbname?parseTime=true"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to open connection to database: %v", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(time.Minute * 10)
	db.SetConnMaxIdleTime(time.Minute * 5)

	err = db.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	fmt.Println("Successfully connected to database!")

	rows, err := db.Query("SELECT id, name FROM users")
	if err != nil {
		log.Fatalf("Failed to run query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			log.Fatalf("Failed to read query results: %v", err)
		}
		fmt.Printf("ID: %d, Name: %s\n", id, name)
	}

	if err := rows.Err(); err != nil {
		log.Fatalf("Error after iteration: %v", err)
	}
}

```

We can focus on the following code snippet:

```javascript
db.SetMaxOpenConns(10)
db.SetMaxIdleConns(5)
db.SetConnMaxLifetime(time.Minute * 10)
db.SetConnMaxIdleTime(time.Minute * 5)
```

Here's the explanation:

- **SetMaxOpenConns(10)**: Determines the maximum number of connections that can be open simultaneously.

- **SetMaxIdleConns(5)**: Determines the maximum number of idle connections maintained in the pool.

- **SetConnMaxLifetime(time.Minute * 10)**: Determines how long a connection can live before being reset or closed.

- **SetConnMaxIdleTime(time.Minute * 5)**: Determines how long an idle connection can be maintained before being closed.

## Conclusion
The use of connection pooling is very important, as this can anticipate the application running smoothly when handling an erratic load of incoming requests. But the right settings must also be implemented, so that the use of connection pooling can be more optimal.

If you have additions or corrections to the discussion above, let's discuss it in the comments column. Hope it helps 👋.
