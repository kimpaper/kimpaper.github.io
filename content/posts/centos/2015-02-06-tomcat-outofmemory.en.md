---
layout: post
title: When Tomcat keeps throwing OutOfMemory
date: '2015-02-05T17:10:00.000'
author: Paper
tags: [centos,tomcat]
categories: linux
modified_time: '2016-03-25T14:52:00.000'
blogger_id: tag:blogger.com,1999:blog-335715462918866001.post-1282899466440249794
blogger_orig_url: http://kimpaper.blogspot.com/2015/02/tomcat-outofmemory.html
---

#### Add the following at the very top of catalina.sh to increase the memory. (Careful — keep the server's total memory in mind.)
```
export CATALINA_OPTS="-Djava.awt.headless=true -server -Xms2048m -Xmx2048m -XX:NewSize=256m -XX:MaxNewSize=256m -XX:PermSize=256m -XX:MaxPermSize=512m -XX:+CMSClassUnloadingEnabled -XX:+CMSPermGenSweepingEnabled"
```


> Reference) http://stackoverflow.com/questions/88235/dealing-with-java-lang-outofmemoryerror-permgen-space-error
