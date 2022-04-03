---
layout: post
title: 'spring-rabbitmq 연동 '
date: '2015-03-10T18:55:00'
author: 페이퍼
categories: spring
tags: [rabbitmq,centos,spring]
---

#### 설치는 그냥 rpm 으로 설치   

```bash
# 서버 시작.
sbin/rabbitmq-server start

# 서버 중지
sbin/rabbitmqctl stop
```

#### spring-rabbit 연동 pom.xml 

```xml
<dependency>
  <groupid>org.springframework.amqp</groupId>
  <artifactid>spring-rabbit</artifactId>
  <version>1.4.1.RELEASE</version>
</dependency>
```


#### context-rabbitmq.xml 

```xml
<!-- A reference to the org.springframework.amqp.rabbit.connection.ConnectionFactory -->
<rabbit:connection-factory id="connectionFactory" host="localhost" username="worker" password="workerpassword" />

<!-- Creates a org.springframework.amqp.rabbit.core.RabbitTemplate for access to the broker -->
<rabbit:template id="amqpTemplate" connection-factory="connectionFactory" />

<!-- Creates a org.springframework.amqp.rabbit.core.RabbitAdmin  to manage exchanges, queues and bindings -->
<rabbit:admin connection-factory="connectionFactory" />

<!-- Creates a queue for consumers to retrieve messages -->
<rabbit:queue name="simple_queue" />

<rabbit:listener-container  connection-factory="connectionFactory">
    <rabbit:listener queues="simple_queue" ref="mqService" />
</rabbit:listener-container>
```


#### MqService.java 

```java
@Service
public class MqService implements MessageListener {
    private static final Logger logger = LoggerFactory.getLogger(MqService.class);
    private static final String TASK_QUEUE_NAME = "simple_queue";

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void send(String message) throws IOException {
        rabbitTemplate.convertAndSend(TASK_QUEUE_NAME, message);

        logger.info("send message={}", message);
    }

    @Override
    public void onMessage(Message message) {
        String msg = null;
        try {
            msg = new String(message.getBody(), "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        logger.info("recv message=" + msg );
    }
}
```


