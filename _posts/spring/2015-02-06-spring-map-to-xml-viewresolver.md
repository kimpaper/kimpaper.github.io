---
layout: post
title: spring map to xml viewresolver
date: '2015-02-05T17:16:00'
author: 페이퍼
tags: spring xmlview
---
항상 json으로만 뱉다가 xml로 뱉어야 하는 상황이 발생해서 만든 spring view 클래스  
결과가 map에 경우에만 해당됨

아래 설정하고...
#### applicationServlet.xml
```xml
    <beans:bean id="xmlView2" class="org.springframework.web.servlet.view.XmlViewResolver">
        <beans:property name="order" value="1"/>
        <beans:property name="location" value="classpath:xml-views.xml"/>
    </beans:bean>
```

#### xml-views.xml 내용.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE beans PUBLIC "-//SPRING//DTD BEAN//EN"
        "http://www.springframework.org/dtd/spring-beans.dtd">
<beans>
    <bean name="xmlView"  class="com.xxxxx.view.AjaxResponseXMLView">
        <property name="contentType">
            <value>text/xml;charset=utf-8</value>
        </property>
    </bean>
</beans>
```

#### AjaxResponseXMLView.java 아래 클래스를 이용함
```java
public class AjaxResponseXMLView extends AbstractView {

    @Override
    protected void renderMergedOutputModel(Map map, HttpServletRequest request,
                                           HttpServletResponse response) throws Exception {
        String xmlHeader = "\r\n";

        StringBuffer xmlSb = new StringBuffer();
        xmlSb.append(xmlHeader);
        xmlSb.append("");
        writeFromMap(xmlSb, map);
        xmlSb.append("");

        response.setContentType("application/xml");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Cache-Control", "no-cache");
        response.setContentLength(xmlSb.toString().getBytes("utf-8").length);
        response.getWriter().print(xmlSb.toString());
    }

    private void writeFromMap(StringBuffer sb, Map map) {

        for(Object str : map.keySet()) {
            Object v = map.get(str);
            sb.append("<" + str + ">");
            if(v instanceof Map) {
                writeFromMap(sb, (Map) v);
            }
            else if(v instanceof List) {
                writeFromList(sb, (List) v);
            }
            else {
                writeFromData(sb, v);
            }
            sb.append("</" + str + ">");
        }
    }

    private void writeFromList(StringBuffer sb, List list) {

        for(Object v : list) {
            sb.append("");
            if(v instanceof Map) {
                writeFromMap(sb, (Map)v);
            }
            else if(v instanceof List) {
                writeFromList(sb, (List) v);
            }
            else {
                writeFromData(sb, v);
            }
            sb.append("");
        }
    }

    private void writeFromData(StringBuffer sb, Object data) {
        sb.append(escapeXml(data+""));
    }

    private String escapeXml(String src) {
//        "   "
//        <   <
//        >   >
//        &   &
        src = src.replace("\"", """);
        src = src.replace("<", "<");
        src = src.replace(">", ">");
        src = src.replace("&", "&");

        return src;
    }
}
```
