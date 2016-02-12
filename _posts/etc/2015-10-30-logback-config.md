---
layout: post
title: logback에서 시간 + 용량 기준으로 로그파일 분할하기
date: '2015-10-30T11:18:00.001'
author: 페이퍼
tags: logback
header-img: "img/post-bg-06.jpg"
---

logback을 이용하는 경우 오늘이 지나거나 용량이 100메가를 넘어가면 파일이 분리된다.

#### logback.xml 에 아래 appender 추가
{% highlight xml %}
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
{% endhighlight %}

- `<maxFileSize />` 는 분할할 용량이다 (kb, gb도 된다)
- `<maxHistory />` 30일 지난 로그는 오래된 순서대로 지워준다.


