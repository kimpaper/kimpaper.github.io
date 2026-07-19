---
layout: post
title: practicing spring jpa @NamedQuery, @NamedNativeQuery
date: '2015-10-08T01:32:00'
author: Paper
categories: spring
tags: [spring,java,jpa]
---

In jpa.. you can query data through a repository with findAll or the findOneBy.... series,
but you can also write specific queries directly like below.

#### /classes/META-INF/orm.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<entity-mappings xmlns="http://java.sun.com/xml/ns/persistence/orm"
                 version="2.0">

    <named-query name="Inter.findByAlal2">
        <query>select i from Inter i where i.internameko = ?1</query>
    </named-query>

    <named-native-query name="Inter.findByAlal" result-class="sample.jpa.Inter">
        <query>select a.inter_seq, a.inter_name_ko, a.inter_name_en from tb_inter a where a.inter_name_ko = ?</query>
    </named-native-query>

</entity-mappings>
```

Or.. you can declare it on the Entity class like below

```java
@Entity @Table(name="tb_inter")
@NamedQuery(name = "User.findByAlal2",
  query = "select i from Inter i where i.internameko = ?1")
public class Inter {
....
}
```

(@Query is a similar annotation, and it goes on the Repository.)

**Difference between named-query and named-native-query**
 - named-query runs the query against the Entity declared in the code. (see Inter.java)
 - named-native-query runs the query directly against the db. (so result-class must be specified.)

#### Inter.java
```java
@Entity @Table(name="tb_inter")
public class Inter {
    @Id @Column(name = "inter_seq") @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer interseq;
    @Column(name = "inter_name_ko") @Expose
    private String internameko;
    @Column(name = "inter_name_en") @Expose
    private String internameen;
}
```

