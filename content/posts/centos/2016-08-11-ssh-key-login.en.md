---
layout: post
title: Login with an ssh key
date: '2016-08-11T16:07:00.001'
author: Paper
tags: [centos,ssh,macos]
categories: linux
header-img: "img/post-bg-02.jpg"
---

Set up an ssh key on macOS so you can log into the server without typing a password  
~~Normally I don't do this, for security.~~ 

### macOS

#### - Generate a key
```bash
ssh-keygen -t rsa -C "name"
```

#### - View the public key
```bash
cat ~/.ssh/id_rsa.pub
```

### Target Server (CentOS)

#### - Add the public key to the `~/.ssh/authorized_keys` file
```bash
vi ~/.ssh/authorized_keys
```
