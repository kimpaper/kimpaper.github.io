---
layout: post
title: 하둡 스프링 연동 테스트 - hadoop 2.6.x with spring 4.0
date: '2015-04-12T19:46:00.002-07:00'
author: 페이퍼
tags: hadoop spring
categories: spring
modified_time: '2015-10-05T20:37:14.650-07:00'
blogger_id: tag:blogger.com,1999:blog-335715462918866001.post-7603073138487848030
blogger_orig_url: http://kimpaper.blogspot.com/2015/04/hadoop-26x-with-spring-40.html
---

Hadoop 설치 및 설정은 아래와 같이 (osx 요세미티.) 
https://hadoop.apache.org/releases.html#Download ( 2.6.x 버전 ) 

설치는 아래 블로그 보고 함 
http://iamhereweare.blogspot.kr/2014/05/hadoop.html


#### pom.xml 에 아래 dependency 추가. 
```xml
<dependency>
  <groupid>org.springframework.data</groupId>
  <artifactid>spring-data-hadoop</artifactId>
  <version>2.1.1.RELEASE</version>
</dependency>
```


#### context-hadoop.xml spring 설정에 파일 추가 
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


아래와 같이 test코드 작성. 
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

잘된다. 다만 아직 로컬에서 못벗어 났지만.. ~~벗어날 서버가 없어..~~  
위 코드를 이용하면 파일 업로드 다운로드까지는 구현이 가능합니다.   
