---
layout: post
title: golang profiler 사용 
date: '2022-03-28T16:53:00.002'
author: 페이퍼
categories: golang
tags: [go,golang]
header-img: "img/post-bg-01.jpg"
---

## http prof 를 이용해 프로파일 한다

```go
import (
	"net/http"
		_ "net/http/pprof"
)

func main() {

	 go func() {
			log.Println(http.ListenAndServe("0.0.0.0:6060", nil))
		}()
	
   ... do somthing ...

}
```

## cpu profile (30초동안 데이터를 모은다)

```bash
go tool pprof http://xxxx:6060/debug/pprof/profile
```

## heap memory (현재 메모리 정보를 반환한다)

```bash
go tool pprof http://xxxx:6060/debug/pprof/heap
```

- heap 을 실행하면 아래와 같이 command line (pprof)가 나오는데 프로파일 명령을 넣으면 된다.
- 가령 web 을 치면 윈도우에 경우 web 브라우저에 메모리 Map이 나온다

```bash
Fetching profile over HTTP from http://xxxx:6060/debug/pprof/heap
Saved profile in C:\Users\Paper\pprof\pprof.xxxx.alloc_objects.alloc_space.inuse_objects.inuse_space.013.pb.gz
File: xxxx
Build ID: 8028feec58a6d0902dc3f3c6e08c6ce789b01028
Type: inuse_space
Time: Apr 3, 2022 at 12:17pm (KST)
Entering interactive mode (type "help" for commands, "o" for options)
(pprof) web
```

- web 명령을 사용하려면 `Graphviz` 라는 프로그램을 설치해놔야 한다.
- [Graphviz](https://graphviz.org/)