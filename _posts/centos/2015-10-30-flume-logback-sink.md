---
layout: post
title: Flume의 기본 로그를 log4j에서 logback으로 변경
date: '2015-10-30T18:13:00.002-07:00'
author: 페이퍼
tags: centos flume logback
header-img: "img/post-bg-05.jpg"
---

# flume에 logback로 로그 파일 쓰기 

## flume에 logback 설치 방법
1. (http://logback.qos.ch/download.html) 에서 logback 다운로드 한다 . (현재 v1.1.3)
2. 압축을 풀고. `logback-classic-1.1.3.jar`, `logback-core-1.1.3.jar` 를 $FLUME_HOME/lib에 복사해 넣는다.
3. 기존 log4j는 `./lib/slf4j-log4j12-1.6.1.jar`를 `./lib/slf4j-log4j12-1.6.1.jar.back`로 이름을 바꾼다.
   log4j를 지우는 것은 선택사항이다 (놔두면 둘다 기록 한다) 
4. logback.xml 파일을 수정해서 `$FLUME_HOME/conf/logback.xml`에 넣는다.

#### logback.xml 샘플
```
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

	<!-- Appenders -->
	<appender name="console" class="ch.qos.logback.core.ConsoleAppender">    
      	<encoder>
        	<pattern>[%-5level] %d{HH:mm:ss.SSS} [%thread] %logger{36} - %msg%n</pattern>
       	</encoder>
    </appender>
    <appender name="daily" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <prudent>false</prudent>
        <file>./logs/flume1.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>./logs/old/flume1.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100mb</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>[%-5level] %d{HH:mm:ss.SSS} %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="event" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <prudent>false</prudent>
        <file>./logs/collect.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>./logs/old/collect.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100mb</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%msg%n</pattern>
        </encoder>
    </appender>

	<logger name="kimpaper" level="debug">
        <appender-ref ref="event" />
	</logger>

    <!-- 3rdparty Loggers -->
	<logger name="org.apache.flume.lifecycle" level="info">
	</logger>
	<logger name="org.jboss" level="warn">
	</logger>
	<logger name="org.mortbay" level="info">
	</logger>
	<logger name="org.apache.avro.ipc.NettyTransceiver" level="warn">
	</logger>
	
	<logger name="org.apache.hadoop" level="info">
	</logger>
	<logger name="org.apache.hadoop.hive" level="error">
	</logger>
	
	
	<!-- Root Logger -->
	<root level="info">
		<appender-ref ref="console" />
		<appender-ref ref="daily" />
	</root>
	
</configuration>
```

## logback에 event 기록 하도록 설정
마스터 서버에서 로그를 모아 저장하는 sink로 file_roll를 이용하려고 했으나 단점이 있다.
- 파일명 지정 못함
- 로그파일이 계속 쌓임

위 단점은 생각보다 큰 단점이어서 간단한 sink 프로젝트를 만들었다.  
* https://github.com/kimpaper/flume-slj4j-sink

설치 방법은 위 사이트에서 참고

#### conf/flume-agent1.conf
```bash
...
agent1.sinks.k1.type = kimpaper.flume.sink.Slj4jSink
agent1.sinks.k1.logLevel = info
agent1.sinks.k1.channel = c1
...
```
sink는 위와 같이 적용 한다.


이제 각 서버에서 오는 log들이 `collect.log` 파일에 병합되어 쌓이는걸 확인 할 수 있다.

