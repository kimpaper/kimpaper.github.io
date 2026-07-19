---
layout: post
title: kubernetes ingress - proxying to a specific url
date: '2020-05-13T11:18:00.001'
author: Paper
categories: kubernetes
tags: [kubernetes,ingress]
url: /en/2020/05/13/kubernetes-ingress-urlproxy/
---
- When the ingress is exposed externally but the server handling it is not a service inside kubernetes but a separate external server, set proxy_pass like below. (Really, if you get creative, anything nginx supports should work.)

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

- The serviceName above is not a real service, it's a dummy.
- The annotations are added because of websockets. (Not needed if you don't use websockets)

```bash
    nginx.ingress.kubernetes.io/proxy-connect-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-read-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-send-timeout: '3600'
    nginx.ingress.kubernetes.io/send-timeout: '3600'
```

