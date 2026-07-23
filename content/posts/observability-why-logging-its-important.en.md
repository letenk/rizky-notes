---
title: "Observability: Why Logging Is Important"
date: 2024-07-28T09:06:36+07:00
tags: ["tips", "backend engineering"]
cover:
  image: "/images/observability-why-logging-its-important/cover.webp"
description: "What logging is, why it matters for observability, and how to do it well in modern backend systems."
slug: "observability-why-logging-is-important"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

In an increasingly complex digital era, observability is the main key in managing modern software systems. One of the most important pillars of observability is **logging**. Let's explore why logging is so important and how to make optimal use of it.

## What is Logging?

Logging is the process of recording activities and events in a system. This includes a variety of information, from error messages, user activity, to system performance. Think of logging as an airplane 'black box' for your system - always recording what's happening, ready to provide insights when needed.

## Why is Logging So Important?
Here are some points that can be considered why logs are important:

1. Faster Problem Solving
   With good logs, development teams can identify root causes without guesswork. It's like having a treasure map when looking for bugs!

2. Security Improvements
   Logs can be your 'spy' in detecting suspicious activity. Security teams can respond to threats more quickly, such as having a fire department always on standby.

3. Performance Analysis
   Through logs, you can identify bottlenecks in the system. It's like having a personal doctor for your app's health.

4. Understanding User Behavior
   User activity logs provide valuable insight into how the product is used. It's like having a personal assistant constantly observing and reporting customer preferences.

## Best Practices in Logging

To maximize the benefits of logging, below are some of the best practices that can be carried out:

### Determine the Appropriate Log Level

Using these appropriate log levels can help you filter information quickly, such as sorting logs by urgency.

The following is an example of displaying logs using the Golang language with various levels. Here we use the  [Logrus](https://github.com/sirupsen/logrus).

```go
package main

import (
	"github.com/sirupsen/logrus"
)

func main() {
	log := logrus.New()
	log.SetLevel(logrus.DebugLevel)

	log.Debug("Starting app..")
	log.Info("User has successfully logged in")
	log.Warn("CPU usage exceeds 80%")
	log.Error("Failed to save data to database")
	log.Fatal("A critical error occurs, the application will stop")
}
```
The following is an explanation for the several log levels above:

- **DEBUG**: Detailed information for debugging, usually only enabled during development.
- **INFO**: General information about the normal flow of the application.
- **WARNING**: For situations that have the potential to become problematic in the future, but do not stop the application.
- **ERROR**: An error that causes a specific function to fail, but the application is still running.
- **FATAL**: Serious error that may cause the application to stop.

### Include relevant contextual information

Each log entry should provide enough context to understand what happened. This could include:
- Timestamp.
- Transaction or session ID.
- User ID (if relevant).
- Function or module name.
- Relevant input data (be careful with sensitive data).
- Stack trace for errors

This is an example of code when printing a log, including context information that will help us trace.
```go
package main

import (
	"github.com/sirupsen/logrus"
	"time"
)

type UserAction struct {
	UserID    int
	Action    string
	Timestamp time.Time
}

func main() {
	log := logrus.New()
	log.SetLevel(logrus.DebugLevel)
	
	// Use format json
	log.SetFormatter(&logrus.JSONFormatter{})

	// Dummy data
	action := UserAction{
		UserID:    12345,
		Action:    "checkout",
		Timestamp: time.Now(),
	}

	// Print log
	log.WithFields(logrus.Fields{
		"user_id":    action.UserID,
		"action":     action.Action,
		"timestamp":  time.Now().Format(time.RFC3339),
		"session_id": generateSessionID(),
		"module":     "payment_processor",
		"ip_address": "192.168.1.100",
	}).Error("Payment failed")

}

func generateSessionID() string {
	return "sess_abc123"
}
```

We can see that we have included several elements of context information that can make it easier for us to carry out tracing in the future. What are the conveniences in question, namely that we can search logs based on `level`, for example the error level in the code example above, and also based on time and others based on the information we enter.

### Use consistent formatting

A consistent log format makes parsing and analysis easier, especially if using automated tools (regarding tools, will be discussed below). Formatting also makes it easier for us to search logs based on criteria, for example log level, message, or time. Example format:

```javascript
[TIMESTAMP] [LEVEL] [MODULE] [MESSAGE]
```

Or JSON format for easy parsing like the results in the code example above:

```go
{
    "action": "checkout",
    "ip_address": "192.168.1.100",
    "level": "error",
    "module": "payment_processor",
    "msg": "Payment failed",
    "session_id": "sess_abc123",
    "time": "2024-06-26T20:59:02+07:00",
    "timestamp": "2024-06-26T20:59:02+07:00",
    "user_id": 12345
}
```

### Implement log rotation to manage file size

Log rotation prevents log files from becoming too large and difficult to manage. This involves:

- Limits the size of log files.

- Create new log files periodically (e.g. daily or weekly).

- Archive or delete old log files.

- Using tools such as logrotate on Linux or a logging framework that supports rotation.

### Consider privacy and security in logged information

Security and privacy are very important in logging:

- Do not log sensitive data such as passwords or credit card information.

- Mask or encrypt personal data if necessary.

- Ensure access to log files is restricted to authorized personnel only.

- Implement a retention policy to delete old logs according to company policies and regulations.

## Tools for Monitoring and Analyzing Logs

As system complexity increases, the need for sophisticated tools to monitor and analyze logs also becomes increasingly important. Here are some popular tools that can help with observability and log analysis:

1. Grafana
   Grafana is an open-source platform for visualizing our log data. These tools can be integrated into various data sources including logs. Enables the creation of customized and interactive dashboards. Suitable for real-time visualization of metrics and logs.

2. New Relic
   New Relic is an all-in-one observability platform
   Provides log analysis, tracing, and metrics in one place. There are also AI features to detect anomalies and correlate problems.
   Suitable for monitoring large-scale applications and infrastructure.

3. Loki
   Loki is a lightweight and cost-effective log aggregation system. Loki is designed to work well with Grafana
   Uses label-based indexes, similar to Prometheus
   Ideal for organizations already using Prometheus and Grafana.

4. AWS CloudWatch Logs Insights
   This integrated log analysis service from AWS enables querying and analysis of logs from various AWS services.
   Feature to detect slow queries in RDS and other database services
   Easy integration with other AWS services.

## Conclusion
Logging is not just an additional feature, but a vital component in building a reliable system. With proper implementation, logging can become your supersensor - providing full visibility into system operations, helping prevent problems before they occur, and speeding resolution when problems arise.

So, start investing in good logging practices today. Remember, in the world of complex technology, good logs can be a guiding light in the midst of a storm!

If you have additional information, please enter it in the comments column below.

## Reading References
- [Github Repository](https://github.com/letenk/logging_with_logrus)

- [Application Logging and its importance](https://medium.com/ula-engineering/application-logging-and-its-importance-c9e788f898c0)

- [Why is Log Management Important?](https://graylog.org/post/why-is-log-management-important/)

- [10 Observability Tools in 2024: Features, Market Share and Choose the Right One for You](https://www.zenduty.com/blog/observability-tools/)

- [Top 20 Best Log Analysis Tools and Log Analyzer (Pros and Cons)](https://cloudinfrastructureservices.co.uk/top-20-best-log-analysis-tools-and-log-analyzers/)
