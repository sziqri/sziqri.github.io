---
title: "NADI CTF 2026: Muse in Disguise (Steganography)"
date: 2026-10-12
summary: A .jar file that was really a WAV audio file, with Base64 text drawn into its spectrogram. Decode it three times to get the flag.
tags: [CTF, Writeup, Stego]
cover: assets/blog/nadi-ctf-2026/s2-spectrogram.webp
---

Another steganography challenge I solved at NADI CTF on 26 September 2026. This one hides the message inside audio, and the trick is to *look* at the sound instead of listening to it.

## The challenge

> A mysterious file named Muse.jar has been recovered. But something about it doesn't quite sound right. Investigate the file, uncover its true form, and discover the message hidden within.
>
> Flag format: NADI{...}

There were three free hints (0 points each):

- **Identification:** change the extension to `.wav`
- **Revelation:** put the audio into a spectrogram
- **De;code:** once you've found the correct string, Base64 decode it three times

**File given:** `Muse.jar`

## Step 1: Find the real file type

A file extension is just part of the name, so it can't be trusted. The first thing I did was open `Muse.jar` in HxD to check the first few bytes, also called the magic bytes or file signature.

![Muse.jar header in HxD showing RIFF and WAVE](assets/blog/nadi-ctf-2026/s2-wav-header.webp)

The file starts with `52 49 46 46` (`RIFF`), and a few bytes later there's `57 41 56 45` (`WAVE`). That's the header of a **WAV audio file**. A real `.jar` file is actually a ZIP archive, so it would start with `50 4B` (`PK`) instead.

The description also hinted at this with *"doesn't quite sound right"*. So I saved a copy as `Muse.wav` and moved on to analysing the audio.

## Step 2: Look at the spectrogram

A spectrogram shows audio as a picture: time goes left to right, frequency goes bottom to top, and brighter colours mean louder sound. If someone creates a sound with the right frequencies, they can "draw" text or images into it. You can't hear it properly, but you can see it.

When I loaded the WAV file into a spectrogram viewer, there was text written across it.

![Spectrogram of the WAV file showing hidden Base64 text](assets/blog/nadi-ctf-2026/s2-spectrogram.webp)

The text only used letters, numbers and the usual Base64 characters, so it was clearly a **Base64** string.

## Step 3: Decode it three times

After I copied the string out of the spectrogram, decoding it once just gave me another Base64 string. That matched the last hint, so I kept going. After decoding **three times**, I finally got the flag.

If you want to do it in Python instead of an online decoder:

```python
import base64

text = "PASTE_THE_STRING_FROM_THE_SPECTROGRAM_HERE"

for _ in range(3):
    text = base64.b64decode(text).decode()

print(text)
```

**Flag:** `NADI{H1dd3n_In_Muse}`

## What I learned

- **Check the magic bytes, not the extension.** `RIFF....WAVE` means WAV, `PK` means ZIP (and JAR, DOCX, APK), `89 50 4E 47` means PNG, and `FF D8 FF` means JPEG.
- **For audio challenges, look before you listen.** A spectrogram is one of the first things to try. Audacity and Sonic Visualiser can both show one.
- **Encoding is not encryption.** Base64 three times is still just Base64. It hides the text from a quick look, but anyone can reverse it.
