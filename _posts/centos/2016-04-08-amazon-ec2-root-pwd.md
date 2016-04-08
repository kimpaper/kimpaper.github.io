---
layout: post
title: AWS EC2서버에 패스워드로 로그인 하기
date: '2016-04-08T11:33:00.002'
author: 페이퍼
tags: aws centos
header-img: "img/post-bg-01.jpg"
---

AWS ec2 서버에는 password로 ssh접근이 안되도록 되어 있다.
아래 파일을 수정하여 접근이 되도록 해보자.

centos 6.5에서 작업한 것이다

```
# 루트계정에 패스워드 지정
passwd root

```


```shell
sudo vi /etc/ssh/sshd_config

# 아래 두개 옵션을 yes로 하고 저장후 닫기 
PermitRootLogin yes
PasswordAuthentication yes

# sshd 재시작 
service sshd restart

```

