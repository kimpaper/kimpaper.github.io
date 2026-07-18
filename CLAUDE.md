# kimpaper.github.io — 기록 저장소

Hugo 정적 블로그. PaperMod 테마 위에 프로젝트 커스텀 레이아웃("Index·Ledger" 디자인)을
얹어 사용한다. `main` 브랜치 push → GitHub Actions → GitHub Pages 배포.

## 구조

- `content/posts/<카테고리>/YYYY-MM-DD-슬러그.md` — 글. 폴더명과 front matter의
  `categories` 를 맞춘다 (spring/linux/opensource/mac/kubernetes/dotnet/python/golang/etc/diary)
- `static/images/` — 이미지. 파일명은 `YYYY-MM-DD-주제-N.jpg`
- `data/nav.yaml` — 좌측 사이드바 대메뉴>세부메뉴 구성 (새 카테고리는 여기에 추가)
- `layouts/` — 커스텀 레이아웃 전체. `layouts/partials/head.html` 에 SEO/GA4/애드센스 집중
- `assets/css/site.css` — 디자인 시스템 전체

## 빌드/배포 주의

- CI는 `hugo latest` + `ubuntu-latest`. 로컬 검증은 `/root/go/bin/hugo` (0.164) 사용
- front matter 중복 키, deprecated 설정(privacy.twitter 등)에 최신 Hugo가 엄격함
- 글 날짜가 빌드 시점보다 미래면 `buildFuture: false` 라 스킵됨 — 날짜를 과거로
- 서브모듈(themes/PaperMod)은 렌더링에 안 쓰지만 RSS/sitemap 폴백으로 유지. 건드리지 말 것
- 이미지는 저장 전 `PIL ImageOps.exif_transpose()` 로 EXIF 방향을 픽셀에 반영해서 저장

## 블로그 포스팅 지침 (중요)

**글은 반드시 블로그 주인의 원래 말투로 쓴다.** 옛 글(2015~2023, content/posts/mac, etc,
golang 등)이 기준이다. AI 냄새 나는 매끄러운 문장 금지.

### 말투 규칙

1. **반말 평서체, 짧고 건조하게.** "~했다", "~한다", "~된다", "~하자".
   문장을 길게 늘이지 말고 뚝뚝 끊는다. 마침표는 생략해도 됨
2. **확신 없으면 얼버무린다.** "~인듯", "~같다", "~할꺼 같다", "~한걸까".
   단정적인 리뷰어 말투 금지
3. **이모지 금지.** 🍲🥂✅ 전부 쓰지 않는다. 옛 글에 이모지가 하나도 없다
4. **과장/인플루언서 표현 금지.** "인생 OO", "최애", "강력 추천", "대만족", "하이라이트",
   "JMT" 류 금지. 맛있으면 그냥 "맛있었다", "괜찮았다", "좋다" 정도로.
   단, 사용자가 직접 한 말("아주 좋음" 등)은 그대로 살린다
5. **취소선 혼잣말을 가끔 쓴다.** `~~대부분 그렇지 않을까~~` 같은 자기 농담.
   글 하나에 0~1회. 남발 금지
6. **`..` 말줄임을 가끔 쓴다.** "좋은.. 모듈" 처럼. `...` 아니고 `..`
7. **감성 마무리 금지.** `> 인용구` 감성 문장, "잘 먹었습니다 🙏" 같은 클로징 반복 금지.
   끝은 그냥 뚝 끝나거나 혼잣말 한 줄
8. **제목은 간결하게.** "장소/대상 — 메뉴" 정도. 수식어 붙이지 않는다
   (예: "개봉동 대빛식당 — 꽃삼겹", "골목식당 동태탕" / 나쁜 예: "여행 아침은 얼큰하게 —")

### 구성 규칙

- 서두 한두 문장으로 바로 시작. 배경 설명 장황하게 하지 않는다
- `##` 섹션은 꼭 필요할 때만. 사진 나열 + 짧은 코멘트 형태가 기본
- 이미지 alt 텍스트도 짧게 ("물밀면", "메뉴판")
- 맛집 글은 끝에 `## 위치` 로 상호/주소/네이버 지도 링크. 사진 EXIF GPS 로 위치를 찾고,
  네이버 지도에서 실제 업체를 찾아 링크를 건다 (감성 없이 담백하게 정보만)
- 기술 글은 옛 글처럼: 코드블록 중심, 명령어 위에 `## 뭐뭐 한다` 식 짧은 제목,
  참고 링크는 URL 그대로 노출

### front matter

```yaml
---
title: "간결한 제목"
date: YYYY-MM-DDTHH:MM:00+09:00   # 사진 EXIF 촬영시각 기준, 미래 금지
author: 페이퍼
categories: diary                  # 폴더명과 일치
tags: [일상, 맛집, ...]            # 3~5개
ShowToc: false                     # 일상 글은 목차 끔
---
```

### 포스팅 작업 순서 (사진이 오면)

1. EXIF 에서 촬영시각·GPS 추출 → 역지오코딩으로 동네 확인
2. 필요시 웹검색으로 실제 업체명·주소 확인, 네이버 지도 링크 준비
3. 이미지 EXIF 방향 정규화 후 `static/images/YYYY-MM-DD-주제-N.jpg` 로 저장
4. 위 말투 규칙대로 글 작성
5. 로컬 Hugo 빌드 + 스크린샷으로 사진 방향/렌더 확인
6. 커밋 → push → PR → main 머지 → 라이브 반영 확인 (글/이미지 200, 홈 대표글)

## SEO

- head.html 에서 OG/Twitter/JSON-LD 자동 생성. OG 이미지는 본문 첫 이미지 자동 감지
- 검색엔진 소유확인: config.yml 의 `googleSiteVerification` / `naverSiteVerification`
- 네이버 서치어드바이저에 sitemap.xml, index.xml(RSS) 제출됨. 구글 서치콘솔은 사용자가 등록
