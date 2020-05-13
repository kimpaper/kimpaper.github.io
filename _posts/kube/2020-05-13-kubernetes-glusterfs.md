---
layout: post
title: kubernetes glusterfs 연동
date: '2020-05-13T11:18:00.001'
author: 페이퍼
tags: kubernetes glusterfs
header-img: "img/post-bg-01.jpg"
---

# glusterfs-kubernetes 설치 시도 중

gluster-kubernetes/deploy/gk-deploy 파일을 열어서 아래 라인을 고쳐야 한다 (kubectl에 없어진 인자값을 쓴다)

```bash
# deprecated "--show-all" parameter
#heketi_pod=$(${CLI} get pod --no-headers --show-all --selector="heketi" | awk '{print $1}')
heketi_pod=$(${CLI} get pod --no-headers --selector="heketi" | awk '{print $1}')
```

```bash
# daemonset을 설치하기 위해
# 노드별로 아래 경로를 비워야함
rm -rf /var/lib/misc/glusterfsd /var/lib/glusterd /var/log/glusterfs /etc/glusterfs /var/lib/heketi

#uninstall
./gk-deploy -g --user-key userkey --admin-key adminkey -n glusterfs --abort

#install
./gk-deploy -g --user-key userkey --admin-key adminkey -n glusterfs
```

## 신규 glusterfs 노드가 추가될때 topology.json을 수정하고

```bash
heketi-cli topology load --json=to.json --user admin --secret adminkey
```

```bash
디스크 확인
lsblk
```

lvm 관련 도움말

