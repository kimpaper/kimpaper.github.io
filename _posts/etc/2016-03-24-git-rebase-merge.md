---
layout: post
title: git에서 rebase와 merge
date: '2016-03-24T16:36:00.000'
author: 페이퍼
tags: git
header-img: "img/post-bg-02.jpg"
---

요즘엔 git을 많이 이용하는데 항상 `rebase`와 `merge`에 대해서 헷갈리곤 했다.  

~~잘 모를때 rebase로 하다가 소스를 날려먹은 후로는.. merge만 써왔다~~  


최근에 몇군데 찾아봤는데 rebase 는 branch의 base를 재배치 한다는 의미라고 한다.
gitflow를 쓰면서 feature를 새로 만들어서 작업을 하다 그동안 쌓인 develop를 rebase를 해봤는데.
feature에서 작업하던 도중 쌓인 develop의 commit들이 local feature밑으로 들어가지는걸 확인했다.


히스토리가 꼬이지 않아 좋지만 한가지 문제는 feature를 서버로 push한 상태라면.. feature브런치가 두개가 생겨버린다 
물론 로컬이 최신이므로 remote/origin을 feature를 삭제하고 신규로 push하면 해결되는것 같다.

그림을 그려서 설명하면 참 좋겠지만.. 그림을 못그린다.



rebase시에 컴플릿은 history 기준으로 한번씩 해결하도록 유도 한다 이것은 툴들이 지원하니까. 어렵진 않다.
