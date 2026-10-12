---
title: "NADI CTF 2026: The Suspicious Download (Digital Forensics)"
date: 2026-10-12
summary: An invoice.pdf that was really a blank PNG. The real flag was hiding in its metadata as Base64, next to a fake flag meant to trick you.
tags: [CTF, Writeup, Forensics]
cover: assets/blog/nadi-ctf-2026/f1-exiftool.webp
---

This was the digital forensics challenge I solved at NADI CTF on 26 September 2026. It's short, but it has a nice trap: a fake flag sitting right in front of you.

## The challenge

> A file named invoice.pdf was flagged by the mail gateway for "unusual structure." The extension says PDF, but analysts suspect it isn't what it claims to be. Identify the true file type using its file signature (magic bytes), then dig through its metadata carefully, not everything that looks like a flag is the flag.

There were three free hints (0 points each):

1. Never trust a file extension. The first few bytes never lie.
2. Once you've identified the real file type, check its metadata. Not just one field, all of them.
3. Don't grab the first `NADI{` you see. One field is a decoy. Look for a field whose value doesn't look like plain readable text, because it may need decoding.

**File given:** `invoice.pdf`

## Step 1: The PDF won't open

I tried opening `invoice.pdf` normally, and it just gave an error. That fits the description: the file isn't really a PDF.

## Step 2: Check the magic bytes

I opened the file in HxD to look at the first few bytes.

![invoice.pdf in HxD showing a PNG header](assets/blog/nadi-ctf-2026/f1-hxd-png-header.webp)

A real PDF starts with `25 50 44 46` (`%PDF`). This one starts with `89 50 4E 47` (`.PNG`) followed by an `IHDR` chunk, so it's actually a **PNG image**. I could also already see `tEXt` chunks with words like `Comment` and `Description`, which are text metadata stored inside the PNG.

I saved a copy as `invoice.png` and opened it. It was just a plain grey image with nothing in it, so the answer had to be in the metadata.

## Step 3: Read all the metadata with exiftool

I ran exiftool on the file to list every metadata field:

```bash
exiftool invoice.pdf
```

![exiftool output showing the Comment and Description fields](assets/blog/nadi-ctf-2026/f1-exiftool.webp)

Two fields stood out:

| Field | Value |
| --- | --- |
| Description | `Invoice reviewed - approval code: NADI{th1s_1s_n0t_1t}` |
| Comment | `TkFESXtmMWwzX3MxZ240dHVyM3NfZDBudF9sMTN9` |

The **Description** field has something that looks like a flag, but the flag itself says "this is not it". That's the decoy from Hint 3.

The **Comment** field is more interesting. No one writes a comment like that, and it doesn't read as normal text. It's made of letters and numbers only, which is what Base64 usually looks like. It also starts with `TkFES`, which I've learned to recognise, because `NADI` in Base64 starts with `TkFES`.

## Step 4: Decode the Comment

Decoding the Comment value as Base64 gave the real flag:

```bash
echo "TkFESXtmMWwzX3MxZ240dHVyM3NfZDBudF9sMTN9" | base64 -d
```

**Flag:** `NADI{f1l3_s1gn4tur3s_d0nt_l13}`

## What I learned

- **File signatures don't lie, extensions do.** `%PDF` means PDF and `89 50 4E 47` means PNG, no matter what the file is named. This is exactly how malicious email attachments try to slip past people.
- **Read every metadata field.** exiftool shows everything in one go, so it's worth running on any file in a forensics challenge.
- **Don't submit the first flag you see.** If a value looks too easy, check the rest. Encoded text in an odd place is usually where the real answer is.
- **Learn a few Base64 patterns.** `TkFES` at the start of a string is a good sign there's a `NADI` hiding inside.
