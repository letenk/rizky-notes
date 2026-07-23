---
title: "Optimizing Relational Databases for Best Performance in MySQL"
date: 2024-05-07T10:12:24+07:00
tags: ["database", "backend engineering"]
cover:
  image: "/images/optimizing-relational-databases-for-best-performance-in-mysql/cover.webp"
description: "Practical strategies for optimizing relational databases in MySQL — from fixing slow queries and indexing to schema design and caching."
slug: "optimizing-relational-databases-for-best-performance-in-mysql"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

## Introduction

In today's data-driven world, relational databases are the backbone of countless applications. They store and manage critical information, but their performance can significantly impact user experience and overall system efficiency.

This blog post dives into key strategies for optimizing relational databases and ensuring they run at peak performance.

## 🔍 Common Query Mistake That Lead Bottleneck

Before optimizing, in this writing the discussion only covers **Unnecessary Full Table Scans**, **Inefficient Queries**, **Denormalization**, **Insufficient Hardware Resources**. It's crucial to identify performance bottlenecks. Here are some common causes:

#### 1. Unnecessary Full Table Scans
For example, I have table products with a total **_4000000_** rows of data. If your query doesn't have proper indexing, the database may be forced to scan the entire table for each lookup. For example how we can know a table caught the table scan:

Here's, I can try to select the products with name condition
```javascript
SELECT * from products WHERE name = "Produk 300665";
```
And this result I have a total time `0.628s`, it's not a long time.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/m5jk0dgpkvnb8z63ph65.png)

But the surprising thing is when you run `explain` to see what happens:
```javascript
explain SELECT * from products WHERE name = "Produk 300665";
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lamj4lokvfwjmdlbnbnh.png)

See you have scanned a total of `3052749` rows just to find 1 row of data. And look at the `type` column here it has the value `ALL`, meaning you are scanning row by row looking for data. This will be a nightmare when the total data keeps getting bigger.

#### 2. Inefficient Queries
Poorly written SQL queries can take longer to execute than necessary. Here's an example of a poorly written SQL query:

```javascript
SELECT * FROM orders WHERE YEAR(order_date) = 2024;
```
This query retrieves all orders from 2024. However, using the YEAR() function in the WHERE clause makes it inefficient because it prevents the query from using an index on the Order Date column.

Instead, this forces the database to apply the YEAR() function to every row in the Orders table, potentially resulting in a full table scan. For example, the above is a query snippet from the `orders` table, now let's look at the table.

My `orders` has an index on the `order_date` column. Run this query to see a list of available indexes:

```javascript
show indexes from order_table;
```

And see I do have an index for the `order_date` column.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/syu06ri90qtzkzz8h9f8.png)

Now, when you run `explain` to see what happens:
```javascript
explain SELECT * FROM orders WHERE YEAR(order_date) = 2024;
```

It can be seen in the results below, using functions such as YEAR(), can cause the available indexes to not be used.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/k355muxzf9w215iq4f6b.png)

#### 3. Denormalization (Careful Approach)
In some situations, denormalizing your database schema (introducing controlled redundancy) can improve query performance by reducing the need for complex joins. Here's a simple example to illustrate denormalization in MySQL:

Let's consider a hypothetical scenario where you have two tables: users and orders. Below are the Original Normalized Tables:

- users table with structure:

```javascript
user_id (Primary Key)
username
email
```

- orders table with structure:

```javascript
order_id (Primary Key)
user_id (Foreign Key referencing user_id in the users table)
order_date
total_amount
```
Now, let's say you frequently need to retrieve a user's orders along with their username and email. The most common way is to always join the orders table to the users table. Here's an example query:

```javascript
SELECT
    orders.order_id,
    users.name,
    users.email,
    orders.order_date,
    orders.total_amount
FROM
    orders
    JOIN users ON orders.user_id = users.user_id;
```

Joining these tables every time you need this information could become a performance bottleneck, especially if the tables are large.

We will discuss how to denormalize it in the solutions chapter below.

#### 4. Insufficient Hardware Resources
Database performance is highly dependent on factors such as CPU, RAM, and storage capacity. This is very difficult to see without the help of supporting software. We will discuss several solutions below.

## 🎯 Solution

Once you've identified the bottlenecks, you can employ various techniques to streamline your database:

#### 1. Unnecessary Full Table Scans Solution
Indexes act like shortcuts for the database, allowing it to quickly locate specific data. Strategically creating and maintaining indexes on frequently used columns can significantly improve query speed.

**Diving Deeper into Indexing Types**

In the field of database management and optimization, indexing plays an important role in improving query performance. Understanding the different types of indexing is critical to efficient data retrieval and manipulation.

Let's dive deeper into two fundamental types of indexing: single index and compound index, and explore their function with illustrative examples.

##### Single Index:

A single index is a straightforward mechanism in which an index is created on a single column of a database table. It speeds up the search process by organizing data in indexed columns in a structured format, often a B-tree or hash table, allowing for faster retrieval of specific records.

In the example above, we are looking for a name in the products table with a large amount of data in the user table. Remember, to search for 1 row of data, we are required to scan each row. Now let's try adding a single index to the `name` column with the following query:

```javascript
CREATE INDEX product_name_idx ON products (name);
```

To see if an index has been created, run this query:

```javascript
show indexes from users;
```

Yeah, index has created:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wumevv4u601xh3o6p0g3.png)

Now, try again to select the user with name condition:

```javascript
SELECT * from products WHERE name = "Produk 300665";
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yzhit5qflodczo3dww8i.png)

