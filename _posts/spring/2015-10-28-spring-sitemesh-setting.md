---
layout: post
title: spring + sitemesh 웹사이트 구축
date: '2015-10-28T17:08:00'
author: 페이퍼
tags: spring sitemesh
header-img: "img/post-bg-04.jpg"
---

sitemesh를 설정을 해보겠습니다.

#### pom.xml
{% highlight xml %}
<dependency>
    <groupId>opensymphony</groupId>
    <artifactId>sitemesh</artifactId>
    <version>2.4.2</version>
</dependency>
{% endhighlight %}


#### WEB-INF/web.xml 에 아래 추가.
{% highlight xml %}
<filter>
    <filter-name>sitemesh</filter-name>
    <filter-class>com.opensymphony.module.sitemesh.filter.PageFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>sitemesh</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
{% endhighlight %}

#### WEB-INF/sitemesh.xml
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<sitemesh>
    <property name="decorators-file" value="/WEB-INF/decorators.xml" />
    <excludes file="${decorators-file}" />

    <page-parsers>
        <parser content-type="text/html"
                class="com.opensymphony.module.sitemesh.parser.HTMLPageParser" />
        <parser content-type="text/html;charset=UTF-8"
                class="com.opensymphony.module.sitemesh.parser.HTMLPageParser" />
    </page-parsers>

    <decorator-mappers>
        <mapper class="com.opensymphony.module.sitemesh.mapper.PrintableDecoratorMapper">
            <param name="decorator" value="printable" />
            <param name="parameter.name" value="printable" />
            <param name="parameter.value" value="true" />
        </mapper>

        <mapper class="com.opensymphony.module.sitemesh.mapper.PageDecoratorMapper" >
            <param name="property" value="meta.decorator" />
        </mapper>

        <mapper class="com.opensymphony.module.sitemesh.mapper.ConfigDecoratorMapper">
            <param name="config" value="${decorators-file}" />
        </mapper>
    </decorator-mappers>
</sitemesh>
{% endhighlight %}
sitemesh.xml파일은 수정할 부분이 거의 없습니다 (decorators.xml파일 경로) 

#### WEB-INF/decorators.xml
{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<decorators defaultdir="/decorators">
    <excludes>
        <pattern>/*.json</pattern>
    </excludes>
    <decorator name="top" page="/views/layout/top.jsp" />
    <decorator name="left" page="/views/layout/left.jsp" />
    <decorator name="layout2" page="/views/layout/layout2.jsp">
        <pattern>/login</pattern>
        <pattern>/login_error</pattern>
    </decorator>
    <decorator name="layout" page="/views/layout/layout.jsp">
        <pattern>/*</pattern>
    </decorator>
</decorators>
{% endhighlight %}
셋팅은 위와 같이 xml만 넣어주면 완료됩니다.
- ```<excludes>```에는 decorator를 적용하지 않을 url패턴을 입력합니다.
- ```<decorator>```실제 적용될 jsp 레이아웃이나 템플릿입니다.
- name, page 로 구성되며 name은 ```<page:applyDecorator name="top" />``` 처럼 다른 decorator에 적용될 수 있습니다.
- ```<pattern>/login</pattern>```은 decorator를 적용할 Url을 지정합니다. 


## 사용법

기본 레이아웃인 layout.jsp 파일 입니다.
#### /views/layout/layout.jsp
{% highlight jsp %}
<%@ page language="java" contentType="text/html; charset=UTF-8"    pageEncoding="UTF-8"%>
<%@ taglib prefix="decorator" uri="http://www.opensymphony.com/sitemesh/decorator"%>
<%@ taglib prefix="page" uri="http://www.opensymphony.com/sitemesh/page" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>sample</title>
    <decorator:head/>
</head>
<body>
<div class="wrapper">
    <header class="main-header">
        <page:applyDecorator name="top" />
    </header>

    <!-- Left side column. contains the logo and sidebar -->
    <aside class="main-sidebar">
        <page:applyDecorator name="left" />
    </aside>

    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
        <decorator:body />
    </div><!-- /.content-wrapper -->

    <footer class="main-footer">
        <div class="pull-right hidden-xs">
            <b>Version</b> 0.0.1
        </div>
        <strong>Copyright &copy; 2015 sample </strong> All rights reserved.
    </footer>
</div>
</body>
</html>
{% endhighlight %}

제가 사용하는 layout.jsp를 그대로 올린건 아니고 간단히 요약을 했습니다.  (오류가 있을수도..)
- ```<decorator:head />``` 적용되는 대상 페이지에서 ```<head>``` 의 내용을 가져다 붙여 줍니다.
- ```<page:applyDecorator name="top" />``` top의 decorator를 가져와 붙여 줍니다. (include 라고 생각하시면 이해가 빨라요!)
- ```<page:applyDecorator name="left" />``` left의 decorator를 가져와 붙여 줍니다.
- ```<decorator:body />``` 적용되는 대상 페이지에서 ```<body>``` 의 내용을 가져와 붙입니다.

이제 실제로 MVC에서 사용하는 jsp파일입니다.

#### /views/appInfo/list.jsp
{% highlight jsp %}
<%@ page language="java" contentType="text/html; charset=UTF-8"    pageEncoding="UTF-8"%>
<head>
    <!-- page script -->
    <script>
      ....
    </script>
</head>
<body>
<!-- Content Header (Page header) -->
<section class="content-header">
    <h1>
        데이타 관리
        <small>버전관리</small>
    </h1>
    <ol class="breadcrumb">
        <li><a href="#"><i class="fa fa-dashboard"></i> Home</a></li>
        <li><a href="#">데이타관리</a></li>
        <li class="active">버전관리</li>
    </ol>
</section>

<!-- Main content -->
<section class="content">
    <div class="row">
        <div class="col-xs-12">

            <div class="box">
                <div class="box-header">
                    <h3 class="box-title">버전 목록</h3>
                    <a href="create"><button type="button" class="btn btn-primary btn-lg pull-right">신규 추가</button></a>
                </div><!-- /.box-header -->
                <div class="box-body">
                    <table id="list" class="table table-bordered table-hover">
                    </table>
                </div><!-- /.box-body -->
            </div><!-- /.box -->

        </div><!-- /.col -->
    </div><!-- /.row -->
</section><!-- /.content -->

</body>
{% endhighlight %}

list.jsp와 같이 원하는 jsp에 ```<head>```  ```<body>```를 구성하면 layout.jsp의 형식으로 출력되게 됩니다.

