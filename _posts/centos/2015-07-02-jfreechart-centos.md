---
layout: post
title: 'jfreeChart 에서 한글 깨질때 centos 폰트 설정 '
date: '2015-07-01T20:33:00.001-07:00'
author: 페이퍼
tags: jfreechart centos spring
modified_time: '2015-10-06T02:41:39.554-07:00'
blogger_id: tag:blogger.com,1999:blog-335715462918866001.post-5249527455620459104
blogger_orig_url: http://kimpaper.blogspot.com/2015/07/jfreechart-centos.html
---

jfreeChart를 사용하는 중인데 tomcat위에서 돌리면 한글이 ㅁㅁㅁ 과 같이 나온다.

아래와 같이 한글 폰트를 os에 설치 한다. (물론 코드에서는 폰트 명을 지정해야 한다.)

```bash
yum install -y kde-i18n-Korean
yum install -y fonts-korean
fc-cache -fv
```

반영을 위하여 꼭 tomcat을 재시작 해야 한다.
