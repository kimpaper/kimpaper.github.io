---
layout: post
title: Switching Flume's default logging from log4j to logback
date: '2015-10-30T18:13:00.002'
author: Paper
tags: [centos,flume,logback]
categories: linux
header-img: "img/post-bg-01.jpg"
---

# Writing Flume log files with logback

## How to install logback in Flume
1. Download logback from (http://logback.qos.ch/download.html). (currently v1.1.3)
2. Extract it and copy `logback-classic-1.1.3.jar` and `logback-core-1.1.3.jar` into $FLUME_HOME/lib.
3. For the existing log4j, rename `./lib/slf4j-log4j12-1.6.1.jar` to `./lib/slf4j-log4j12-1.6.1.jar.back`.
   Removing log4j is optional (if you leave it, both will write logs)
4. Edit logback.xml and put it at `$FLUME_HOME/conf/logback.xml`.

#### logback.xml sample
```xml
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

## Configure logback to record events
I was going to use file_roll as the sink that collects and stores logs on the master server, but it has downsides.
- Can't set the file name
- Log files keep piling up

These turned out to be bigger downsides than expected, so I made a simple sink project.  
* https://github.com/kimpaper/flume-slj4j-sink

See the site above for install instructions.

#### conf/flume-agent1.conf
```bash
...
agent1.sinks.k1.type = kimpaper.flume.sink.Slj4jSink
agent1.sinks.k1.logLevel = info
agent1.sinks.k1.channel = c1
...
```
Apply the sink as above.


Now you can see the logs coming from each server merged into the `collect.log` file.
