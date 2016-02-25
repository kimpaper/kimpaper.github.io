---
layout: post
title: git local commit revert 시키기
date: '2016-02-25T14:35:00.001'
author: 페이퍼
tags: git
header-img: "img/post-bg-01.jpg"
---


아래와 같이 복구 대상 저장소를 지정한다 (현재 checkout이 develop인 경우) 
```bash
git reset --hard remotes/origin/develop
```

저장소를 지정하지 않으면 현재 checkout된 remote를 기준으로 revert하는것 같다 
```bash
git reset --hard
```


