---
layout: post
title: Installing Python3 on CentOS 6
date: '2016-02-12T16:53:00.002'
author: Paper
tags: [centos,python]
header-img: "img/post-bg-05.jpg"
categories: python
---

## Command line to install 3.5.1 on centos 6
 
```bash
yum install zlib-devel -y
yum install openssl openssl-devel -y


wget https://www.python.org/ftp/python/3.5.1/Python-3.5.1.tar.xz
xz -d Python-3.5.1.tar.xz
# 혹시 xz가 없다면 yum install xz 로 설치 하라.
tar -xvf Python-3.5.1.tar

cd Python-3.5.1
./configure --prefix=/usr/local --enable-shared LDFLAGS="-Wl,-rpath /usr/local/lib"
make && make altinstall

# pip설치 
curl -k -O https://bootstrap.pypa.io/get-pip.py
python3.5 get-pip.py


```

Python seems good for simple programs. With java, even setting up a project is a hassle...
