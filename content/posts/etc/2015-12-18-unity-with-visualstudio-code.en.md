---
layout: post
title: Using Visual Studio Code as the default editor for Unity3D on Mac
date: '2015-12-18T15:39:00.001'
author: Paper
tags: [unity,vscode]
header-img: "img/post-bg-04.jpg"
categories: etc
---

When developing with Unity on Mac you usually code with MonoDevelop.
But it doesn't support Korean, which was really annoying.

MS recently released Visual Studio Code for Mac and it supposedly supports Unity, so I gave it a try.

#### Install
1. First install VS Code
`https://code.visualstudio.com/`

2. Press Cmd+P and install the extension with `ext install Omnisharp` ~~might not even be needed...~~

3. Install mono from the Mac terminal with `brew install mono` <del>takes a while</del>

4. From here on just follow this site
https://code.visualstudio.com/docs/runtimes/unity

5. Clone `git clone https://github.com/dotBunny/VSCode.git`
and put the `Plugins\Editor\dotBunny` folder inside your Unity project

6. Then in `Unity Preferences` a VSCode tab shows up at the bottom.
Check everything and press the `Write Workspace Settings` button.


Now double-clicking a cs file will open the project in VS Code.

#### Debugging
1. Set a breakpoint where you want in VSCode. (To set one.. click the far left in the editor and a red dot appears.)
2. Press F5 to enter debugging mode
3. Then run Unity
