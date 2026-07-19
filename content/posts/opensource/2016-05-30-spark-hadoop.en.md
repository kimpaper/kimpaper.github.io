---
layout: post
title: Analyzing log files with Python and Spark (with hadoop)
date: '2016-05-30T16:35:00.001'
author: Paper
categories: opensource
tags: [spark,hadoop,python]
header-img: "img/post-bg-01.jpg"
---
# File analysis with Spark

> I did this without really knowing spark or hadoop, so there will be mistakes.  
> For reference, this was done on OSX.

# Setup

### 1. Install and run Hadoop

### 2. Put the file on hdfs.

```bash
cd /logs
hdfs dfs -put test.log /input/
```

You can browse files as below. Check the uploaded file here! 
`http://localhost:50070/explorer.html#/input`

### 3. Test spark's python command..
`$SPARK_HOME/bin/pyspark`
With hadoop running, launching pyspark shows this 

```
Python 2.7.10 (default, Oct 23 2015, 19:19:21)
[GCC 4.2.1 Compatible Apple LLVM 7.0.0 (clang-700.0.59.5)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
16/05/30 16:12:16 INFO spark.SparkContext: Running Spark version 1.6.1
2016-05-30 16:12:17.194 java[5956:1259148] Unable to load realm info from SCDynamicStore
... 중략 ....
16/05/30 16:12:19 INFO storage.BlockManagerMasterEndpoint: Registering block manager localhost:50791 with 511.0 MB RAM, BlockManagerId(driver, localhost, 50791)
16/05/30 16:12:19 INFO storage.BlockManagerMaster: Registered BlockManager
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /__ / .__/\_,_/_/ /_/\_\   version 1.6.1
      /_/

Using Python version 2.7.10 (default, Oct 23 2015 19:19:21)
SparkContext available as sc, HiveContext available as sqlContext.
>>> 
```

### 4. Setting up the python environment (for spark-submit) 

```bash
 # 환경변수 설정을 위해 아래 파일을 연다 (물론 OSX 기준)
 vi ~/.bash_profile
```

Add the following to `.bash_profile`

```bash
export SPARK_HOME=/Users/paper/dev/tool/spark
export PYTHONPATH=$SPARK_HOME/python/:$PYTHONPATH
export IPYTHON=1
export PYSPARK_PYTHON=python3.5
export PYSPARK_DRIVER_PYTHON=ipython
```

If you don't have ipython, install it with the command below

```bash
pip install ipython
```

```bash
# 적용 
source ~/.bash_profile

# py4j는 pyspark가 사용하는 모듈이니 설치 해야 함 
pip3.5 install py4j
```

### 5. Write voicelog.py and run a quick test 
```python
#-*-coding: utf-8 -*-
from pyspark.context import SparkContext

sc = SparkContext()

t = sc.textFile("/input/test.log")
print(t.count())
```

```bash
$SPARK_HOME/bin/spark-submit --master local[4] voicelog.py
```

You can see the result like this

```bash
16/05/30 17:52:58 INFO spark.SparkContext: Running Spark version 1.6.1
2016-05-30 17:52:58.646 java[7629:1534234] Unable to load realm info from SCDynamicStore
16/05/30 17:52:58 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
16/05/30 17:52:58 INFO spark.SecurityManager: Changing view acls to: paper
... 중략 ...
16/05/30 17:53:03 INFO scheduler.DAGScheduler: Job 0 finished: count at /Users/paper/dev/git/createXlsFromDb/search_voice_log/voicelog.py:8, took 1.541395 s
145410
16/05/30 17:53:03 INFO spark.SparkContext: Invoking stop() from shutdown hook
... 중략 ...
16/05/30 17:53:03 INFO remote.RemoteActorRefProvider$RemotingTerminator: Remoting shut down.
```



# Tool setup (IntelliJ IDEA)

### Now that files are hooked up.. let's connect it in intellij.  
1. Making pyspark visible in code  
In project settings, add the library to SDKs as shown below 
![settings](/images/160601_1.png)
2. Hooking up the run script  
![settings](/images/160601_2.png)

> Configure it to run `$SPARK_HOME/bin/spark-submit --master local[4] voicelog.py`


# Implementation: `voicelog.py`
```python
#-*-coding: utf-8 -*-
from pyspark.context import SparkContext


def mapLine(line):
    # lineblock를 불러와서 필요한 부분만 가공하여 tuple형태로 반환한다
    str = line[1][:line[1].find(".pcm")]
    str2 = str.split("/")
    sent_cd = str2[1][str2[1].find("_")+1:]
    data = str2[0] + "/" + sent_cd
    return (data, 1)

def printLine(line):
    print(line)

sc = SparkContext(appName="voicelog")
# /input/ 경로에 있는 모든 파일을 가져와서 분석을 실시한다 
# sc.textFile로 하려고 했으나.분석 대상이 multi line이어서 아래를 이용한다

t = sc.newAPIHadoopFile(
    '/input/',
    'org.apache.hadoop.mapreduce.lib.input.TextInputFormat',
    'org.apache.hadoop.io.LongWritable',
    'org.apache.hadoop.io.Text',
    conf={'textinputformat.record.delimiter': '/text/'}
)

# block중에 record가 포함되지 않고 -11문자열을 포함하는 block만 RDD로 뽑는다
l = t.filter(lambda data: "/record/" not in data[1] and "-11" in data[1])

# reduceByKey를 한 이유는 몇번이나 발생했는지를 나타낸다 - 사실 중복제거를 하려고 했는데. groupByKey를 사용해도 괜찮다
l = l.map(mapLine).reduceByKey(lambda a, b: a + b).collect()

# 결과 파일에 쓴다
f = open("result.log", "w")
for s in l:
    f.write("%s, %d\r\n" % (s[0], s[1]))
f.close()

print("완료")

```

#### How to run
```bash
$SPARK_HOME/bin/spark-submit --master local[4] voicelog.py
```
For reference, `spark-submit --help` shows many options

### Running against a spark server
To set up a cluster and connect, it seems you run spark separately like below and use the spark address in the python code  
~~haven't tried it~~

```bash
$SPARK_HOME/sbin/start-all.sh
```

![MasterUI capture](/images/160601_3.png)

If you look closely at the MasterUI above,
you can see the part starting with URL: spark://.

```python
SparkContext("spark://.....", "voicelog")
```

> Logs used to be just for error tracing so I had them auto-deleted after a period..
> From now on I should keep them  
> Let's start putting some valuable data in the logs 
