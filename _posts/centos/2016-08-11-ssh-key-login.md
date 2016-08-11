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

터미널에서 아래

```bash
ssh-keygen -t rsa -C "name"
```

위에 키를 생성시키고 나서 아래에서 public 키를 조회 한다

```bash
cat ~/.ssh/id_rsa.pub
```

public키를 서버내에 `~/.ssh/authorized_keys` 파일에 line추가 시킨다
```
vi ~/.ssh/authorized_keys
```

물론 다른 PC 에서는 여전히 안된다

