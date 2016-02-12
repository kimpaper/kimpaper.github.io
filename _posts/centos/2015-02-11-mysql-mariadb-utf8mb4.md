---
layout: post
title: mysql, mariadb에서 유니코드(utf8mb4) 지원하기
date: '2015-02-10T20:48:00.000'
author: 페이퍼
tags: mysql mariadb
modified_time: '2015-10-07T20:26:58.282'
blogger_id: tag:blogger.com,1999:blog-335715462918866001.post-8973682977912771711
blogger_orig_url: http://kimpaper.blogspot.com/2015/02/mysql-mariadb-utf8mb4.html
---

#### 1. 현재 설정된 상태 확인

```shell
MariaDB [(none)]> show variables like "%character%";show variables like "%collation%";
 +--------------------------+---------------------------------+
 | Variable_name            | Value                           |
 +--------------------------+---------------------------------+
 | character_set_client     | utf8                            |
 | character_set_connection | utf8                            |
 | character_set_database   | utf8                            |
 | character_set_filesystem | binary                          |
 | character_set_results    | utf8                            |
 | character_set_server     | utf8                            |
 | character_set_system     | utf8                            |
 | character_sets_dir       | /usr/local/mysql/share/charsets/|
 +--------------------------+---------------------------------+
```



#### 2. sudo vi /etc/my.cnf 파일을 아래 부분 수정  
```shell
[client]
default-character-set=utf8mb4

[mysql]
default-character-set=utf8mb4

[mysqld]
collation-server = utf8mb4_unicode_ci
character-set-server = utf8mb4
```



#### 3. 서비스 재시작
```shell
service mysql restart
```


#### 4. 확인 
```shell
MariaDB [(none)]> show variables like "%character%";show variables like "%collation%";

+--------------------------+----------------------------+
| Variable_name            | Value                      |
+--------------------------+----------------------------+
| character_set_client     | utf8mb4                    |
| character_set_connection | utf8mb4                    |
| character_set_database   | utf8mb4                    |
| character_set_filesystem | binary                     |
| character_set_results    | utf8mb4                    |
| character_set_server     | utf8mb4                    |
| character_set_system     | utf8                       |
| character_sets_dir       | /usr/share/mysql/charsets/ |
+--------------------------+----------------------------+
8 rows in set (0.00 sec)

+----------------------+--------------------+
| Variable_name        | Value              |
+----------------------+--------------------+
| collation_connection | utf8mb4_general_ci |
| collation_database   | utf8mb4_unicode_ci |
| collation_server     | utf8mb4_unicode_ci |
+----------------------+--------------------+
3 rows in set (0.00 sec)
```

마지막으로 실제 적용할 컬럼의 타입을 바꿔야 한다.

utf8mb4로 바꿔야 합니다.

