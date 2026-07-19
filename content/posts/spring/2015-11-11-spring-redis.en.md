---
layout: post
title: 'spring redis integration '
date: '2015-11-10T17:36:00'
author: Paper
categories: spring
tags: [spring,redis]
header-img: "img/post-bg-05.jpg"
---
#### Add the following to pom.xml.
```xml
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-redis</artifactId>
    <version>1.1.0.RELEASE</version>
</dependency>
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>2.1.0</version>
</dependency>
```
> Match the versions carefully. Otherwise some classes are missing and you get errors.


#### context-redis.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:p="http://www.springframework.org/schema/p"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans-3.2.xsd">

    <bean id="jedisConnFactory"
          class="org.springframework.data.redis.connection.jedis.JedisConnectionFactory"
          p:usePool="true"
          p:hostName="172.xxx.xxx.xxx"
          p:port="6379"
    />

    <!-- redis template definition -->
    <bean id="redisTemplate"
          class="org.springframework.data.redis.core.RedisTemplate"
          p:connectionFactory-ref="jedisConnFactory"
    />
</beans>
```
> `6379` is the redis default port. Can be changed at install time.

#### RedisTest.java
```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration( {
        "classpath:spring/application-context.xml"
}
)
public class RedisTest {
    private static final Logger logger = LoggerFactory.getLogger(RedisTest.class);

    @Autowired
    RedisTemplate<String, String> redisTemplate;

    @Resource(name="redisTemplate")
    private ValueOperations<String, ResultMap> valueOps;

    @Test
    public void testTp4110() throws Exception {
        // redisTemplate.delete("1");

        ResultMap res = valueOps.get("1");
        if(res == null) {
            logger.info("create.. cache..");
            // create..
            // 10분 캐시
            valueOps.set("1", ResultMap.create(), 10, TimeUnit.MINUTES);
            res = valueOps.get("1");
        }

        logger.info("redis-test={}", res);

        res = valueOps.get("2");
        logger.info("redis-test={}", res);
    }
}
```


### Result
```text
...
[INFO ] 17:30:28.990 [main] - create.. cache..
[INFO ] 17:30:29.190 [main] - redis-test={result_code=0000, result_message=success}
[INFO ] 17:30:29.288 [main] - redis-test=null
...
```

