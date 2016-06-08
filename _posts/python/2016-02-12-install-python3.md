---
layout: post
title: CentOS 6에서 Python3 설치 하기 
date: '2016-02-12T16:53:00.002'
author: 페이퍼
tags: centos python
header-img: "img/post-bg-05.jpg"
---

## centos 6에 3.5.1 버전을 설치 하는 command line
 
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

간단한 프로그램에는 Python이 좋은듯 java는 프로젝트 구성하기도 귀찮고...
