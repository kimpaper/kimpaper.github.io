---
layout: post
title: Logging into an AWS EC2 server with a password
date: '2016-04-08T11:33:00.002'
author: Paper
tags: [aws,centos]
categories: linux
url: /en/2016/04/08/amazon-ec2-root-pwd/
---

AWS ec2 servers block ssh access with a password by default.
Let's edit the file below to allow it.

Done on centos 6.5

```
# 루트계정에 패스워드 지정
passwd root

```


```bash
sudo vi /etc/ssh/sshd_config

# 아래 두개 옵션을 yes로 하고 저장후 닫기 
PermitRootLogin yes
PasswordAuthentication yes

# sshd 재시작 
service sshd restart

```
