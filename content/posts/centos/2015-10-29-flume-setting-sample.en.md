---
layout: post
title: Flume install and test (mac)
date: '2015-10-29T15:51:00.002'
author: Paper
tags: [centos,flume,mac]
categories: linux
header-img: "img/post-bg-05.jpg"
---

## What is Flume?
- A service that collects log files written across multiple machines (multiple services..) into one place in real time

### Install
- Download from http://flume.apache.org/download.html
- Extract it somewhere suitable ~/dev/tool/flume
- If JAVA_HOME is not set, open ~/.bash_profile and set the environment variable.
```bash
  export JAVA_HOME = /usr (자바 경로.)
```

> I installed and tested on mac, but I trust it works fine on centos too.


#### Basic flume.conf file
```bash
# The configuration file needs to define the sources,
# the channels and the sinks.
# Sources, channels and sinks are defined per agent,
# in this case called 'agent'

agent.sources = seqGenSrc
agent.channels = memoryChannel
agent.sinks = loggerSink

# For each one of the sources, the type is defined
agent.sources.seqGenSrc.type = seq

# The channel can be defined as follows.
agent.sources.seqGenSrc.channels = memoryChannel

# Each sink's type must be defined
agent.sinks.loggerSink.type = logger

#Specify the channel the sink should use
agent.sinks.loggerSink.channel = memoryChannel

# Each channel's type is defined.
agent.channels.memoryChannel.type = memory

# Other config values specific to each type of channel(sink or source)
# can be defined as well
# In this case, it specifies the capacity of the memory channel
agent.channels.memoryChannel.capacity = 100
```

Reference) https://flume.apache.org/FlumeUserGuide.html
The config file is divided into sources, channels, and sinks.

- sources: what to read from (can also receive from remote servers)
- channels: probably.. some kind of buffer before writing to sinks? I think <del>honestly no idea</del>
- sinks: where to store, or where to forward?

The picture below makes it a bit clearer. (In the picture the storage target is Hadoop.. I won't be using Hadoop.)

![img](/images/2015-10-29-flume-setting-sample-UserGuide_image00.png)

Image source) https://flume.apache.org/FlumeUserGuide.html

There are many source types, but I collect from log files using the tail command.

- agent1 receives the logs collected by agent2
- agent2 sends its collected logs to agent1

#### The storing server, agent1 (flume/conf/flume-agent1.conf)

```bash
agent1.sources = r1
agent1.channels = c1
agent1.sinks = k1

# 원격의 서버들로부터 데이타를 수신한다 (port는 4545) 
agent1.sources.r1.type = avro
agent1.sources.r1.bind = 0.0.0.0
agent1.sources.r1.port = 4545
agent1.sources.r1.channels = c1

agent1.channels.c1.type = memory
agent1.channels.c1.capacity = 10000
agent1.channels.c1.transactionCapacity = 1000

# /logs/flume에 저장한다 
agent1.sinks.k1.type = file_roll
agent1.sinks.k1.sink.directory = /logs/flume
# 하루(24 hour) 단위로 파일.. rolling.
agent1.sinks.k1.sink.rollInterval = 86400
agent1.sinks.k1.channel = c1
```

#### The server that sends logs to the storing server (there will be many of these), agent2 (flume/conf/flume-agent2.conf)

```bash
agent2.sources = r1 r2
agent2.channels = c1
agent2.sinks = k1

# 파일로 부터 로그를 읽어 온다.
agent2.sources.r1.type = exec
agent2.sources.r1.command = tail -F /logs/debug.log
agent2.sources.r1.channels = c1

agent2.sources.r2.type = exec
agent2.sources.r2.command = tail -F /logs/info.log
agent2.sources.r2.channels = c1

agent2.channels.c1.type = memory
agent2.channels.c1.capacity = 10000
agent2.channels.c1.transactionCapacity = 1000

# 원격의 서버로 전달 한다. (난 로컬에서 테스트 하니까 127.0.0.1:4545)
agent2.sinks.k1.type = avro
agent2.sinks.k1.channel = c1
agent2.sinks.k1.hostname = 127.0.0.1
agent2.sinks.k1.port = 4545
```

**You can specify two sources as above (when the files are different)**

### Run the services
Run the two configured services separately.  

```bash
./bin/flume-ng agent -c ./conf -f ./conf/flume-agent1.conf -n agent1
./bin/flume-ng agent -c ./conf -f ./conf/flume-agent2.conf -n agent2
```

- `-c`, `--conf` config directory
- `-f`, `--conf-file` config file
- `-n`, `--name` agent name


With agent1's sink set to file_roll, files pile up like below.
The interval can be adjusted with the `sink.rollInterval` property. (Below is with 30 seconds.)  

```bash
gimjonghuiui-MacBook-Pro:flume paper$ ls -l
total 24
-rw-r--r--  1 paper  wheel    0 10 29 15:40 1446100807777-1
-rw-r--r--  1 paper  wheel   95 10 29 15:40 1446100818312-1
-rw-r--r--  1 paper  wheel  519 10 29 15:41 1446100818312-2
-rw-r--r--  1 paper  wheel    0 10 29 15:41 1446100818312-3
-rw-r--r--  1 paper  wheel  378 10 29 15:42 1446100818312-4
-rw-r--r--  1 paper  wheel    0 10 29 15:42 1446100818312-5
-rw-r--r--  1 paper  wheel    0 10 29 15:42 1446100818312-6
-rw-r--r--  1 paper  wheel    0 10 29 15:43 1446100818312-7
```
