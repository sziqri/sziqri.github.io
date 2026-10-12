---
title: Analysing Forensic Features in AI Images
date: 2026-05-13
summary: How a CNN model can use Error Level Analysis (ELA) and Fast Fourier Transform (FFT) to tell real photos apart from AI-generated ones.
tags: [FYP, Forensics, AI]
---

When I was trying to figure out a title for my Final Year Project (FYP), I was totally stuck. But one day, while scrolling through social media, I realised something pretty scary: **AI-generated images and videos are getting way too realistic**. Nowadays, it's very hard to tell what's real and what's fake with our bare eyes.

That got me curious, so I started digging through Google Scholar to see how researchers actually detect AI content. I found a [really interesting paper](https://www.ijtsrd.com/papers/ijtsrd69453.pdf) that suggested using multiple forensic features at the same time. There are already methods that use things like Error Level Analysis (ELA) or Photo Response Non-Uniformity (PRNU), but a lot of them share the same issue: they struggle with **"cross-generation"**. Basically, a model might be great at catching Midjourney images but completely fail when tested on Stable Diffusion.

To build a more reliable system for my FYP, I decided to focus on this gap. At first, I wanted to train a system using lots of different generative models. But to keep the project realistic for my timeframe, I scaled it down. I chose to replicate an [existing baseline study](https://acspub.id/index.php/ailm/article/view/4) so I could directly compare my results with theirs.

The main difference in my approach is that I built my system using **PyTorch**. I chose PyTorch simply because it made it much easier for me to modify the very first layer of the CNN model to accept my custom forensic features.

<div class="not-prose bg-slate-100 dark:bg-sys-panel border border-slate-200 dark:border-sys-border border-l-4 border-l-brand-500 p-6 rounded my-8 text-slate-700 dark:text-slate-300">
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">The Forensic Features Setup</h3>
    <p class="mb-4 text-sm">Here is a quick breakdown of the forensic features I used to catch the AI:</p>
    <ul class="space-y-4 text-sm">
        <li class="flex items-start gap-3">
            <span class="material-symbols-outlined text-brand-500 mt-1">troubleshoot</span>
            <div><strong class="text-slate-900 dark:text-white block mb-1">Fast Fourier Transform (FFT):</strong>This helps me see the high-frequency artefacts in an image. By converting normal spatial data into frequency data, the unnatural pixel patterns left behind by AI generators become very obvious.</div>
        </li>
        <li class="flex items-start gap-3">
            <span class="material-symbols-outlined text-brand-500 mt-1">compress</span>
            <div><strong class="text-slate-900 dark:text-white block mb-1">Error Level Analysis (ELA):</strong>This feature highlights compression differences. Since an AI generates an image as one single flat layer, ELA will show a very uniform compression. A real photo that has been edited, on the other hand, will show clear differences where the image was changed.</div>
        </li>
        <li class="flex items-start gap-3">
            <span class="material-symbols-outlined text-brand-500 mt-1">blur_on</span>
            <div><strong class="text-slate-900 dark:text-white block mb-1">Laplace High-Pass Filtering:</strong>I also added this filter to help the model learn the noise residuals. It basically pulls out the hidden texture or noise patterns that the AI accidentally leaves behind.</div>
        </li>
    </ul>
</div>

*Feel free to check out my project setup in the [Projects](projects.html) section!*
