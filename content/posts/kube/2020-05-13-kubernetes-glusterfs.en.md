---
layout: post
title: kubernetes glusterfs integration
date: '2020-05-13T11:18:00.001'
author: Paper
categories: kubernetes
tags: [kubernetes,glusterfs]
header-img: "img/post-bg-01.jpg"
---

# Trying to install glusterfs-kubernetes

Open gluster-kubernetes/deploy/gk-deploy and fix the line below (it uses an argument that was removed from kubectl)

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

## When adding a new glusterfs node, edit topology.json and

```bash
heketi-cli topology load --json=to.json --user admin --secret adminkey
```

```bash
디스크 확인
lsblk
```

lvm help

[https://3sikkim.tistory.com/7](https://3sikkim.tistory.com/7)

# If the install says the disk is in use, just wipe it all like below

```bash
vgdispaly
vgremove vg_{Dlkjsdfljsdfljsdf}

lsof | grep LogVol01

fuser -kuc /dev/VolGroup00/LogVol01
```

- If vg_ won't delete because the disk is in use, reboot. Before that, check with the command below that the disk is not mounted. (If you don't unmount, the reboot hangs)

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

# topology.json sample

- "destroyData": true is a bit dangerous and I'd like to drop it, but reinstalling is too painful.

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

- heketi-config-secret in secrets seems to be the config for the initial deploy.
- Below are the json values encoded in base64.
- If the install actually succeeded, mounts go through glusterfs pv, so this probably won't be used. (~~can't prove it~~)

```jsx
ewogICAgImNsdXN0ZXJzIjogWwogICAgICAgIHsKICAgICAgICAgICAgIm5vZGVzIjogWwoJCQkJCQkJCXsKICAgICAgICAgICAgICAgICAgICAibm9kZSI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgImhvc3RuYW1lcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJtYW5hZ2UiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImt1YmUzIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJzdG9yYWdlIjogWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICIxMC4xMC4zMS4xNDYiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICJ6b25lIjogMQogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgImRldmljZXMiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJuYW1lIjogIi9kZXYvc2RhIgogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAibm9kZSI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgImhvc3RuYW1lcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJtYW5hZ2UiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImt1YmU0IgogICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJzdG9yYWdlIjogWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICIxMC4xMC4zMS4xNTIiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICJ6b25lIjogMQogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgImRldmljZXMiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJuYW1lIjogIi9kZXYvc2RiIgogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAibm9kZSI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgImhvc3RuYW1lcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJtYW5hZ2UiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImt1YmU2IgogICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJzdG9yYWdlIjogWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICIxMC4xMC4zMi4xOTEiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICJ6b25lIjogMQogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgImRldmljZXMiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJuYW1lIjogIi9kZXYvc2RiIgogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAibm9kZSI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgImhvc3RuYW1lcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJtYW5hZ2UiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImt1YmU3IgogICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJzdG9yYWdlIjogWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICIxMC4xMC4zMi4xOTIiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICJ6b25lIjogMQogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgImRldmljZXMiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJuYW1lIjogIi9kZXYvc2RhIgogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICBdCiAgICAgICAgfQogICAgXQp9Cg
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

- For "http://{heketi.gluserfs.svc의 Endpoint ip}:8080", you can't use kubernetes dns.
- Confirmed that putting the service's clusterip in resturl also works. The endpoint ip is at risk of changing.
- ~~where on earth is the query coming from that it doesn't work~~
- volumetype describes how data is stored. `replicate:3` means 3 replicas. `disperse:4:2` means 4 data plus 2 for recovery, 6 bricks total (a brick is like a storage unit block)
- Or set it to none, which just stores one copy. In that case if the volume breaks, recovery is hard
- The downside of replicate vs disperse is that replicate obviously multiplies the storage cost.

```bash
'Replica volume': volumetype: replicate:3 where '3' is replica count. 'Disperse/EC volume': volumetype: disperse:4:2 where '4' is data and '2' is the redundancy count. 'Distribute volume': volumetype: none
```

- This was one of my recovery-time struggles, but really, if you don't reset, the below isn't needed.

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

