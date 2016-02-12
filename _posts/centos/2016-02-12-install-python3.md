---
layout: post
title: CentOS 6에서 Python3 설치 하기 
date: '2016-02-12T16:53:00.002'
author: 페이퍼
tags: centos python
header-img: "img/post-bg-05.jpg"
---

## centos 6에 3.5.1 버전을 설치 하는 command line
 
{% highlight bash %}
wget https://www.python.org/ftp/python/3.5.1/Python-3.5.1.tar.xz
xz -d Python-3.5.1.tar.xz
# 혹시 xz가 없다면 yum install xz 로 설치 하라.
tar -xvf Python-3.5.1.tar

cd Python-3.5.1
./configure --prefix=/usr/local --enable-shared LDFLAGS="-Wl,-rpath /usr/local/lib"
make && make altinstall

ln -s /usr/local/bin/python3.5 /usr/local/python3
{% endhighlight %}

간단한 프로그램에는 Python이 좋은듯 java는 프로젝트 구성하기도 귀찮고...
