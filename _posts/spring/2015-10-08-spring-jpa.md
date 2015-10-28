---
layout: post
title: 'spring jpa 조회 연습 '
date: '2015-10-07T18:04:00.001-07:00'
author: 페이퍼
tags: spring java jpa
categories: spring
modified_time: '2015-10-12T02:44:41.766-07:00'
blogger_id: tag:blogger.com,1999:blog-335715462918866001.post-4483482309913710725
blogger_orig_url: http://kimpaper.blogspot.com/2015/10/spring-jpa.html
---

entity 작업에 조회까지.. 테스트 해봤습니다.

- 테이블의 관계가 아래와 같을때 상황

```
tb_member -< tb_member_inter >- tb_inter
```

**조회 조건**
1. Member를 가져오면.. member의 이미지들과... inter의 목록을 함께 가져오도록
2. inter의 상세 정보는 tb_inter에 있음 (가져올때 조인해서..)


**아래 class들 간략 설명**
- MemberInter의 PK가 두개이므로. 위와 같이 클래스를 하나 만들어서 @IdClass를 지정해야 함
- @Expose 는 Gson관련하여 화면에 뿌릴 필드를 정하는 옵션입니다. jpa와는 무관합니다.
- MemberInter.class에서 많이 헷갈렸습니다. (@ManyToOne)
  - @JoinColumn을 추가로.. 써야 합니다.
  - optional을 true로 하면 join시 outer join을 합니다. (false는 inner join)

**FetchType**
- FetchType.EAGER -> 즉시 조회해서 데이타 채움
- FetchType.LAZY -> 필요시 DB조회


> 필드명은 카멜케이스CamelCase를 꼭 써야 한다. 안그럼 나중에 method named query 시에 곤란해진다.



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


test 코드...
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


