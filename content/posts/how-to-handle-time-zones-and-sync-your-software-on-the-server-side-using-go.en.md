---
title: "How to Handle Time Zones and Sync Your Software on the Server Side Using Go"
date: 2024-10-01T09:36:41+07:00
tags: ["go", "golang", "tips"]
cover:
  image: "/images/how-to-handle-time-zones-and-sync-your-software-on-the-server-side-using-go/cover.webp"
description: "How to correctly handle time zones and keep timestamps consistent on the server side using Go."
slug: "how-to-handle-time-zones-and-sync-your-software-on-the-server-side-using-go"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

When your application starts on a large scale, the increase in users will increase. What is very likely to happen is that the user's location is not only in the same area, it could be in another area that has a different time zone. So as a Backend developer, things related to handling time zone differences are very important to think about.

I recently came across an issue involving time zones. Let's be honest, dealing with dates and times is one of the most complicated areas a human being has to deal with. And this was an opportunity for me to learn how to properly handle dates and times on the server side.

In this article, I will share my experience on how I handle time zone differences on the server side as a Backend developer. Maybe if someone is willing to correct and provide additional input that would be valuable for me.

## About Time Zone
Time zones are a standard time division system used throughout the world to organize and standardize the measurement of time. This concept emerged as a response to the need for global time coordination, especially along with developments in communications and transportation technology.

The basic principle of time zones is the division of the earth into 24 zones. Each time zone is generally one hour different from the zone next to it. The main reference for time zones is Greenwich Mean Time (GMT) or Coordinated Universal Time (UTC), which is at the zero degrees longitude line that passes through Greenwich, England.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/12w82kobmce87b5rm7zz.png)
*Illustration by [Hellerick](https://commons.wikimedia.org/wiki/User:Hellerick) from [Wikimedia Commons](https://en.wikipedia.org/wiki/File:Standard_World_Time_Zones.png)*

A small example is when the clock shows 12:00 noon in Jakarta, in New York the time shows 00:00 or midnight. This means that while Jakartans are enjoying lunch, New Yorkers are just starting their new day. From here you can certainly imagine the importance of handling time zones correctly in building an application.

## Timezone handling on the server side
After we have seen the explanation above, now we will go into the points that can be done when our server application receives a request from a client that accesses our API to handle its time zone.

In this article, I will discuss several approaches to handling time zones on the server side. Here I will use code examples in the Golang (Go) language. Golang has a time package for working with time-related data which is considered quite complete. Here are some points that we will discuss:

- How to save date to DB
- Conversion of user's local time 
- Testing and Validation

## How to save date to DB
The first thing we will discuss is which time we will save in the database, for example we have an ecommerce application that does flash sales, where our application is already on an international scale. 

When a user processes a purchase transaction in America or if the user is in Indonesia, the user will send their different local time to the server. The question is, will our database store time data according to the user's local time? If the answer is yes, it is likely a complicated problem when we want to retrieve the data or for example the admin wants to do data processing, which user makes the earliest transaction.

To overcome this, the best practice is to store transaction times in the **UTC** (Coordinated Universal Time) time zone which is the primary time standard for clocks and time settings. Here is the application of the time to UTC.

```javascript
package main

import (
	"fmt"
	"time"
)

func main() {

	now := time.Now()
	fmt.Printf("Local time: %s\n", now)
	
	nowInUTC := now.UTC()
	fmt.Printf("UTC time: %s\n", nowInUTC)

}
```

Let's see the meaning of the code above.

First, in the `now := time.Now()` code line, this line uses the `Now()` function from the **time** package to get the current time based on the system's local time zone. The result is stored in the current variable.

Then, in the `nowInUTC := now.UTC()` line, here we convert the local time (now) to UTC time using the `UTC()` method. The results are stored in a new variable nowInUTC and this time can be stored on the server, where it is hoped that developers can avoid ambiguity and errors that may arise due to time zone differences between servers and users in various regions with different time zones.

Here are the results if we run the code above:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4qn7wuwxtycrtko6mrl2.png)

But this is not always the best solution that you should use. There may be some points you can keep in mind in certain use cases, one of which is is it true that our users come from different time zones? If it's not possible, perhaps storing the time in UTC will add complexity to your code.

### Change time to user locale
At the discussion point above, we have agreed to store user time data in one location, namely UTC. Now how users can see accurate time according to their location. An example of the discussion above is a flash sale on an e-commerce application that we have, where users also want to know information about which user made the first transaction. So at this point, converting the time we store in the database to the user's local time is another important thing that we should not ignore.

The approach I take is that the server side always asks the client to send the timezone on the user side. This can be done on the request side where the client sends a header with the key `timezone` and has the user's timezone value. For example, Indonesia has 3 time zone divisions, namely WIT(+9), WITA(+8), WIB(+7). Where each zone has a difference of 1 hour. If previously on our server we stored UTC time at 00.00, then on the WIT side it was at 09.00, then on the WITA side it was at 08.00 and WIB at 07.00.

Here's an example code to handle the above case:

