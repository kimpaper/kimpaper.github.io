---
layout: post
title: WPF(c#)에서 control을 png로 저장
date: '2015-10-15T12:13:00.001'
author: 페이퍼
categories: dotnet
tags: [.net, wpf]
header-img: "img/post-bg-02.jpg"
---
예전에 했던 대로 System.Drawing 을 써서 하려고 했는데..
wpf에 이런 기능이 있었네..

```csharp
// uiPage.ren
public void DoPageToPng(string fileName)
{
    RenderTargetBitmap rtb = new RenderTargetBitmap((int)uiPage.ActualWidth, (int)uiPage.ActualHeight, 96, 96, PixelFormats.Pbgra32);
    rtb.Render(uiPage);

    PngBitmapEncoder png2 = new PngBitmapEncoder();
    png2.Frames.Add(BitmapFrame.Create(rtb));
    using (MemoryStream stream = new MemoryStream())
    {
        png2.Save(stream);
        using (System.Drawing.Image image = System.Drawing.Image.FromStream(stream))
        {
            image.Save(fileName);
        }
    }
}
```

