---
layout: post
title: restful api 서버에서 평균 응답시간, 호출횟수, Min, Max 구하기 
date: '2016-06-08T15:32:00.001'
author: 페이퍼
tags: spark hadoop python apache
header-img: "img/post-bg-02.jpg"
---
app에서 데이타 통신을하는 api서버가 있다  
각 인터페이스별 평균 응답시간을 아파치 로그를 활용하여 구해봤다

> 서버는 apache+tomcat, spring으로 구현한 서버이다  

hadoop과 spark, python 설정은  
[Python and Spark로 로그 파일 분석 (with hadoop)](/2016/05/30/spark-hadoop/)
을 참고 하자 


### 1. 아파치 TransferLog 로그파일에 응답 시간 남기기 
우선 분석하기 전에 아파치 로그에 응답 시간을 추가로 기록하도록 하자 

`/etc/httpd/conf.d/ssl.conf` 경로에서 아래를 편집했다.  
물론. 설정 파일이 있는 경로와 이름은 서버마다 틀릴 수 있다 

```bash
<VirtualHost _default_:443>
...
CustomLog logs/ssl_access_log \
          "%t %h %{SSL_PROTOCOL}x %{SSL_CIPHER}x \"%r\" %b %D"
...
</VirtualHost>
```

> 기존 TransferLog에 남기지 않고 CustomLog를 하나 더 추가 했다.  

맨 뒤에 %D를 붙이면 응답시간이 마이크로초 단위로 찍히게 된다 더욱 자세한 내용은 아래 링크를 참고 한다   
[https://httpd.apache.org/docs/2.2/ko/mod/mod_log_config.html](https://httpd.apache.org/docs/2.2/ko/mod/mod_log_config.html)

그래서 로그가 아래와 같이 쌓이는걸 확인 할 수 있다 맨 마지막 스페이스 이후에 숫자가 응답시간이다

```text
[08/Jun/2016:13:37:11 +0900] xx.xx.xx.xx TLSv1 ECDHE-RSA-AES128-SHA "POST /interface/if1 HTTP/1.1" 571 23687
[08/Jun/2016:13:37:14 +0900] xx.xx.xx.xx TLSv1 ECDHE-RSA-AES128-SHA "POST /interface/if2 HTTP/1.1" 711 17120
[08/Jun/2016:13:38:22 +0900] xx.xx.xx.xx TLSv1 ECDHE-RSA-AES128-SHA "POST /interface/if3 HTTP/1.1" 571 36293
[08/Jun/2016:13:38:26 +0900] xx.xx.xx.xx TLSv1 ECDHE-RSA-AES128-SHA "POST /interface/if4 HTTP/1.1" 93 15992
```


### 2. python코드 작성 (apachelog.py) 

```python
#-*-coding: utf-8 -*-

import re
import pymysql
from pyspark.context import SparkContext

pat = re.compile("/interface/(\w+)")

def mapLine(line):
    m = pat.search(line)
    if m is None:
        return ("", {"avg":0, "min":0, "max":0, "used":1})

    name = m.group(1)
    microtime = line[line.rfind(" "):]
    
    # 마이크로초이므로 백만을 나눠준다
    val = {}
    val["avg"] = int(microtime) / 1000
    val["min"] = int(microtime) / 1000
    val["max"] = int(microtime) / 1000
    val["used"] = 1
    
    return (name, val)

def reduceLine(a, b):
    val = {}
    val["avg"] = (a["avg"] + b["avg"]) / 2
    val["max"] = max(a["max"], b["max"])
    val["min"] = min(a["min"], b["min"])
    val["used"] = a["used"] + b["used"]
    return val

sc = SparkContext(appName="apache_log")

t = sc.textFile("/input2/*")
t = t.map(mapLine)
t = t.reduceByKey(reduceLine)
l = t.collect()
l.sort()

for data in l:
    # name, avg, max, min, used
    print("%s\t%d\t%d\t%d\t%d" % (data[0], data[1]["avg"], data[1]["max"], data[1]["min"], data[1]["used"]))

print("완료")
```

실행은 아래처럼 해야 한다 

```bash
$SPARK_HOME/bin/spark-submit --master local[4] apachelog.py
```
