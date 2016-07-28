---
layout: post
title: redis data type 종류
date: '2016-07-27T14:32:00.002'
author: 페이퍼
tags: redis
---

## Redis Data Type 요약
인터넷상에 수많은 좋은 자료가 있음에도 공부 차원에서 정리를 한다

테스트는 `redis-cli`를 이용해서 하지만 실제 사용은 언어에 맞는 `api library`를 사용 할듯 

#### 개요
[http://redis.io/topics/data-types-intro](http://redis.io/topics/data-types-intro)

#### 예제
[http://redis.io/topics/data-types](http://redis.io/topics/data-types)

### Strings
- value에 문자 숫자 등을 저장한다
- 저장시 별도로 형이 없다 (숫자 문자 구분이 없음)
- 숫자도 저장가능 하다 그리고 숫자에 `incr`, `incrby`, `decr`, `decrby` 같은 atomic counter 연산이 가능
- `incrby`, `decrby` 는 특정 수를 더하거나 뺄때 사용 `incrby "test_strings" 10` 처럼 사용 

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
- value에 list를 저장한다

> lrange: 값을 조회 이때 -1은 모두 가져오라는 뜻

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

`rpop`를 이용하여 queue 구현이 가능할꺼 같다

```bash
127.0.0.1:6379> rpop test_lists
"3"
127.0.0.1:6379> lrange test_lists 0 -1
1) "2"
2) "1"
```

`rbpop`을 이용하면 순차적인 분산 작업도 구현 가능할꺼 같다 `rpop`과 비슷하나 데이타가 없다면 데이타가 들어올때까지 `block` 상태로 대기한다 

### Sets
- value을 set형태로 가지고 있음
- list는 중복이 되나 set은 중복이 안됨

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
- Hashs key/value 목록을 값으로 가진다

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

hget시에 값이 없다면 (nil)을 반환

```bash
127.0.0.1:6379> hget htest temp
(nil)
```

특정 hashkey에 대한 값을 바꿈 

```bash
127.0.0.1:6379> hget htest userpwd
"asdf"
127.0.0.1:6379> hset htest userpwd 1234
(integer) 0
127.0.0.1:6379> hget htest userpwd
"1234"
```


### Sorted sets
- value를 set형태로 가지고 있음
- `Sets`과 마찬가지로 중복은 안됨
- score와 함께 저장되며 score를 기준으로 정렬됨
- list처럼 사용이 될꺼 같으나 정렬된다는 장점이 있는 것 같다

```bash
127.0.0.1:6379> zadd test_ssets 1 1
(integer) 1
127.0.0.1:6379> zadd test_ssets 2 2
(integer) 1
127.0.0.1:6379> zrange test_ssets 0 -1
1) "1"
2) "2"
```

scroe를 문자형으로 쓰면 안된다

```bash
127.0.0.1:6379> zadd test_ssets "a" 2
(error) ERR value is not a valid float
```


중복이 안되면 동일한 value를 넣으면 기존 데이타의 score를 덮어서 데이타 순서가 바뀐다

```bash
127.0.0.1:6379> zadd test_ssets "0" 2
(integer) 0
127.0.0.1:6379> zrange test_ssets 0 -1
1) "2"
2) "1"
```


### Bitmaps
- bit값을 저장해준다
- 512MB 용량으로 2^32(42억)개의 bit값들을 저장할 수 있다
- boolean 옵션값을 저장하는 용도로 사용하면 좋을거 같다 (회원마다 공지 조회여부 등)

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


