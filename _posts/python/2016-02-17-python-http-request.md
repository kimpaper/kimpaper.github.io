---
layout: post
title: Python으로 간단한 webserver 체크
date: '2016-02-17T11:41:00.000'
author: 페이퍼
tags: python
header-img: "img/post-bg-04.jpg"
---

요즘 파이썬 공부중인데 연습겸 간단한 프로그램을 만들어 봤다.

아래코드에는 아래 나열된 사항들에 대한 코딩이 적용되어 있다 
- http request
- thread(timer 대응)
- logging사용법
- try-except 예외처리
- raise throw
- json parsing 및 데이타 읽기 방법  
- string 처리 

### ServerCheck.py 파일
```python
import threading
import urllib.request
import json
import time
import logging


logger = logging.getLogger("myLogger")

# 이런 로그 파일 셋팅 
def config_logger():
    formatter = logging.Formatter("[%(levelname)s] %(asctime)s - %(message)s")
    file_handler = logging.FileHandler("/logs/py/log.log")
    stream_handler = logging.StreamHandler()

    file_handler.setFormatter(formatter)
    stream_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(stream_handler)
    logger.setLevel(logging.DEBUG)


def call_error(name, e):
    logger.error("%s에서 '%s'가 발생했습니다" % (name, e))


def check_server(name, url):
    try:
        check_server_private(url)
        logger.info("서버 체크 완료 name=%s" % name)
    except Exception as e:
        call_error(name, e)


def check_server_private(url):
    req = urllib.request.urlopen(url)
    try:
        if req.getcode() != 200:
            raise RuntimeError("서버 오류")
        data = req.read()
        json_object = json.loads(str(data, "utf-8"), "utf-8")
        if json_object["result_code"] != "0000":
            raise RuntimeError("서버 응답 오류")
    finally:
        req.close()


def check_all():
    check_server("server1", "http://server1/checkjson")
    check_server("server2", "http://server2/checkjson")


def run_thread():
    while True:
        check_all()
        time.sleep(10)

config_logger()


th = threading.Thread(target=run_thread)
th.start()

logger.info("모니터링 시작 합니다")

```

### 실행 방법 
```bash
python ServerCheck.py 
```

> 타이머를 저런식으로 해도 될런지 모르겠네 ...