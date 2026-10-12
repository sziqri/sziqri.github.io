---
title: "NADI CTF 2026: Best of Luck (Steganography)"
date: 2026-10-12
summary: A PNG with 80 extra bytes hidden after the end of the image. Reverse them, decode Ascii85, then Base32, and the flag comes out.
tags: [CTF, Writeup, Stego]
cover: assets/blog/nadi-ctf-2026/s1-data-after-iend.webp
---

This is one of the challenges I solved at NADI CTF on 26 September 2026. It's a beginner-friendly steganography challenge, and a good reminder to always look at the raw bytes of a file.

## The challenge

> A guy hide my code for something important in a picture. But I can't seem to figure it out. Can you get it for me? You might have to view it backwards. Best of luck to you!
>
> Flag format: NADI{...}

There was also a free hint, *Read Between the?*, which said the image may contain readable text outside what you can see. If it looks backwards, reverse it before trying common text encodings.

**File given:** `best_of_luck.png`

## Reading the clues

Before touching any tools, I broke the description into two clues:

- *"Hide my code for something important in a picture"* means the flag is somewhere inside the image file.
- *"You might have to view it backwards"* means something probably needs to be reversed.

## Step 1: Check the file in a hex editor

I opened the file in HxD. The header looked like a normal PNG (`89 50 4E 47`), so the file type wasn't faked.

![PNG header in HxD](assets/blog/nadi-ctf-2026/s1-png-header.webp)

Then I scrolled to the bottom. A PNG should end with the `IEND` chunk, but there was more data after it, and it didn't look like the rest of the image data.

![Extra data after IEND in HxD](assets/blog/nadi-ctf-2026/s1-data-after-iend.webp)

## Step 2: Confirm with the PNG chunks

To be sure, I checked the PNG chunks. Everything was fine, but the checker reported **80 bytes of data after IEND**. Image viewers ignore anything after `IEND`, which makes it an easy place to hide data.

![PNG chunk list showing 80 bytes after IEND](assets/blog/nadi-ctf-2026/s1-png-chunks.webp)

These were the 80 bytes:

```
kqtZ4&;W28Ea1);qRnJ9+bXG:_8"e:N0UV6cP+J:o:Dr5DOoJ9It^&=dlHn7kdV\=c8A.:C$M);S$6f9
```

## Step 3: Figure out the encoding

My first thought was Base64, but this string has characters like `&`, `;`, `:`, `^` and `$`, which Base64 never uses. That character set fits **Base85 (Ascii85)** better.

Decoding it as Ascii85 straight away gave me nothing useful. Then I remembered the clue about viewing it *backwards*. After reversing the string first, Ascii85 decoding worked and gave me a clean string of capital letters, numbers and `=` padding, which is how **Base32** looks.

![Reversed string decoded with Ascii85](assets/blog/nadi-ctf-2026/s1-ascii85-decode.webp)

## Step 4: Decode the Base32

Decoding the Base32 gave the hidden message with the flag inside.

![Base32 decoded to the flag](assets/blog/nadi-ctf-2026/s1-base32-decode.webp)

If you prefer doing it in Python, the whole chain is just a few lines:

```python
import base64

hidden = r'''kqtZ4&;W28Ea1);qRnJ9+bXG:_8"e:N0UV6cP+J:o:Dr5DOoJ9It^&=dlHn7kdV\=c8A.:C$M);S$6f9'''

step1 = hidden[::-1]               # reverse it
step2 = base64.a85decode(step1)    # Ascii85 -> Base32 text
step3 = base64.b32decode(step2)    # Base32 -> message
print(step3.decode())
```

**Flag:** `NADI{Oh_Y0u_reA11y_goT_thi5?}`

## What I learned

- **Always check the end of a file.** Data after a PNG's `IEND` (or a JPEG's `FF D9`) is invisible in image viewers but easy to spot in a hex editor.
- **Guess the encoding from the character set.** Hex only uses 0-9 and a-f, Base32 uses A-Z, 2-7 and `=`, Base64 adds lowercase letters plus `+` and `/`, and Base85 uses a much wider range of symbols.
- **Read the challenge text carefully.** The word "backwards" was the key to the whole thing.
