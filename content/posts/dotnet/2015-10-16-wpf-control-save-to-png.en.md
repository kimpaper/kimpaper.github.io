---
layout: post
title: Saving a control to png in WPF (c#)
date: '2015-10-15T12:13:00.001'
author: Paper
categories: dotnet
tags: [.net, wpf]
header-img: "img/post-bg-02.jpg"
---
I was going to use System.Drawing like I did before..
turns out wpf already has this built in..

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

