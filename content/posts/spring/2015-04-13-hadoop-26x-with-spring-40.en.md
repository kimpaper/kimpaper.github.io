---
layout: post
title: hadoop + spring integration test - hadoop 2.6.x with spring 4.0
date: '2015-04-12T19:46:00'
author: Paper
categories: spring
tags: [hadoop,spring]
url: /en/2015/04/12/hadoop-26x-with-spring-40/
---

Hadoop install and setup as below (osx Yosemite.) 
https://hadoop.apache.org/releases.html#Download ( 2.6.x version ) 

Installed following this blog 
http://iamhereweare.blogspot.kr/2014/05/hadoop.html


#### Add the dependency below to pom.xml. 
```xml
<dependency>
  <groupid>org.springframework.data</groupId>
  <artifactid>spring-data-hadoop</artifactId>
  <version>2.1.1.RELEASE</version>
</dependency>
```


#### Add context-hadoop.xml to the spring config 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:hdp="http://www.springframework.org/schema/hadoop"
      xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/hadoop http://www.springframework.org/schema/hadoop/spring-hadoop.xsd">

    <hdp:configuration id="hdConf">
        fs.default.name=hdfs://localhost:9000
    </hdp:configuration>
</beans>
```


Write the test code like below. 
#### HdTestServiceTest.java 
```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration({
        "classpath:servlet-context.xml",
        "classpath:config/context-datasource.xml",
        "classpath:config/context-hadoop.xml"
})
public class HdTestServiceTest {
    private static final Logger logger = LoggerFactory.getLogger(HdTestService.class);

    @Autowired
    private org.apache.hadoop.conf.Configuration hdConf;

    @Test
    public void testDoTest() throws Exception {
        FileSystem hdfs = null;
        try {
            Path filePath = new Path("/tmp/test.txt");
            logger.info("filePath.uri={}", filePath.toUri());

            hdfs = FileSystem.get(filePath.toUri(), hdConf);

            if(hdfs.exists(filePath)) {
                logger.info("read file path={}", filePath);
                BufferedReader r = new BufferedReader(new InputStreamReader(hdfs.open(filePath), "utf-8"));
                String line = null;
                do {
                    line = r.readLine();
                    logger.info("  line={}", line);
                }
                while(line != null);
                r.close();

                // dfs.delete(filePath, true);
            } else {
                logger.info("create new file path={}", filePath);

                FSDataOutputStream out = hdfs.create(filePath, false);
                out.write("한글 생성 테스트".getBytes("utf-8"));
                out.flush();
                out.close();
            }
        }
        finally {
            IOUtils.closeQuietly(hdfs);
        }
    }
}
```

Works fine. Though still stuck on local.. <del>no server to escape to..</del>  
With the code above you can implement file upload and download.   
