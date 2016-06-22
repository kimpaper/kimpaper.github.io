---
layout: post
title: 맥에서 Unity3D 기본 에디터로 VisualStudio Code 사용하기 
date: '2015-12-18T15:39:00.001'
author: 페이퍼
tags: unity visualstudio-code
header-img: "img/post-bg-04.jpg"
---

맥용 Unity로 개발할때 보통 MonoDevelopr를 이용하여 코딩 한다
그런데 한글을 지원안해서. 아주 불편했는데.

MS에서 얼마전에 공개한 mac용 VisualStudio Code에서 유니티를 지원한다고 해서 한번 설정해봤다.

#### 설치
1. 우선 VS code를 설치 한다 
`https://code.visualstudio.com/`

2. 커맨드+P를 누르고. `ext install Omnisharp` 추가 기능으로 설치 한다

3. 맥의 터미널 상에 `brew install mono` 로 mono를 설치한다 <del>오래걸린다</del>

4. 이후로는 아래 사이트를 따라 하면 된다 
https://code.visualstudio.com/docs/runtimes/unity

5. `git clone https://github.com/dotBunny/VSCode.git`를 내려받고
`Plugins\Editor\dotBunny` 폴더를 자신의 유니티 프로젝트 내부에 넣는다 

6. 그리고 `Unity Preferences`에 가면 VSCode 라는 탭이 제일 아래 생긴다 
모두 체크하고 `Write Workspace Settings` 버튼을 누른다 


이제. cs파일을 더블클릭하면 프로젝트가 VS Code로 열릴 것이다.

#### 디버깅
1. VSCode상에서 원하는 부분에 브레이크 포인트를 건다 . (거는 방법은.. 에디터에서 맨 왼쪽을 클릭 하면 빨간 점이 나온다.)
2. F5를 누르면 디버깅 상태로 들어간다 
3. 그리고 유니티를 실행한다

