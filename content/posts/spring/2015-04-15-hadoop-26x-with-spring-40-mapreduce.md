---
layout: post
title: 하둡 스프링 연동 테스트2 - hadoop 2.6.x with spring 4.0 (MapReduce WordCount example)
date: '2015-04-15T00:39:00'
author: 페이퍼
categories: spring
tags: [hadoop,spring]
url: /2015/04/15/2-hadoop-26x-with-spring-40-mapreduce/
---

#### context-hadoop.xml에 아래 내용 추가. 
```xml
<hdp:configuration id="hdConf">
    fs.default.name=hdfs://localhost:9000
</hdp:configuration>

<hdp:job id="wordCountJob"
        input-path="/input/"
        output-path="/output/"
        configuration-ref="hdConf"
        mapper="delim.app.service.WordCount$TokenizerMapper"
        reducer="delim.app.service.WordCount$IntSumReducer"
        >
</hdp:job>

<hdp:job-runner id="wordCountJobRunner" job-ref="wordCountJob" run-at-startup="false">
</hdp:job-runner>
```


#### WordCount.java
```java
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.StringTokenizer;

public class WordCount {
    private static final Logger logger = LoggerFactory.getLogger(WordCount.class);

    public static class TokenizerMapper
            extends Mapper<Object, Text, Text, IntWritable> {

        private final static IntWritable one = new IntWritable(1);
        private Text word = new Text();

        @Override
        public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
            logger.info("map key={}, value={}", key, value);

            StringTokenizer itr = new StringTokenizer(value.toString());
            while (itr.hasMoreTokens()) {
                word.set(itr.nextToken());
                context.write(word, one);
            }
        }
    }


    public static class IntSumReducer
            extends Reducer<Text, IntWritable, Text, IntWritable> {
        private IntWritable result = new IntWritable();

        @Override
        public void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
            logger.info("reduce key={}", key);

            int sum = 0;
            for (IntWritable val : values) {
                sum += val.get();
            }
            result.set(sum);
            context.write(key, result);
        }
    }
}
```


#### Test.java  
```java
@Autowired
private org.apache.hadoop.conf.Configuration hdConf;

@Autowired
private JobRunner wordCountJobRunner;

@Before
public void beforeCopyFile() throws IOException {
    String file = "/Users/paper/Desktop/4/14/debug.2015-04-09.log";

    Path srcFilePath = new Path(file);
    Path dstFilePath = new Path("/input/debug.2015-04-09.log");

    FileSystem hdfs = FileSystem.get(dstFilePath.toUri(), hdConf);
    hdfs.copyFromLocalFile(false, true, srcFilePath, dstFilePath);

    hdfs.delete(new Path("/output/"), true);
}

@Test
public void testRunJob() throws Exception {
    wordCountJobRunner.call();
}
```

1. Before를 통하여 로컬에 있는 debug.log 파일을 hdfs에 카피 해놓는다.   
2. Job을 실행한다.  
3. 실행하면 debug.log 파일을 line단위로 읽어들이는걸 확인 할 수 있다. (WordCount$TokenizerMapper)  

