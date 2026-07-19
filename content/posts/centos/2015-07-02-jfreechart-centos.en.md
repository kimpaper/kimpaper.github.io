---
layout: post
title: Korean fonts in JFreeChart (CentOS font setup)
date: '2015-07-01T20:33:00.001'
author: Paper
tags: [jfreechart,centos,java]
categories: linux
modified_time: '2016-04-19T15:00:00.000'
---

I'm using JFreeChart, and when it runs on Tomcat, Korean text renders as broken boxes.

Put the font files in `/usr/share/fonts` and run `fc-cache -fv`.

```java
// 코드 상에 아래와 같이 폰트를 지정한다.
private static final Font _BASE_FONT = new Font("나눔고딕",Font.PLAIN,11);
...
중략
'''
// setFont를 적절하게 코드 내에 사용한다.
lineAndShapeRenderer.setLegendTextFont(i, _BASE_FONT);
...
```

No Tomcat restart needed.
