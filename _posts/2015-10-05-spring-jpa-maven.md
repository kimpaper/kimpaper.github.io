---
layout: post
title: spring jpa 설정 및 테스트 (maven 설정)
date: '2015-10-05T00:41:00.001-07:00'
author: 페이퍼
tags: spring jpa
categories: spring
modified_time: '2015-10-12T02:44:48.380-07:00'
blogger_id: tag:blogger.com,1999:blog-335715462918866001.post-7944949787333282
blogger_orig_url: http://kimpaper.blogspot.com/2015/10/spring-jpa-maven.html
---
거의 대부분 mybatis 를 이용하여 개발을 하는데..

JPA가 대세라고 해서 가벼운 프로젝트에 연동을 해봤습니다.

1. 라이브러리 import....
maven pom.xml
```xml
<dependency>
   <groupid>org.springframework.data</groupid>
   <artifactid>spring-data-jpa</artifactid>
   <version>1.9.0.RELEASE</version>
</dependency>
<dependency>
   <groupid>org.hibernate</groupid>
   <artifactid>hibernate-entitymanager</artifactid>
   <version>4.3.8.Final</version>
</dependency>
```


2. Entity class를 만들어 줍니다.
참고로 SerializedName, Expose는  jpa와 직접 관련은 없습니다.. (개체를 그대로 JsonView 할때 사용)
```java
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import javax.persistence.*;

@Entity
@Table(name="tb_notice")
public class Notice {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "notice_id")
    @SerializedName(value = "notice_id")
    @Expose
    private Integer noticeId;

    @Column(name="title", nullable = false)
    @Expose
    private String title;

    @Column(name="content", nullable = false)
    @Expose
    private String content;

    @Column(name="reg_date", nullable = false)
    @SerializedName(value = "reg_date")
    @Expose
    private String regDate;

    @Column(name="del_yn", nullable = false)
    @Expose(serialize = false, deserialize = false)
    private String delYn;

    public Integer getNoticeId() {
        return noticeId;
    }

    public void setNoticeId(Integer noticeId) {
        this.noticeId = noticeId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getRegDate() {
        return regDate;
    }

    public void setRegDate(String regDate) {
        this.regDate = regDate;
    }

    public String getDelYn() {
        return delYn;
    }

    public void setDelYn(String delYn) {
        this.delYn = delYn;
    }
}
```



3. repository 를 만들어줍니다. (아무것도 없어도 된다)
```java
public interface NoticeRepository extends JpaRepository&lt;Notice, Integer> {

}
```



4. context-jpa.xml 설정합니다. (txManager2인 이유는 기존에 mybatis에 영향을 주지 않기 위해서입니다. , mybatis를 한번에 다 걷어낼 자신이 없...)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:jpa="http://www.springframework.org/schema/data/jpa"
    xmlns:tx="http://www.springframework.org/schema/tx"
    xmlns:aop="http://www.springframework.org/schema/aop"
    xmlns:p="http://www.springframework.org/schema/util"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans.xsd
    http://www.springframework.org/schema/data/jpa
    http://www.springframework.org/schema/data/jpa/spring-jpa.xsd
    http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util.xsd
    http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-3.1.xsd
    http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-3.1.xsd
    ">

    <!-- Configure the transaction manager bean -->
    <bean class="org.springframework.orm.jpa.JpaTransactionManager" id="txManager2">
        <property name="entityManagerFactory" ref="entityManagerFactory">
        </property>
    </bean>

    <tx:advice id="txAdvice2" transaction-manager="txManager2">
        <tx:attributes>
            <tx:method name="*" rollback-for="Exception">
            </tx:method>
        </tx:attributes>
    </tx:advice>

    <aop:config>
        <aop:pointcut expression="execution(* sample..service..*.sr*(..))" id="requiredTx2">
            <aop:advisor advice-ref="txAdvice2" pointcut-ref="requiredTx2">
            </aop:advisor>
        </aop:pointcut>
    </aop:config>

    <bean class="org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter" id="hibernateJpaVendorAdapter">
        <property name="showSql" value="true">
        </property>
    </bean>

    <!-- Configure the entity manager factory bean -->
    <bean class="org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean" id="entityManagerFactory">
        <property name="dataSource" ref="dataSource">
            <property name="jpaVendorAdapter" ref="hibernateJpaVendorAdapter">
                <property name="packagesToScan" value="sample.app">
                </property>
            </property>
        </property>
    </bean>

    <jpa:repositories base-package="sample.app" transaction-manager-ref="txManager2">
    </jpa:repositories>
</beans>
```



5. 사용 예제
```java
@Service
public class NoticeService extends ServiceBase  {
    private static final Logger logger = LoggerFactory.getLogger(NoticeService.class);

    @Autowired
    private NoticeRepository noticeRepository;

    public void srXX(RequestData req, ResponseData res) throws Exception {
        List&lt;Notice> list = noticeRepository.findAll();
        res.put("notice_list", list);
    }
}
```


인터넷상에 자료가 많아서 설정은 어렵지 않았습니다.

하지만 실제로 사용에 요령이 필요하다고 하네요.. (제대로 이해를 하지 않고 사용하면 성능에도 영향을 준다고 함)

