---
layout: post
title: spring junit testcase 작성
date: '2015-03-24T22:42:00'
author: 페이퍼
tags: spring junit spring-test
---

#### pom.xml에 아래 추가. 
{% highlight xml %}
<dependency>
   <groupId>org.springframework</groupId>
   <artifactId>spring-test</artifactId>
   <version>4.0.5.RELEASE</version>
   <scope>test</scope>
</dependency>
{% endhighlight %}


#### test java코드 MemberServiceTest.java  
{% highlight java %}
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
{% endhighlight %}



이때 디비를 jndi-lookup 를 이용하는 경우를 위해 test/resources/config/context-datasource.xml 을 넣어서 아래와 같이 기존 id를 덮었다.

#### test/resources/config/context-datasource.xml 파일 
{% highlight xml %}
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
{% endhighlight %}