[https://3sikkim.tistory.com/7](https://3sikkim.tistory.com/7)

# 설치시 disk가 사용중이라고 나오면 아래와 같이 싹 날려...버려

```bash
vgdispaly
vgremove vg_{Dlkjsdfljsdfljsdf}

lsof | grep LogVol01

fuser -kuc /dev/VolGroup00/LogVol01
```

- 디스크가 사용중이라 vg_가 삭제 안되면 재부팅, 그전에 아래 명령으로 disk가 마운트되어 있지 않은지 확인해야 한다.  (마운트를 해제하지 않으면 재부팅이 안됨)

```bash
cat /etc/fstab
```

```bash

#
# /etc/fstab
# Created by anaconda on Thu Sep 20 14:48:48 2018
#
# Accessible filesystems, by reference, are maintained under '/dev/disk'
# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
#
/dev/mapper/centos-root /                       xfs     defaults        0 0
UUID=952140d5-6d1b-476b-b26d-aa8442633148 /boot                   xfs     defaults        0 0
UUID=34FE-0D05          /boot/efi               vfat    umask=0077,shortname=winnt 0 0
/dev/mapper/centos-home /home                   xfs     defaults        0 0
#/dev/mapper/centos-swap swap                    swap    defaults        0 0
#/dev/sda1              /home2                  xfs     defaults        0 0
#gluster00:gfs /glusterfs glusterfs defaults,_netdev 0 0

```

# topology.json샘플

- "destroyData": true 이건 좀 위험 빼고 싶지만 다시 설치가 너무 힘들다.

```json
{
    "clusters": [
        {
            "nodes": [
								{
                    "node": {
                        "hostnames": {
                            "manage": [
                                "kube3"
                            ],
                            "storage": [
                                "10.10.31.146"
                            ]
                        },
                        "zone": 1
                    },
                    "devices": [
                        {
                            "name": "/dev/sda"
, "destroyData": true
                        }
                    ]
                },
                {
                    "node": {
                        "hostnames": {
                            "manage": [
                                "kube4"
                            ],
                            "storage": [
                                "10.10.31.152"
                            ]
                        },
                        "zone": 1
                    },
                    "devices": [
                        {
                            "name": "/dev/sdb"
, "destroyData": true
                        }
                    ]
                },
								{
                    "node": {
                        "hostnames": {
                            "manage": [
                                "kube5"
                            ],
                            "storage": [
                                "10.10.31.153"
                            ]
                        },
                        "zone": 1
                    },
                    "devices": [
                        {
                            "name": "/dev/sda"
, "destroyData": true
                        }
                    ]
                },
                {
                    "node": {
                        "hostnames": {
                            "manage": [
                                "kube6"
                            ],
                            "storage": [
                                "10.10.32.191"
                            ]
                        },
                        "zone": 1
                    },
                    "devices": [
                        {
                            "name": "/dev/sdb"
, "destroyData": true
                        }
                    ]
                },
                {
                    "node": {
                        "hostnames": {
                            "manage": [
                                "kube7"
                            ],
                            "storage": [
                                "10.10.32.192"
                            ]
                        },
                        "zone": 1
                    },
                    "devices": [
                        {
                            "name": "/dev/sdb"
, "destroyData": true
                        }
                    ]
                }
                
            ]
        }
    ]
}
```

- secrets 에서 heketi-config-secret 에서 초기 deploy 용 config 같다.
- 아래는 json을 base64로 인코딩한 값들이다.
- 실제로 설치에 성공했다면 glusterfs pv를 이용하여 마운트가 되므로 사용하지 않을것이다. (~~증명은 못해봄~~)

```jsx
ewogICAgImNsdXN0ZXJzIjogWwogICAgICAgIHsKICAgICAgICAgICAgIm5vZGVzIjogWwoJCQkJCQkJCXsKICAgICAgICAgICAgICAgICAgICAibm9kZSI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgImhvc3RuYW1lcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJtYW5hZ2UiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImt1YmUzIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJzdG9yYWdlIjogWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICIxMC4xMC4zMS4xNDYiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICJ6b25lIjogMQogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgImRldmljZXMiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJuYW1lIjogIi9kZXYvc2RhIgogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAibm9kZSI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgImhvc3RuYW1lcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJtYW5hZ2UiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImt1YmU0IgogICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJzdG9yYWdlIjogWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICIxMC4xMC4zMS4xNTIiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICJ6b25lIjogMQogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgImRldmljZXMiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJuYW1lIjogIi9kZXYvc2RiIgogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAibm9kZSI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgImhvc3RuYW1lcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJtYW5hZ2UiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImt1YmU2IgogICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJzdG9yYWdlIjogWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICIxMC4xMC4zMi4xOTEiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICJ6b25lIjogMQogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgImRldmljZXMiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJuYW1lIjogIi9kZXYvc2RiIgogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAibm9kZSI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgImhvc3RuYW1lcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJtYW5hZ2UiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImt1YmU3IgogICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJzdG9yYWdlIjogWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICIxMC4xMC4zMi4xOTIiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICJ6b25lIjogMQogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgImRldmljZXMiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJuYW1lIjogIi9kZXYvc2RiIgogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAibm9kZSI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgImhvc3RuYW1lcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJtYW5hZ2UiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImt1YmU1IgogICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJzdG9yYWdlIjogWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICIxMC4xMC4zMS4xNTMiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICJ6b25lIjogMQogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgImRldmljZXMiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJuYW1lIjogIi9kZXYvc2RhIgogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICBdCiAgICAgICAgfQogICAgXQp9Cg
```

# StorageClass - glusterfs

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: glusterfs
provisioner: kubernetes.io/glusterfs
parameters:
  resturl: "http://{heketi.gluserfs.svc의 Endpoint ip}:8080"
  restauthenabled: "true"
  restuser: "admin"
  restuserkey: "adminkey"
  volumetype: "none"
allowVolumeExpansion: false
```

- "http://{heketi.gluserfs.svc의 Endpoint ip}:8080" 를 할때 kubernetes dns 를 이용하면 안된다.
- restfurl에 service 의 clusterip를 넣어도 되는걸 확인 endpoint 아이피는 바뀔 위험이 있다.
- ~~대체 어디서 query를 하길래 안되는거냐~~
- volumetype은 저장 방식에 대한 설명인데. `replicate:3` 인 경우 3개 복제, `disperse:4:2` 면 4개 데이터 복구를 위한 데이터2 총 6개 브릭 사용 (브릭은 저장단위 블럭같은거다)
- 아니면 none으로 한다 이건 1개에 그냥 저장하나. 이런 경우에 해당 volume가 망가지면 복구가 힘들다
- replicate와 disperse 에 단점은 replicate 는 당연히 저장 공간이 곱절로 든다는 것이다.

```bash
'Replica volume': volumetype: replicate:3 where '3' is replica count. 'Disperse/EC volume': volumetype: disperse:4:2 where '4' is data and '2' is the redundancy count. 'Distribute volume': volumetype: none
```

- 실제 복구 과정에서 삽질의 하나였지만, 사실 reset을 하지 않으면 아래는 필요가 없다.

```jsx
gluster volume delete vol_3cb6e6973ef6366616bad693996ce444
gluster volume delete vol_3fbc9aee403388863f32709f09579de0
gluster volume delete vol_7bde0724f9cb828789293b6b28f29bcf
gluster volume delete vol_8059e09dd2a2b476966d73517ffc694c
gluster volume delete vol_81c09d96d88ac7c5f17341192c59b727
gluster volume delete vol_9301d3846066104602682e59c8cb6c8a
gluster volume delete vol_a06486abbe89c848a0081fb2221860e8
gluster volume delete vol_b16f85e4353566f4760f02e9dbf527db
gluster volume delete vol_becbc87401a29c01554fbced7c7feb17
gluster volume delete vol_c353b5987ddd55903b81c0ffa20e6120
```

