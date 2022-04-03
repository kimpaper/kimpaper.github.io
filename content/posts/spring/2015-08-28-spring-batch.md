---
layout: post
title: 'spring batch 사용 '
date: '2015-08-27T22:44:00'
author: 페이퍼
categories: spring
tags: [spring]
---

최근에 spring-batch를 사용해 봤는데.. 결과는 성공적 특히 트랜잭션commit size와 read size를 따로 지정할 수 있다는게 좋은것 같다.  
쿼리나 기타 로직보다 아래 설정이 중요한 듯 하여 아래 설정을 기록으로 남긴다.

job에 대해서 요약하면  
**reader에서 데이타를 읽어서 process 에서 처리 하고 writer로 결과를 기록 한다.**

물론 위 설정 외에 각 시작 구간마다 이벤트를 받아 처리 할 수 있는 listener 같은 것도 제공한다.

reader, writer는 커스텀 하지 않고 mybatis에서 기본으로 제공하는 걸 이용했다.  
참고) https://mybatis.github.io/spring/ko/batch.html


```xml
<bean id="jobLauncher" class="org.springframework.batch.core.launch.support.SimpleJobLauncher">
    <property name="jobRepository" ref="jobRepository" />
</bean>

<bean id="jobRepository"
  class="org.springframework.batch.core.repository.support.MapJobRepositoryFactoryBean">
  <property name="transactionManager" ref="transactionManager"/>
</bean>

<!-- sent type sent -->
<job:job id="rstJob" job-repository="jobRepository">
    <job:step id="step1">
        <tasklet>
            <chunk reader="rstReader" processor="memberRstProcess"
             writer="rstWriter" commit-interval="500">
         </chunk>
     </tasklet>
 </job:step>
</job:job>

<bean id="memberRstProcess" class="com.xxxxx.MemberRstProcess" />
<bean id="rstReader"
  class="org.mybatis.spring.batch.MyBatisPagingItemReader"
  p:sqlSessionFactory-ref="sqlSessionFactory"
  p:queryId="com.xxxxx.mapper.QueryMapper.selectMemberRstList"
  p:pageSize="500"
  scope="step" />

  <bean id="rstWriter" class="org.mybatis.spring.batch.MyBatisBatchItemWriter">
    <property name="sqlSessionFactory" ref="sqlSessionFactory" />
    <property name="statementId" value="com.xxxxx.mapper.QueryMapper.updateMemberRst" />
</bean>
```



