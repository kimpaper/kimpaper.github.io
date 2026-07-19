---
layout: post
title: 'spring jpa query practice '
date: '2015-10-07T18:04:00'
author: Paper
categories: spring
tags: [spring,java,jpa]
---

Tested entity mapping plus queries..

- Given table relationships like this

```
tb_member -< tb_member_inter >- tb_inter
```

**Query conditions**
1. When fetching a Member.. also fetch the member's images... and the list of inters
2. Inter details live in tb_inter (join when fetching..)


**Quick notes on the classes below**
- MemberInter has two PKs, so you need to make a separate class and specify @IdClass as shown
- @Expose is a Gson option for choosing which fields to render. Nothing to do with jpa.
- MemberInter.class confused me a lot. (@ManyToOne)
  - You also need.. @JoinColumn.
  - optional=true makes the join an outer join. (false is inner join)

**FetchType**
- FetchType.EAGER -> fetch immediately and fill the data
- FetchType.LAZY -> query the DB when needed


> Field names must use CamelCase. Otherwise method named queries get painful later.



#### Member.java

```java
@Entity @Table(name = "tb_member")
public class Member {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer member_seq;

    @Expose
    @OneToMany(
            targetEntity = Image.class
            , cascade = CascadeType.ALL
            , fetch = FetchType.EAGER
            , mappedBy = "member_seq")
    private List<image> imageList;

    @Expose
    @OneToMany(
            targetEntity = MemberInter.class
            , cascade = CascadeType.ALL
            , fetch = FetchType.EAGER
            , mappedBy = "member_seq")
    private List<Memberinter> memberInterList;
}
```


#### MemberRepository.java

```java
public interface MemberRepository extends JpaRepository<Member, Integer> {

}
```


#### Image.java

```java
@Entity
@Table(name = "tb_image")
public class Image {
    @Id
    @GeneratedValue
    private Integer image_seq;
    @Column
    private Integer member_seq;
    @Column @Expose
    private String file_name;
}
```


#### Inter.java

```java
@Entity @Table(name="tb_inter") @Embeddable
public class Inter {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer inter_seq;
    @Column @Expose
    private String inter_name_ko;
}
```


#### MemberInter.java

```java
@Entity @Table(name="tb_member_inter") @IdClass(MemberInterPk.class)
public class MemberInter {
    @Id @Column
    private Integer member_seq;

    @Id @Column(insertable = false, updatable = false)
    private Integer inter_seq;

    @ManyToOne(
            targetEntity = Inter.class
            ,cascade = CascadeType.ALL
            ,fetch = FetchType.EAGER
            ,optional = false
    )
    @JoinColumn(name = "inter_seq")
    @Expose
    private Inter inter;
}
```


#### MemberInterPk.java

```java
public class MemberInterPk implements Serializable {
    private Integer member_seq;
    private Integer inter_seq;
}
```


Test code...
#### TestServiceTest.java

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration({
        "classpath:servlet-context.xml",
        "classpath:config/context-datasource.xml"
})
public class TestServiceTest {
    private static final Logger logger = LoggerFactory.getLogger(TestServiceTest.class);

    @Autowired
    private Gson gson;

    @Autowired
    private MemberRepository memberRepository;

    @Test
    public void testGetMemberList() throws Exception {
        logger.info("------------ jpa test starting.... ------------------------");

        List&lt;member> list = memberRepository.findAll();
        logger.info("memberList={}", gson.toJson(list));

        logger.info("------------ jpa test ended....    ------------------------");
    }
}
```

