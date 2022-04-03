---
layout: post
title: kubernetes ingress - 특정 url로 proxy 걸기
date: '2020-05-13T11:18:00.001'
author: 페이퍼
categories: kubernetes
tags: [kubernetes,ingress]
url: /2020/05/13/kubernetes-ingress-urlproxy/
---
- 외부로 ingress를 노출하고 처리하는 서버가 kubernetes 내에 service가 아니라 다른 별도의 서버일 경우에 아래와 같이 proxy_pass를 지정한다. (사실 응용하면 nginx 기능들이 지원하는건 다 될것 같다.)

```bash
kind: Ingress
apiVersion: extensions/v1beta1
metadata:
  name: gitlab.test.com
  namespace: nginx-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/proxy-connect-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-read-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-send-timeout: '3600'
    nginx.ingress.kubernetes.io/send-timeout: '3600'
    nginx.ingress.kubernetes.io/server-snippet: |
      location ~ / {
         proxy_pass http://10.10.10.101:8084;
      }
spec:
  rules:
    - host: gitlab.test.com
      http:
        paths:
          - path: /
            backend:
              serviceName: nginx-ingress-default-backend
              servicePort: 8080
status:
  loadBalancer:
    ingress:
      - {}
```

- 위에 serviceName 은 실제로 사용하는 서비스가 아니라 dummy 서비스이다.
- annotations을 추가하는 이유는 websocket 때문이다.(websocket 안쓰면 없어도 됨)

```bash
    nginx.ingress.kubernetes.io/proxy-connect-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-read-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-send-timeout: '3600'
    nginx.ingress.kubernetes.io/send-timeout: '3600'
```

