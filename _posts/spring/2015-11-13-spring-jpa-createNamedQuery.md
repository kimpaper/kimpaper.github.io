---
layout: post
title: 'spring jpa namedQuery 직접 호출하기'
date: '2015-11-13T17:57:00'
author: 페이퍼
tags: spring jpa
header-img: 'img/post-bg-06.jpg'
---

`Test.java`에서 처럼 `EntityManager`를 이용하여 `orm.xml`에 정의한 NamedQuery를 바로 실행 할 수 있다..   
> `repository`를 이용하여 호출하면 `getResultList`로만 실행되는 것 같다.
> update 반영된 Row수를 알기 위해 아래와 같이 호출 했다.

#### Test.java 
```java
@PersistenceContext private EntityManager em;

public void test() {
    int cnt = em.createNamedQuery("Order.clearOrder").executeUpdate();
    logger.info("Order.clearOrder updated={}", cnt);
}
```
> `@PersistenceContext private EntityManager em;` 에서..  
> `@PersistenceContext` `@Autowired` 둘다 작동 하는것 같다. 차이는 아직 잘 모르겠다.


#### META-INF/orm.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<entity-mappings xmlns="http://java.sun.com/xml/ns/persistence/orm"
                 version="2.0">
    <named-native-query name="Order.clearOrder">
        <query>
update tb_order
   set order_name=null 
     , order_date=null
     , order_no=null
     , order_state='S00'
        </query>
    </named-native-query>
</entity-mappings>
```


