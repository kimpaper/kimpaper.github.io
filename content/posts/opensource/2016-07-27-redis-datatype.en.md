---
layout: post
title: redis data types
date: '2016-07-27T14:32:00.002'
author: Paper
categories: opensource
tags: [redis]
url: /en/2016/07/27/redis-datatype/
---

## Redis Data Type Summary
There are plenty of good resources on the internet, but I'm writing this up as study

Testing is done with `redis-cli`, but for real use I'd probably use an `api library` for the language 

#### Overview
[http://redis.io/topics/data-types-intro](http://redis.io/topics/data-types-intro)

#### Examples
[http://redis.io/topics/data-types](http://redis.io/topics/data-types)

### Strings
- Stores characters, numbers, etc. as values
- No separate type on save (no distinction between numbers and strings)
- Numbers can be stored too, and atomic counter operations like `incr`, `incrby`, `decr`, `decrby` are possible on them
- `incrby`, `decrby` add or subtract a specific number, used like `incrby "test_strings" 10` 

```bash
# redis-cli
127.0.0.1:6379> set "test_strings" 1
OK
127.0.0.1:6379> get "test_strings"
"1"
127.0.0.1:6379> incr "test_strings"
(integer) 2
127.0.0.1:6379> get "test_strings"
"2"
127.0.0.1:6379>
```

### Lists
- Stores a list as the value
- lrange: reads values, where -1 means fetch everything

```bash
127.0.0.1:6379> lpush "test_lists" 1
127.0.0.1:6379> lpush test_lists 2
127.0.0.1:6379> lrange test_lists 0 -1
1) "2"
2) "1"
127.0.0.1:6379> rpush test_lists 3
(integer) 3
127.0.0.1:6379> lrange test_lists 0 -1
1) "2"
2) "1"
3) "3"
```

- Seems like you could implement a queue with `rpop`

```bash
127.0.0.1:6379> rpop test_lists
"3"
127.0.0.1:6379> lrange test_lists 0 -1
1) "2"
2) "1"
```

- With `rbpop` it seems you could even implement sequential distributed work. Similar to `rpop` but if there's no data it waits in a `block` state until data comes in 

### Sets
- Holds the value as a set
- Lists allow duplicates but sets don't

```bash
127.0.0.1:6379> sadd test_sets 1
(integer) 1
127.0.0.1:6379> smembers test_sets
1) "1"
127.0.0.1:6379> sadd test_sets 1 2 3 4
(integer) 3
127.0.0.1:6379> smembers test_sets
1) "1"
2) "2"
3) "3"
4) "4"
```

### Hashes
- Hashes hold a key/value list as the value

```bash
127.0.0.1:6379> hset htest username hi
(integer) 1
127.0.0.1:6379> hset htest userpwd asdf
(integer) 1
127.0.0.1:6379> hget htest username
"hi"
127.0.0.1:6379> hgetall htest
1) "username"
2) "hi"
3) "userpwd"
4) "asdf"
```

- hget returns (nil) if there's no value

```bash
127.0.0.1:6379> hget htest temp
(nil)
```

- Changing the value for a hashkey 

```bash
127.0.0.1:6379> hget htest userpwd
"asdf"
127.0.0.1:6379> hset htest userpwd 1234
(integer) 0
127.0.0.1:6379> hget htest userpwd
"1234"
```


### Sorted sets
- Holds the value as a set
- Like `Sets`, no duplicates
- Stored together with a score, and sorted by score
- Seems usable like a list, with the advantage of being sorted

```bash
127.0.0.1:6379> zadd test_ssets 1 1
(integer) 1
127.0.0.1:6379> zadd test_ssets 2 2
(integer) 1
127.0.0.1:6379> zrange test_ssets 0 -1
1) "1"
2) "2"
```

- Don't use a string for the score

```bash
127.0.0.1:6379> zadd test_ssets "a" 2
(error) ERR value is not a valid float
```

- Since duplicates aren't allowed, inserting the same value overwrites the existing data's score and the order changes

```bash
127.0.0.1:6379> zadd test_ssets "0" 2
(integer) 0
127.0.0.1:6379> zrange test_ssets 0 -1
1) "2"
2) "1"
```


### Bitmaps
- Stores bit values
- Can store 2^32 (4.2 billion) bit values in 512MB
- Seems good for storing boolean option values (like whether each member has viewed a notice)

```bash
127.0.0.1:6379> setbit test_bits 0 1
(integer) 0
127.0.0.1:6379> getbit test_bits 0
(integer) 1
127.0.0.1:6379> setbit test_bits 0 0
(integer) 1
127.0.0.1:6379> getbit test_bits 0
(integer) 0
```
