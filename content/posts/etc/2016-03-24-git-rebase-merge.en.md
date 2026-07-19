---
layout: post
title: rebase and merge in git
date: '2016-03-24T16:36:00.000'
author: Paper
tags: [git]
header-img: "img/post-bg-02.jpg"
categories: etc
---

I use git a lot these days and I've always been confused about `rebase` vs `merge`.  

~~After losing source code once using rebase without knowing what I was doing.. I've only used merge~~  


I looked it up in a few places recently. rebase means relocating the base of a branch.
While using gitflow, I created a new feature branch, worked on it, then rebased the develop commits that had piled up.
I confirmed that the develop commits accumulated while I was working on the feature went in below my local feature commits.


It's nice that the history doesn't get tangled, but one problem: if you've already pushed the feature to the server.. you end up with two feature branches.
Of course local is the latest, so deleting the remote/origin feature and pushing fresh seems to solve it.

It would be great to explain this with a diagram.. but I can't draw.

During rebase, conflicts get resolved step by step, one at a time, based on each commit made on the local feature.
 
In this process the result may not come out as expected. (You may have to resolve the same file multiple times..)
 
If you want to use rebase, it seems better to keep the cycle as short as possible.
