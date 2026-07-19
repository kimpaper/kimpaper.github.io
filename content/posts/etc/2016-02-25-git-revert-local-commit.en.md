---
layout: post
title: Reverting a git local commit
date: '2016-02-25T14:35:00.001'
author: Paper
tags: [git]
header-img: "img/post-bg-01.jpg"
categories: etc
---


Specify the target repository to restore, like below (when the current checkout is develop)

```bash
git reset --hard remotes/origin/develop
```

If you don't specify a repository, it seems to revert based on the currently checked-out remote

```bash
git reset --hard
```
