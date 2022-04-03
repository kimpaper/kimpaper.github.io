---
layout: post
title: jfreeChart에서 한글 폰트 사용 (centos 폰트 설정)
date: '2015-07-01T20:33:00.001'
author: 페이퍼
tags: [jfreechart,centos,java]
categories: centos
modified_time: '2016-04-19T15:00:00.000'
---

jfreeChart를 사용하는 중인데 tomcat위에서 돌리면 한글이 ㅁㅁㅁ 과 같이 나온다.

`/usr/share/fonts` 폴더에 폰트파일을 넣고 `fc-cache -fv` 를 해주자!!

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

tomcat 재시작은 필요 없다.
