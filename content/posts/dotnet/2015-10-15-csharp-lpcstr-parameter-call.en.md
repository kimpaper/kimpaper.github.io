---
layout: post
title: Calling c++ (dll) from c# with an LPCTSTR parameter
date: '2015-10-15T12:13:00.001'
author: Paper
categories: dotnet
tags: [마샬링,marshalling]
url: /en/2015/10/15/csharp-lpcstr-parameter-call/
---
An example of calling a c++ dll from c#.

### First, some simple c++ code.

#### test.h
```cpp
extern "C" __declspec(dllexport) int test(LPCTSTR szFileName);
```

#### test.cpp
```cpp
int test(LPCTSTR szFileName) {
     return 0;
}
```

### Next, the c# side
```csharp
[DllImport("sampleLib.dll", CallingConvention = CallingConvention.Cdecl)]
private static extern int test( [MarshalAs(UnmanagedType.LPWStr)] string szFileName);

private void button2_Click(object sender, EventArgs e)
{
    string szFileName = @"c:\filename.txt";
    int result = test(ticketName);
    Debug.WriteLine("test=" + result);
}
```

`CallingConvention = CallingConvention.Cdecl` and `[MarshalAs(UnmanagedType.LPWStr)]` are the important parts.

### The other way around, receiving a string from c++: take it as IntPtr and do this.
```csharp
IntPtr ptr = test("111111");
string data = Marshal.PtrToStringAnsi(ptr);
// 꼭 해제 한다
Marshal.FreeHGlobal(data);
```

