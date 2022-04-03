---
layout: post
title: tomcat 에서 OutOfMemory 자주 나오면.
date: '2015-02-05T17:10:00.000'
author: 페이퍼
tags: [centos,tomcat]
categories: centos
modified_time: '2016-03-25T14:52:00.000'
blogger_id: tag:blogger.com,1999:blog-335715462918866001.post-1282899466440249794
blogger_orig_url: http://kimpaper.blogspot.com/2015/02/tomcat-outofmemory.html
---

#### catalina.sh 맨 상위에 아래를 추가해서 메모리를 크게 잡자. (주의 서버 메모리를 생각해서 적당히. )
```
export CATALINA_OPTS="-Djava.awt.headless=true -server -Xms2048m -Xmx2048m -XX:NewSize=256m -XX:MaxNewSize=256m -XX:PermSize=256m -XX:MaxPermSize=512m -XX:+CMSClassUnloadingEnabled -XX:+CMSPermGenSweepingEnabled"
```


> 참고) http://stackoverflow.com/questions/88235/dealing-with-java-lang-outofmemoryerror-permgen-space-error

