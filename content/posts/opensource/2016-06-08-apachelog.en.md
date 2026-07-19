---
layout: post
title: Getting average response time, call count, Min, Max on a restful api server
date: '2016-06-08T15:32:00.001'
author: Paper
categories: opensource
tags: [spark,hadoop,python,apache]
url: /en/2016/06/08/apachelog/
---
There's an api server that handles data traffic from an app  
I computed the average response time per interface using the apache logs

> The server is apache+tomcat, implemented with spring  

For the hadoop, spark, and python setup see  
[Analyzing log files with Python and Spark (with hadoop)](/2016/05/30/spark-hadoop/)


### 1. Log the response time in the apache TransferLog 
Before analyzing, make apache record the response time in its log

I edited the following at `/etc/httpd/conf.d/ssl.conf`.  
Of course. the path and name of the config file may differ per server 

```bash
<VirtualHost _default_:443>
...
CustomLog logs/ssl_access_log \
          "%t %h %{SSL_PROTOCOL}x %{SSL_CIPHER}x \"%r\" %b %D"
...
</VirtualHost>
```

> Instead of writing to the existing TransferLog, I added one more CustomLog.  

Appending %D at the end logs the response time in microseconds. See the link below for details   
[https://httpd.apache.org/docs/2.2/ko/mod/mod_log_config.html](https://httpd.apache.org/docs/2.2/ko/mod/mod_log_config.html)

So you can see logs pile up like this. The number after the last space is the response time

```text
[08/Jun/2016:13:37:11 +0900] xx.xx.xx.xx TLSv1 ECDHE-RSA-AES128-SHA "POST /interface/if1 HTTP/1.1" 571 23687
[08/Jun/2016:13:37:14 +0900] xx.xx.xx.xx TLSv1 ECDHE-RSA-AES128-SHA "POST /interface/if2 HTTP/1.1" 711 17120
[08/Jun/2016:13:38:22 +0900] xx.xx.xx.xx TLSv1 ECDHE-RSA-AES128-SHA "POST /interface/if3 HTTP/1.1" 571 36293
[08/Jun/2016:13:38:26 +0900] xx.xx.xx.xx TLSv1 ECDHE-RSA-AES128-SHA "POST /interface/if4 HTTP/1.1" 93 15992
```


### 2. Write the python code (apachelog.py) 

```python
#-*-coding: utf-8 -*-

import re
import pymysql
from pyspark.context import SparkContext

pat = re.compile("/interface/(\w+)")

def mapLine(line):
    m = pat.search(line)
    if m is None:
        name = "other"
    else:
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

print("name\tavg\tmax\tmin\tcalls")
for data in l:
    # name, avg, max, min, used
    print("%s\t%d\t%d\t%d\t%d" % (data[0], data[1]["avg"], data[1]["max"], data[1]["min"], data[1]["used"]))

print("완료")
```

Run it like this 

```bash
$SPARK_HOME/bin/spark-submit --master local[4] apachelog.py
```
