---
layout: post
title: A simple webserver check with Python
date: '2016-02-17T11:41:00.000'
author: Paper
tags: [python]
header-img: "img/post-bg-04.jpg"
categories: python
---

I've been studying python lately, so as practice I made a simple program that checks every 10 seconds whether a webserver is dead.  
The code below covers the following items

- http request
- thread (as a timer)
- how to use logging
- try-except exception handling
- raise throw
- json parsing and reading data
- string handling

### ServerCheck.py
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

### How to run 
```bash
python ServerCheck.py 
```

<del>Not sure a timer done this way is really okay though ...</del>  
