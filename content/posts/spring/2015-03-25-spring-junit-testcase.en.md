---
layout: post
title: writing spring junit testcases
date: '2015-03-24T22:42:00'
author: Paper
categories: spring
tags: [spring,junit,spring-test]
---

#### Add the following to pom.xml. 
```xml
<dependency>
   <groupId>org.springframework</groupId>
   <artifactId>spring-test</artifactId>
   <version>4.0.5.RELEASE</version>
   <scope>test</scope>
</dependency>
```


#### Test java code MemberServiceTest.java  
```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration( {
  "classpath:servlet-context.xml",
  "classpath:config/context-datasource.xml"
}
)
public class MemberServiceTest {

    @Autowired
    MemberService memberService;


    @Test
    public void testSr2002() throws Exception {
        RequestData req = new RequestData(null, new DbMap());
        ResponseData res = new ResponseData(new DbMap());

        memberService.sr2002(req, res);
    }

}
```



Since the DB uses jndi-lookup, I put test/resources/config/context-datasource.xml in place to override the existing bean id like below.

#### test/resources/config/context-datasource.xml 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="dataSource"
          class="org.springframework.jdbc.datasource.DriverManagerDataSource"
          p:driverClassName="com.mysql.jdbc.Driver"
          p:url="jdbc:mysql://server:3306/dbname"
          p:username="sa"
          p:password="" />


</beans>
```

