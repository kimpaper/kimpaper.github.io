---
layout: post
title: Disabling the cache when testing MariaDB queries
date: '2015-12-15T14:55:00.001'
author: Paper
tags: [mysql,mariadb,cache]
header-img: "img/post-bg-05.jpg"
categories: etc
---

When tuning queries, run this first to see uncached results.

```sql
RESET QUERY CACHE;
```
