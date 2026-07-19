---
layout: post
title: kubernetes cert-manager
date: '2020-05-13T11:18:00.001'
author: Paper
categories: kubernetes
tags: [kubernetes,cert-manager,letsencrypt]
url: /en/2020/05/13/kubernetes-certmanager/
---
A nice.. module that helps you serve https on an ingress in kubernetes.

## Installing cert manager (1)

Reference [https://cert-manager.io/docs/installation/kubernetes/](https://cert-manager.io/docs/installation/kubernetes/) 

```bash
kubectl create namespace cert-manager
kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.13.1/cert-manager.yaml

```

## Installing cert manager (with helm)

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

## Verify the install

```bash
kubectl get pods --namespace cert-manager
```

- Honestly I just followed [https://cert-manager.io/docs/installation/kubernetes/](https://cert-manager.io/docs/installation/kubernetes/) as-is.
- The important parts: staging and prod are separate, and Issuer and ClusterIssuer are different things. An Issuer can't issue across namespaces, so use ClusterIssuer if you can.
- Use staging only to test your setup. Once it works, switch to prod to get a real certificate.

## cert manager issuser example

- Replace email: test@test.com with a real email
- Nothing else really needs touching.

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

## Applying it to kubernetes-dashboard

- Replace the www.test.com; part with the domain you want.
- Once the issuance test passes, change

`cert-manager.io/cluster-issuer: "letsencrypt-staging"` 

`cert-manager.io/cluster-issuer: "letsencrypt-prod"`

- and get the real certificate.
- One caveat: in the annotations below, `nginx.ingress.kubernetes.io/backend-protocol: HTTPS` only works with kubernetes/nginx-ingress. nginx/nginx-ingress.. doesn't work. Watch out (I installed a different ingress and wasted a lot of time on this.)

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

- While fumbling around I got burned by internal vs external DNS for the domain. In a normal environment it should be fine. (I was using internal DNS when setting this up so the verify never succeeded. Noticed later, switched the DNS ip to an external one, and it just worked.)

## Verify..

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

- If you see `Normal  Issued     <invalid>  cert-manager  Certificate issued successfully`, it worked.


