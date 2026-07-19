---
layout: post
title: 'calling a spring jpa namedQuery directly'
date: '2015-11-13T17:57:00'
author: Paper
categories: spring
tags: [spring,jpa]
header-img: 'img/post-bg-06.jpg'
---

As in `Test.java`, you can execute a NamedQuery defined in `orm.xml` directly with the `EntityManager`..   
> Calling it through a `repository` seems to only run as `getResultList`.
> Called it like below to get the number of updated rows.

#### Test.java 
```java
@PersistenceContext private EntityManager em;

public void test() {
    int cnt = em.createNamedQuery("Order.clearOrder").executeUpdate();
    logger.info("Order.clearOrder updated={}", cnt);
}
```
> About `@PersistenceContext private EntityManager em;` ..  
> Both `@PersistenceContext` and `@Autowired` seem to work. Not sure about the difference yet.


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

