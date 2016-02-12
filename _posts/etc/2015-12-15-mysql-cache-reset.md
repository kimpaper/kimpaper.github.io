---
layout: post
title: Mariadb Query test할때 cache 안먹게 하기
date: '2015-12-15T14:55:00.001'
author: 페이퍼
tags: mysql mariadb cache
header-img: "img/post-bg-05.jpg"
---

쿼리 튜닝할때 아래를 실행하고 하면 cache 안된 결과를 볼 수 있다. 

{% highlight sql %}
RESET QUERY CACHE;
{% endhighlight %}


