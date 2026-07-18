---
layout: post
title: Using the Go profiler (pprof)
date: '2022-03-28T16:53:00.002'
author: Paper
categories: golang
tags: [go, golang, pprof]
---

## Profile via net/http/pprof

```go
import (
	"net/http"
		_ "net/http/pprof"
)

func main() {

	 go func() {
			log.Println(http.ListenAndServe("0.0.0.0:6060", nil))
		}()

   ... do something ...

}
```

## CPU profile (collects data for 30 seconds)

```bash
go tool pprof http://xxxx:6060/debug/pprof/profile
```

## Heap memory (returns current memory info)

```bash
go tool pprof http://xxxx:6060/debug/pprof/heap
```