```javascript
package main

import (
	"fmt"
	"time"
)

func ParseTimezoneFromString(tz string) *time.Location {

	if len(tz) > 0 {

		t, err := time.Parse("2006 -07:00", fmt.Sprintf("2007 %s", tz))

		if err != nil {

			panic(err)

		} else {

			return t.Location()
		}
	}

	return time.Now().Location()
}

func main() {

	timeServerInUTC := "2024-08-04 00:00:00"
	nowInUTC, err := time.Parse("2006-01-02 15:04:05", timeServerInUTC)
	if err != nil {
		panic(err)
	}

	fmt.Printf("UTC time: %s\n", nowInUTC)

	witLocation := ParseTimezoneFromString("+09:00")

	nowInWIT := nowInUTC.In(witLocation)
	fmt.Printf("WIT time: %s\n", nowInWIT)

	witaLocation := ParseTimezoneFromString("+08:00")

	nowInWITA := nowInUTC.In(witaLocation)
	fmt.Printf("WITA time: %s\n", nowInWITA)

	wibLocation := ParseTimezoneFromString("+07:00")

	nowInWIB := nowInUTC.In(wibLocation)
	fmt.Printf("WIB time: %s\n", nowInWIB)

}
```

*credit to [dikac](https://dev.to/dikac) for create this function ParseTimezoneFromString*

Let's understand the meaning of the code above:

First, we create a function `ParseTimezoneFromString`, where this function is used to find the time location based on the argument `tz` or timezone of the given user location. If the string value `tz` is valid, we will convert the string's timezone using the `time.Parse` function to convert the string to a time object, then extract the location (timezone) from that object. And we also handle if the string is empty or parsing fails, the function returns the local time zone of the system.


```javascript
func ParseTimezoneFromString(tz string) *time.Location {

	if len(tz) > 0 {

		t, err := time.Parse("2006 -07:00", fmt.Sprintf("2007 %s", tz))

		if err != nil {

			panic(err)

		} else {

			return t.Location()
		}
	}

	return time.Now().Location()
}
```

Next we also define time data in the following string format: 

```javascript
timeServerInUTC := "2024-08-04 00:00:00"

nowInUTC, err := time.Parse("2006-01-02 15:04:05", timeServerInUTC)
if err != nil {
    panic(err)
}
```

You can think of this as the timing data that we get from the server. And parse it into a time object.

Next, we try to find the user's accurate location based on the `ParseTimezoneFromString` function that we previously created based on the string argument that we defined. What needs to be paid attention to is that this string argument is what is meant by the value of the `timezone` header sent by the client via the incoming request. 

We can use the location we get from the `ParseTimezoneFromString` function to convert or shift the time we get from the server to the user's local time. We can do this using the `In` function which is also included in the time package which we can see in the following code snippet:

```javascript
nowInWIT := nowInUTC.In(witLocation)
nowInWITA := nowInUTC.In(witaLocation)
nowInWIB := nowInUTC.In(wibLocation)
```

If we run it, we will get the time that corresponds to the timezone location that we defined.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5hj0uau3rtv595ibtvol.png)

### Testing and Validation
The final point is no less important, namely testing and validation. When the development process often causes developers to make unexpected mistakes, testing and validation are always important.

In the discussion of point 2 above, the `ParseTimezoneFromString` function has been important in handling our time zones. Repeated testing and validation are important to make our applications get results that meet our expectations.

For testing, it is recommended to use unit tests, where testing will be carried out on the smallest unit with several scenarios that can be added. The more scenarios there are, the less likely it is to handle these time differences.

## Conclusion
Handling time zones can indeed be tricky for backend developers. However, it's important to remember that every challenging task we overcome contributes to our growth and skill improvement. Properly managing time zones is not just a technical necessity, it ensures accuracy in scheduling and provides a smooth experience for our application users across different regions.

The points shared in this article about storing times in UTC, converting to user local times, and implementing robust conversion functions are starting points in tackling this complex issue. However, I acknowledge that there may be shortcomings or areas for improvement in the approaches discussed. This is why additional input and suggestions from the developer community are invaluable.

I sincerely hope that the insights and code examples provided in this article will be helpful to you in the future when you encounter time zone-related challenges in your projects. Remember, the goal is to create applications that work seamlessly for users, regardless of their geographical location.

Let's continue this discussion in the comments section below. I'd love to hear about your experiences with handling time zones, any challenges you've faced, or alternative approaches you've found effective. Your insights could be extremely valuable to me and other readers facing similar issues.

Thank you for reading, and I hope this article proves useful in your development journey. Let's keep learning and improving together! 👋

# Reading References
- [Time zone
](https://en.wikipedia.org/wiki/Time_zone)
- [What Is a Time Zone?](https://www.timeanddate.com/time/time-zones.html)
- [How to Handle Timezones and Synchronize Your Software with International Customers](https://www.freecodecamp.org/news/synchronize-your-software-with-international-customers/)
- [Dealing with timezones in web development](https://dev.to/jesusantguerrero/dealing-with-timezones-in-web-development-2dgg)
- [Working with Dates and Times in Go: Handling Timezones and Formatting](https://clouddevs.com/go/dates-and-times/)
