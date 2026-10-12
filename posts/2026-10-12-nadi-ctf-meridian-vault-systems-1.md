---
title: "NADI CTF 2026: Meridian Vault Systems {1} (Cryptography)"
date: 2026-10-12
summary: A file fragment wrapped in hex, single-byte XOR, a reversal and Base64. None of it is real encryption, and the decoded output also gives you what you need for part 2.
tags: [CTF, Writeup, Cryptography]
cover: assets/blog/nadi-ctf-2026/c1-flag.webp
---

This is the first part of the Meridian Vault Systems challenge that I solved at NADI CTF on 26 September 2026. It's the easiest of the three parts, but don't stop once you get the flag. The same output also has something you will need for part 2.

## The challenge

> During triage of a compromised internal archive server, responders pulled a single fragment out of a corrupted forensic export. The export tooling appears to have applied several storage/transport transformations before writing the fragment to disk -- none of them look like real encryption, but together they've made the fragment unreadable at a glance.

**File given:** `message.dat`

From the description, two things are important:

- **"several ... transformations"** tells us there are a few layers, so we need to decode more than once.
- **"none of them look like real encryption"** tells us there's no AES and no secret key. Every layer should be something we can undo with simple tools like hex, Base64 and XOR.

## Step 1: Check the file given

I opened `message.dat` in Notepad. It was just one long line of scrambled text.

![message.dat in notepad](assets/blog/nadi-ctf-2026/c1-message-dat.webp)

## Step 2: Decode from hex

When I looked closer, the text only has `0-9` and `a-f`. That's how hex looks like. Hex is a way to write raw bytes as text, where every 2 characters is 1 byte. The file has 808 characters, so there are 404 bytes inside.

![convert message.dat from hex](assets/blog/nadi-ctf-2026/c1-hex-decode.webp)

After decoding, it's still unreadable. That's okay, because the description already said there are a few layers. This is only the first one.

## Step 3: Figure out the layer

At first I wasn't sure what to try next, because "unreadable" can mean a few different things. The data didn't start with any magic bytes (like `89 50 4E 47` for PNG), so it's not a hidden file. The length is 404, which is not a multiple of 16, so it's also unlikely to be AES.
 
After some research, I found a simple way to tell real encryption apart from a simple encoding: count how many **different byte values** appear in the data.
 
- One byte can be any value from 0 to 255. Real encryption output looks random, so its bytes will be spread across this whole range.
- Normal text is different. Printable ASCII only has 95 characters (codes 32 to 126), and Base64 uses even fewer, only 65 characters (`A-Z`, `a-z`, `0-9`, `+`, `/` and `=`).
So I counted them:

![convert message.dat from hex](assets/blog/nadi-ctf-2026/c1-byte-counter.webp)

Two things stood out:
 
- **Only 51 different values out of 256.** Real encryption would use a lot more than that. 51 also fits inside the 65 characters of Base64 (a short text usually won't use every single Base64 character).
- **All bytes are between 0 and 95.** The data only uses 96 out of 256 possible values. Random encrypted data would be spread all the way up to 255.
Maybe the data was in Base64 first, and then every byte was changed in the same way. That would hide the characters, but the number of different values would stay the same. The most common way to do this is XOR with a single byte.

### Quick note on XOR
 
XOR has one useful property. If you XOR twice with the same key, you get back the original:
 
```
plaintext  ^ key = ciphertext
ciphertext ^ key = plaintext
```
 
So once I find the key, I can get the Base64 text back just by XOR-ing the data again. With a single-byte key, there are only 256 possible keys (0 to 255), so I can simply try all of them.

## Step 4: Brute-force the XOR key

256 keys means 256 outputs, and I didn't want to read all of them one by one. So I needed the script to tell me which one is correct.

My guess was the next layer is Base64, since it's also a common encoding. Base64 only uses `A-Z`, `a-z`, `0-9`, `+`, `/` and `=`. So I only kept the key where **every** byte in the output is a Base64 character:

```python
import string

data = bytes.fromhex(open('message.dat').read().strip())
b64 = set((string.ascii_letters + string.digits + '+/=').encode())

for k in range(256):
    x = bytes(c ^ k for c in data)
    if set(x) <= b64:
        print("key =", k, "->", x)
```

```
108 [or 0x6 in HEX]
```

![XOR brute force finding key 0x6c](assets/blog/nadi-ctf-2026/c1-xor-bruteforce.webp)

Only one key passed, which is `108` (`0x6C`). If the key is wrong, each byte only has around a 1 in 4 chance to land on a Base64 character by luck. For all 404 bytes to do that by accident is almost impossible, so getting only one result means my guess was correct.

## Step 5: Notice the text is reversed

I tried to decode the XOR output as Base64 straight away, but it came out as rubbish. Then I noticed how the output **ends**:

```
...EFkT
```

If you read it from the back, you get `TkFE`. That's the start of `NADI` in Base64 (`NADI{` becomes `TkFESX...`). So the text was **reversed** before it was encoded to Base64, and the flag was at the end instead of the start.

## Step 6: Reverse it and decode

Here is the full solve, undoing all four layers in order:

```python
import base64

data = bytes.fromhex(open('message.dat').read().strip())  # layer 1: hex
x = bytes(c ^ 0x6C for c in data)                         # layer 2: XOR 0x6C
x = x[::-1]                                               # layer 3: reverse
print(base64.b64decode(x).decode())                       # layer 4: Base64
```

```
NADI{stacking_encodings_is_not_encryption}
KNOWN_HEARTBEAT_PLAINTEXT=SYS-NOTICE::HEARTBEAT-OK::STATUS=NOMINAL::LINK=STABLE::THIS-MESSAGE-BODY-NEVER-CHANGES-BETWEEN-BATCH-RUNS::PADDING-...-PADDING-END
CASE_REF=MV-2049-A
```

![decoded output with flag and heartbeat line](assets/blog/nadi-ctf-2026/c1-flag-output.webp)

> **Not comfortable with Python?** You can do the same thing in CyberChef with this recipe: **From Hex**, then **XOR** (key `6C`, hex), then **Reverse**, then **From Base64**.

**Flag:** `NADI{stacking_encodings_is_not_encryption}`

### Don't close the output yet

The flag is not the only useful thing here. The line called `KNOWN_HEARTBEAT_PLAINTEXT` says the heartbeat message **never changes** between runs. In part 2, we get a batch of AES-encrypted messages, and one of them is this heartbeat. Knowing the original text of that message is what helps us break part 2, so make sure to save the whole line.

## What I learned

- **Encoding is not encryption.** Hex, XOR with a known key, reversing and Base64 can all be undone without any secret. Putting four of them together only adds more steps, not more security. The flag itself says the same thing.
- **Learn to spot layers from the characters used.** Only `0-9a-f` usually means hex. Only letters, numbers, `+`, `/` and `=` (often ending with `=`) usually means Base64.
- **If there are not many keys, just brute-force with a proper check.** No need to read 256 outputs yourself. Tell the script what a correct answer looks like and let it find the key.
- **Check both the start and the end of the data.** I only found the reversal because I looked at how the output ends, not how it starts.
- **For chain challenges, read the full output.** The flag gives you the points, but the extra lines are what you need for the next part.
