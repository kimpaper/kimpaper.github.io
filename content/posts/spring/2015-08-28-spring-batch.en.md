---
layout: post
title: 'using spring batch '
date: '2015-08-27T22:44:00'
author: Paper
categories: spring
tags: [spring]
---

Tried spring-batch recently.. worked out well. Being able to set the transaction commit size and read size separately seems especially nice.  
The config below matters more than the queries or other logic, so I'm keeping it here as a record.

To sum up the job:  
**the reader reads data, the processor handles it, and the writer records the result.**

Besides the config above, it also provides things like listeners that catch events at each stage.

I didn't customize the reader and writer — just used the ones mybatis provides by default.  
Reference) https://mybatis.github.io/spring/ko/batch.html


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

