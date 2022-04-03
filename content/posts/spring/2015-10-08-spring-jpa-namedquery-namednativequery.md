---
layout: post
title: spring jpa의 @NamedQuery, @NamedNativeQuery 연습
date: '2015-10-08T01:32:00'
author: 페이퍼
categories: spring
tags: [spring,java,jpa]
categories: spring
---

jpa에서.. repository를 이용하여 findAll이나.. findOneBy.... 시리즈를 써서 데이타를 조회 할수 있지만
아래와 같이 특정 쿼리를 직접 입력하여 이용도 가능합니다.

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

또는.. 아래와 같이 Entity 클래스에 선언해도 됩니다

```java
@Entity @Table(name="tb_inter")
@NamedQuery(name = "User.findByAlal2",
  query = "select i from Inter i where i.internameko = ?1")
public class Inter {
....
}
```

(비슷한 속성으로는 @Query도 사용가능하고. 이 속성은 Repository에 사용합니다.)

**named-query와 named-native-query의 차이점**
 - named-query는 현재 코드내에 선언한 Entity를 기준으로 쿼리를 날린다. (Inter.java파일 참고)
 - named-native-query는 db에 직접 쿼리를 날린다. (그러므로 result-class를 지정해야 한다.)

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


