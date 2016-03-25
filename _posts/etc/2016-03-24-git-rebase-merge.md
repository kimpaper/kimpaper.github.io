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

rebase시에 컴플릿은 local feature에서 commit한걸 기준으로 한번씩 단계적으로 해결을 resolve를 해나가는데.
 
이 과정에서 원하는 결과가 제대로 안나올수 있다. (파일 하나의 resolve 작업을 여러번 해야 하는데..)
 
rebase 를 이용하려면 되도록 주기를 짧게 가져가는것이 좋을것같다.
