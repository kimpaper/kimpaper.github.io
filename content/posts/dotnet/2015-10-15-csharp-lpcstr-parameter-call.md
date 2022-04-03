---
layout: post
title: c# 에서 c++(dll)로 LPCTSTR parameter 넘겨 호출 하기
date: '2015-10-15T12:13:00.001'
author: 페이퍼
categories: .NET
tags: [마샬링,marshalling]
url: /2015/10/15/csharp-lpcstr-parameter-call/
---
c++ 로 된 dll을 c#에서 호출할때 예제입니다.

### 먼저 c++ 코드들을 간단히 짰습니다.

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

### 다음은 c#쪽 코드들입니다
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

`CallingConvention = CallingConvention.Cdecl`와 `[MarshalAs(UnmanagedType.LPWStr)]` 가 중요합니다.

### 반대로 c++에서 string을 받는건 IntPtr로 받아 아래와 같이 하면 됩니다.
```csharp
IntPtr ptr = test("111111");
string data = Marshal.PtrToStringAnsi(ptr);
// 꼭 해제 한다
Marshal.FreeHGlobal(data);
```

