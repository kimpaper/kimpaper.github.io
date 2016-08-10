---
layout: post
title: Flume 설치 및 테스트 (mac)
date: '2015-10-29T15:51:00.002'
author: 페이퍼
tags: centos flume mac
header-img: "img/post-bg-05.jpg"
---

## Flume 란?
- 여러대(여러서비스..)에 기록되는 로그파일들을 실시간으로 한곳으로 모아주는 서비스

### 설치
- http://flume.apache.org/download.html 에서 다운로드 한다.
- 적절한 곳에 압축을 풀어 준다 ~/dev/tool/flume
- JAVA_HOME이 지정되 있지 않으면. ~/.bash_profile 을 열어 환경 변수를 설정해 준다. 
```bash
  export JAVA_HOME = /usr (자바 경로.)
```

> 설치 및 테스트는 mac에서 했지만. centos에서도 잘되리라 믿는다.


#### 기본 flume.conf 파일
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

참고) https://flume.apache.org/FlumeUserGuide.html
설정파일은 sources, channels, sinks 로 나눠져 있다.

- sources: 읽어오는 대상 (원격 서버에서 전달받기도 한다.)
- channels: 아마... sinks로 저장하기 위한 버퍼? 같은 역할인것 같음 <del>솔찍히 모름</del>
- sinks: 저장할 대상 또는 전달할 대상?

아래 그림을 보면 살짝 이해가 된다. (아래 그림에는 저장 대상이 하둡인데.. 나는 하둡을 이용하진 않을 것이다.)

![img](/images/2015-10-29-flume-setting-sample-UserGuide_image00.png)

그림출처) https://flume.apache.org/FlumeUserGuide.html

다양한 sources 형식이 있으나 나는 로그 파일로부터 tail명령을 이용하여 수집한다.

- agent1은 agent2에서 수집된 로그를 전달 받는다
- agent2는 수집된 로그를 agent1으로 전송 한다.

#### 저장하는 서버 agent1 (flume/conf/flume-agent1.conf)

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

#### 저장서버로 로그를 전송 하는 서버 (여러대로 늘어난다) agent2 (flume/conf/flume-agent2.conf)

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

**위에 sources를 두개 지정할 수 있다 (파일이 다른 경우)**

### 서비스 실행 
두가지 설정을 한 서비스를 각각 실행 하자.  

```bash
./bin/flume-ng agent -c ./conf -f ./conf/flume-agent1.conf -n agent1
./bin/flume-ng agent -c ./conf -f ./conf/flume-agent2.conf -n agent2
```

- `-c`, `--conf` 설정폴더
- `-f`, `--conf-file` 설정파일 
- `-n`, `--name` 에이전트 이름


agent1에서 sinks를 file_roll로 하니 아래와 같이 file list들이 쌓인다.
`sink.rollInterval` 속성을 이용해서 interval은 조정 가능 하다. (아래는 30초 기준이다.)  

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

