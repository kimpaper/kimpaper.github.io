---
layout: post
title: tomcat 에서 OutOfMemory 자주 나오면.
date: '2015-02-05T17:10:00.002-08:00'
author: 페이퍼
tags: centos tomcat
modified_time: '2015-10-06T02:37:01.123-07:00'
blogger_id: tag:blogger.com,1999:blog-335715462918866001.post-1282899466440249794
blogger_orig_url: http://kimpaper.blogspot.com/2015/02/tomcat-outofmemory.html
---

#### catalina.sh 맨 상위에 아래를 추가해서 메모리를 크게 잡자. (주의 서버 메모리를 생각해서 적당히. )
```bash
export CATALINA_OPTS="-Djava.awt.headless=true -server -Xms2048m -Xmx2048m -XX:NewSize=256m -XX:MaxNewSize=256m -XX:PermSize=256m -XX:MaxPermSize=512m"
```
