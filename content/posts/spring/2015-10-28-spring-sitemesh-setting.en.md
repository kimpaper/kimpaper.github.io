---
layout: post
title: building a website with spring + sitemesh
date: '2015-10-28T17:08:00'
author: Paper
categories: spring
tags: [spring,sitemesh]
url: /en/2015/10/28/spring-sitemesh-setting/
---

Let's set up sitemesh.

#### pom.xml
```xml
<dependency>
    <groupId>opensymphony</groupId>
    <artifactId>sitemesh</artifactId>
    <version>2.4.2</version>
</dependency>
```


#### Add the following to WEB-INF/web.xml.
```xml
<filter>
    <filter-name>sitemesh</filter-name>
    <filter-class>com.opensymphony.module.sitemesh.filter.PageFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>sitemesh</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

#### WEB-INF/sitemesh.xml
```xml
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
```
There's almost nothing to change in sitemesh.xml (just the decorators.xml file path) 

#### WEB-INF/decorators.xml
```xml
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
```
Setup is done once you drop in the xml above.
- ```<excludes>``` takes url patterns that should not get a decorator.
- ```<decorator>``` is the actual jsp layout or template to apply.
- It consists of name and page. The name can be used in other decorators like ```<page:applyDecorator name="top" />```.
- ```<pattern>/login</pattern>``` specifies the url the decorator applies to. 


## Usage

The default layout, layout.jsp.
#### /views/layout/layout.jsp
```xml
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
```

This isn't my actual layout.jsp — it's a simplified summary.  (there could be errors..)
- ```<decorator:head />``` pulls in the contents of ```<head>``` from the target page.
- ```<page:applyDecorator name="top" />``` pulls in and attaches the top decorator. (think of it as an include and it clicks fast!)
- ```<page:applyDecorator name="left" />``` pulls in and attaches the left decorator.
- ```<decorator:body />``` pulls in the contents of ```<body>``` from the target page.

Now an actual jsp file used in MVC.

#### /views/appInfo/list.jsp
```xml
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
```

Build ```<head>``` and ```<body>``` in any jsp like list.jsp and it gets rendered in the layout.jsp format.

