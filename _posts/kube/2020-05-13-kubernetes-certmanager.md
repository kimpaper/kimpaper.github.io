---
layout: post
title: kubernetes cert-manager
date: '2020-05-13T11:18:00.001'
author: 페이퍼
tags: kubernetes cert-manager letsencrypt
header-img: "img/post-bg-02.jpg"
---
kubernetes 에서 ingress 상에서 https를 서비스하는데 지원을 해주는 좋은.. 모듈

## cert manager 설치 (1)

참고 [https://cert-manager.io/docs/installation/kubernetes/](https://cert-manager.io/docs/installation/kubernetes/) 

```bash
kubectl create namespace cert-manager
kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.13.1/cert-manager.yaml

```

## cert manager 설치 (with helm)

```bash
$ kubectl apply --validate=false -f https://raw.githubusercontent.com/jetstack/cert-manager/v0.13.1/deploy/manifests/00-crds.yaml
$ kubectl create namespace cert-manager
$ helm repo add jetstack https://charts.jetstack.io
$ helm repo update

# Helm v3+
$ helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --version v0.13.1

# Helm v2
$ helm install \
  --name cert-manager \
  --namespace cert-manager \
  --version v0.13.1 \
  jetstack/cert-manager
```

## 설치 확인

```bash
kubectl get pods --namespace cert-manager
```

- 사실 내용 자체는  [https://cert-manager.io/docs/installation/kubernetes/](https://cert-manager.io/docs/installation/kubernetes/)  사이트를 보고 그대로 따라했다.
- 중요한건 staging 과 prod가 나뉘어 있다는거고, Issuer 와 ClusterIssuer 가 구분되어 있다는건데 Issuer는 namespace간 발급이 안되므로, 가능하면 ClusterIssuer를 사용하자
- staging 는 환경 테스트에만 사용하고, 성공하면 prod로 바꾸어서 실제 인증서를 발급받아야 한다.

## cert manager issuser example

- email: test@test.com 부분을 실제 email로 교체하라
- 다른 부분은 건들 부분이 크게 없다.

```bash
apiVersion: cert-manager.io/v1alpha2
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    # The ACME server URL
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    # Email address used for ACME registration
    email: test@test.com
    # Name of a secret used to store the ACME account private key
    privateKeySecretRef:
      name: letsencrypt-staging
    # Enable the HTTP-01 challenge provider
    solvers:
    # An empty 'selector' means that this solver matches all domains
    - selector: {}
      http01:
        ingress:
          class: nginx

---
apiVersion: cert-manager.io/v1alpha2
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # The ACME server URL
    server: https://acme-v02.api.letsencrypt.org/directory
    # Email address used for ACME registration
    email: test@test.com
    # Name of a secret used to store the ACME account private key
    privateKeySecretRef:
      name: letsencrypt-prod
    # Enable the HTTP-01 challenge provider
    solvers:
    - http01:
        ingress:
          class: nginx

```

## kubernetes-dashboard에 적용

- www.test.com; 부분을 원하는 도메인으로 바꾼다.
- 발급 테스트가 완료되면

`cert-manager.io/cluster-issuer: "letsencrypt-staging"` 

`cert-manager.io/cluster-issuer: "letsencrypt-prod"`

- 로 바꾸어 실제 인증서를 발급 받는다.
- 주의사항이 있는데 아래 annotoations 에서 `nginx.ingress.kubernetes.io/backend-protocol: HTTPS` 는 kubernetes/nginx-ingress 에서만 된다. nginx/nginx-ingress 는.. 안된다. 주의하자 (ingress를 다른거 설치해서 굉장히 삽질했다.)

```bash
kind: Ingress
apiVersion: extensions/v1beta1
metadata:
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
  labels:
    app: kubernetes-dashboard
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: "letsencrypt-staging"
    nginx.ingress.kubernetes.io/backend-protocol: HTTPS
spec:
  tls:
    - hosts:
        - www.test.com
      secretName: www-test-com-tls
  rules:
    - host: www.test.com
      http:
        paths:
          - path: /
            backend:
              serviceName: kubernetes-dashboard
              servicePort: 443
status:
  loadBalancer:
    ingress:
      - {}
```

- 삽질 과정에서 내부망과 외부망의 도메인 접근이 바뀌어서 고생했는데 일반적인 환경에서는 크게 무리 없을것 같다. (저걸 구축할때 내부망 dns를 사용하는 바람에 실제 verify가 되지 않아 고생했으나 나중에 눈치채고 dns ip를 외부로 바꾸니 잘된다.)

## 확인..

```bash
[root@kube1 11]# kubectl describe certificate -n nginx-ingress
Name:         www.test.com
Namespace:    nginx-ingress
Labels:       <none>
Annotations:  <none>
API Version:  cert-manager.io/v1alpha2
Kind:         Certificate
Metadata:
  Creation Timestamp:  2020-03-13T06:02:23Z
  Generation:          1
  Owner References:
    API Version:           extensions/v1beta1
    Block Owner Deletion:  true
    Controller:            true
    Kind:                  Ingress
    Name:                  www.test.com
    UID:                   a7d05229-a8cb-405a-80f7-424b0d00a71b
  Resource Version:        44540390
  Self Link:               /apis/cert-manager.io/v1alpha2/namespaces/nginx-ingress/certificates/$$$$$$$$$
  UID:                     2e762fbc-2111-4b72-ae75-319f8d018be9
Spec:
  Dns Names:
    www.test.com
  Issuer Ref:
    Group:      cert-manager.io
    Kind:       ClusterIssuer
    Name:       letsencrypt-prod
  Secret Name:  ###########
Status:
  Conditions:
    Last Transition Time:  2020-03-13T06:03:27Z
    Message:               Certificate is up to date and has not expired
    Reason:                Ready
    Status:                True
    Type:                  Ready
  Not After:               2020-06-11T05:03:26Z
Events:
  Type    Reason     Age        From          Message
  ----    ------     ----       ----          -------
  Normal  Requested  52s        cert-manager  Created new CertificateRequest resource "cgitlab-p-exem-xyz-3450475095"
  Normal  Issued     <invalid>  cert-manager  Certificate issued successfully
```

- `Normal  Issued     <invalid>  cert-manager  Certificate issued successfully` successfully가 뜨면 성공이다.


