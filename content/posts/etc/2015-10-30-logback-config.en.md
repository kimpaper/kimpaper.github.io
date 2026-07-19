---
layout: post
title: Splitting log files by time + size in logback
date: '2015-10-30T11:18:00.001'
author: Paper
tags: [logback]
url: /en/2015/10/30/logback-config/
categories: etc
---

With logback, the file rolls over when the day passes or the size goes over 100MB.

#### Add the appender below to logback.xml
```xml
<appender name="debug" class="ch.qos.logback.core.rolling.RollingFileAppender">   
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>DEBUG</level>
    </filter>
    <prudent>false</prudent>
    <file>/logs/debug.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>/logs/old/debug.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
        <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
          <maxFileSize>100mb</maxFileSize>
        </timeBasedFileNamingAndTriggeringPolicy>
        <maxHistory>30</maxHistory> 
    </rollingPolicy>
    <encoder>
        <pattern>[%-5level] %d{HH:mm:ss.SSS} %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

- `<maxFileSize />` is the rollover size (kb and gb work too)
- `<maxHistory />` deletes logs older than 30 days, oldest first.
