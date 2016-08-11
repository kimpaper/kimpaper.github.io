---
layout: post
title: ssh key를 이용한 로그인
date: '2016-08-11T16:07:00.001'
author: 페이퍼
tags: centos ssh macos
header-img: "img/post-bg-02.jpg"
---

macOS 에서 ssh key를 지정하여 서버로 비밀번호 타이핑 없이 바로 로그인 하게 하자  
~~평소엔 보안때문에 안해놓는다.~~ 

## macOS
### 키 생성
```bash
ssh-keygen -t rsa -C "name"
```

### public key를 조회
```bash
cat ~/.ssh/id_rsa.pub
```

## 대상 Server
### public key를 `~/.ssh/authorized_keys` 파일에 추가
```
vi ~/.ssh/authorized_keys
```


 