And it's amazing how quickly you can get data when you only take `2 second` to do it, compared to the previous time of `0.628s` seconds.

And the important thing is that we noticed many rows were scanned. Please rerun this query again.

```javascript
explain SELECT * from products WHERE name = "Produk 300665";
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/3cf9u922egsbcb7twmtr.png)

There is only 1 row scanned and you can also observe that we are using an index. Small notes, if you want to remove index can run query:

```javascript
DROP INDEX product_name_idx ON product;
```

##### Composite Index:

Unlike single index, a composite index involves indexing multiple columns within a database table. This type of indexing is particularly advantageous when queries involve conditions on multiple columns or require sorting based on a combination of fields.

Expanding on the previous example, let's say we frequently run a query to retrieve products based on their name, category, and price.

In such a scenario, creating a combined index on the name, category, and price columns will optimize the search process by storing and sorting the data based on these combined criteria.

For example, if we want to search for users with a specific name, category (gadget), and price greater than 400.000, the query would look like this:

```javascript
SELECT *  from products WHERE name = "Produk 300665" AND category = "gadget" and price > 400; 
```
As a result we get 25 data.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ayo1suyhwvsv9e27epij.png)

See the single index that we previously had has no effect on queries with multiple conditions.

If we explain with the single index we previously created, we scan 28 rows:

```javascript
explain SELECT *  from products WHERE name = "Produk 300665" AND category = "gadget" and price > 400; 
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0izphd5859nzbny6g2i6.png)

Obviously 25 lines are obtained but by scanning only 28 lines it is not a big problem. But what we need to remember is what happens if we have a large amount of data. Certainly the number of rows we scan will be much larger than the data we get. And now we try to create a composite index, by combining several columns in 1 index, a query like this:

```javascript
CREATE INDEX product_name_category_price_idx ON products (name, category, price);
```

Now looks, a composite index has created:


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/f0pf6nm6nc7z50xagoxv.png)

To differentiate between single index and composite index, refer to the column `key_name`. A composite index is an index with multiple column_name values that share the same name as another index.

And now, we trying run `explain` query in above for see different result:
 
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bbp8m628wxu4424vb75g.png)

Voila, we only scanned 25 rows for 25 results using the composite index. And the composite index that we have is also included in the list of indexes that we will use.

#### 2. Inefficient Queries Solution
Writing clean and optimized SQL queries is very important. Techniques such as avoiding complex functions in the WHERE clause and using appropriate JOINs can make a big difference. Or as in the example above, use the `YEAR` function to sort the years.

A more efficient version of this query would directly compare the `order_date` column to a date range in 2024:

```javascript
SELECT * FROM Orders WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01';
```

See nothing happens and nothing seems strange. But let's try running an explain query:

```javascript
EXPLAIN SELECT * FROM Orders WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01';
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/y4kpsuzymflj3d5b9g78.png)

Now the index is used, and this is very important when the data we are scanning is very large.

#### 3. Denormalization Solution 
To optimize this scenario using denormalization, you might add redundant columns from the users table into the orders table:

Denormalized Orders Table:

orders table:

```javascript
order_id (Primary Key)
user_id (Foreign Key referencing user_id in the users table)
order_date
total_amount
name (Redundant column from the users table)
email (Redundant column from the users table)
```

By adding name and email columns to the orders table, you eliminate the need for frequent joins when querying user-specific order data. This can significantly improve the performance of queries that retrieve orders along with user information.

Now the query we have only deals with the `orders` table, without joining the users table and has the same results.

```javascript
SELECT
    orders.order_id,
    orders.name,
    orders.email,
    orders.order_date,
    orders.total_amount
FROM
    orders;
```

However, it's important to note that denormalization comes with trade-offs. 

It can lead to data redundancy, increased storage requirements, and potential data inconsistency if updates are not properly managed. Therefore, denormalization should be used judiciously and in situations where the performance benefits outweigh the drawbacks.

Additionally, denormalized data should be kept consistent through proper data management practices such as triggers or application logic.

#### 4. Insufficient Hardware Resources
To monitor Insufficient Hardware Resources performance, consider using a third-party monitoring tool designed specifically for MySQL performance monitoring. 

Tools such as MySQL Enterprise Monitor, Percona Monitoring and Management (PMM), New Relic, or open source solutions such as Prometheus with MySQL Exporter can provide comprehensive monitoring capabilities.

## 📋 Conclusion
Optimizing relational databases is critical to ensuring optimal performance and providing a smooth user experience. By overcoming common bottlenecks such as unnecessary full table scans, inefficient queries, denormalization trade-offs, and insufficient hardware resources, you can significantly improve the speed and efficiency of your MySQL database.

Key strategies include intelligent indexing techniques such as single and composite indexes, writing clean and optimal SQL queries, and judicious application of denormalization when the performance benefits outweigh the disadvantages. Additionally, investing in adequate hardware resources and utilizing monitoring tools can help identify and resolve performance issues proactively.

By implementing these optimization strategies, you can unlock the full potential of your relational database, ensuring lightning-fast data retrieval, efficient data manipulation, and a responsive application experience for your users.

Thank you, hope it helps. 👋
# Reading References
- [Single vs Composite Indexes in Relational Databases](https://user3141592.medium.com/single-vs-composite-indexes-in-relational-databases-58d0eb045cbe)
- [Top 11 MYSQL monitoring tools in 2024 [open-source included]](https://signoz.io/blog/mysql-monitoring-tools/)
- [denormalization](https://www.techtarget.com/searchdatamanagement/definition/denormalization)
