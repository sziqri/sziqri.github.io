---
title: "NADI CTF 2026: Meridian Vault Systems {2} (Cryptography)"
date: 2026-10-13
summary: AES in a stream mode that reused a nonce. With the known heartbeat text from part 1, that reuse lets us decrypt a message without ever having the key, and it also leaks the seed for part 3.
tags: [CTF, Writeup, Cryptography]
cover: assets/blog/nadi-ctf-2026/c2-flag.webp
---

This is the second part of the Meridian Vault Systems challenge from NADI CTF. For this one you really need part 1 first, because the plaintext we recovered there is the key to breaking this part. Same as before, don't stop at the flag. The output also gives you what you need for part 3.

## The challenge

> More artifacts from the same compromised archive server: a batch of encrypted relay messages. The service uses AES in a stream-style mode. Engineering insists it's safe because the key is refreshed daily and never leaves the box.

**File given:** `messages.json`

From the description, two things stand out:

- **"stream-style mode"** means it works like a stream cipher, not a normal block cipher. This matters a lot, as we'll see.
- **"the key is refreshed daily"** is said like it's a good thing. In CTFs, when a challenge brags about a protection, that's usually the exact thing that's broken.

## Step 1: Look at the file

I opened `messages.json`. It's clean JSON that tells us the setup directly:

```json
{
  "cipher": "AES-CTR",
  "key_id": "daily-2026-09-26",
  "messages": [
    { "sender": "vault-relay",   "nonce": "3e36c8d1691b1f9d", "ciphertext": "..." },
    { "sender": "heartbeat-bot", "nonce": "3e36c8d1691b1f9d", "ciphertext": "..." },
    ...
  ]
}
```

![messages.json contents](assets/blog/nadi-ctf-2026/c2-messages-json.webp)

So the cipher is **AES-CTR**, the key is not included (good, so we can't just read it), and every message has a `nonce` and a `ciphertext`.

## Step 2: Understand why the mode matters

I did some research on the stream-style AES mode (AES-CTR specifically), and I found one important point.

AES-CTR turns AES into a **stream cipher**. Instead of encrypting your message directly, it uses the key and the nonce to make a long random-looking stream of bytes called a **keystream**. Then it XORs that keystream with your message:

```
keystream  = AES(key, nonce)
ciphertext = plaintext XOR keystream
```

The one rule you must never break: **never reuse the same (key, nonce) pair.** If you do, you get the exact same keystream twice, and that's where everything falls apart.

## Step 3: Check for a repeated nonce

Since nonce reuse is the fatal mistake, the first thing I did was check the nonces to see if any repeat:

![nonce counter showing a repeat](assets/blog/nadi-ctf-2026/c2-nonce-repeat.webp)

```
3e36c8d1691b1f9d
```


When I read `messages.json`, there were two messages using the same nonce, which are `"sender": "heartbeat-bot"` and `"sender": "vault-relay"`. Both are in the same batch, so they use the same daily key. Same key plus same nonce means the **same keystream** for both.

> The key only changes once a day, but both messages were sent in the same batch on the same day. Inside that window the key is fixed, so a repeated nonce still gives a repeated keystream. The daily refresh is useless here.

## Step 4: Use the known plaintext from part 1

Because both messages share the same keystream, the XOR maths lets me recover one from the other:

```
keystream        = ciphertext_known  XOR plaintext_known
plaintext_secret = ciphertext_secret XOR keystream
```

So I need a message where I already know the plaintext. This is where part 1 pays off. From challenge 1, we know:

```
KNOWN_HEARTBEAT_PLAINTEXT=SYS-NOTICE::HEARTBEAT-OK::STATUS=NOMINAL::LINK=STABLE::THIS-MESSAGE-BODY-NEVER-CHANGES-BETWEEN-BATCH-RUNS::PADDING-PADDING-PADDING-PADDING-PADDING-PADDING-PADDING-PADDING-PADDING-PADDING-PADDING-PADDING-PADDING-END
CASE_REF=MV-2049-A
```

This looks like it has something to do with the heartbeat. So my plan is: XOR the `heartbeat-bot` ciphertext with this known plaintext from challenge 1 to recover the keystream, then XOR that keystream with the `vault-relay` ciphertext to read the secret message. No key needed anywhere.

## Step 5: Decrypt the vault message

I generated code to recover the keystream using `ciphertext = heartbeat-bot` and `plaintext =` the line from challenge 1, then used it on the vault message:

```python
import json, base64
d = json.load(open("messages.json"))
m = {x["sender"]: x for x in d["messages"]}

hb = base64.b64decode(m["heartbeat-bot"]["ciphertext"])   # known message
vr = base64.b64decode(m["vault-relay"]["ciphertext"])     # secret message

hb_pt = (b"SYS-NOTICE::HEARTBEAT-OK::STATUS=NOMINAL::LINK=STABLE::"
         b"THIS-MESSAGE-BODY-NEVER-CHANGES-BETWEEN-BATCH-RUNS::"
         + b"PADDING-"*13 + b"END")

keystream = bytes(a ^ b for a, b in zip(hb, hb_pt))        # peel keystream off heartbeat
vault     = bytes(a ^ b for a, b in zip(vr, keystream))    # apply it to vault message
print(vault.decode())
```

```
NADI{recycled_keystreams_leak_everything}
DIAG_ENTROPY_STATE=2724311866
NOTE: entropy pool snapshot captured moments before the nightly signing batch job started.
```

![decrypted vault message with flag](assets/blog/nadi-ctf-2026/c2-keystream-script.webp)

**Flag:** `NADI{recycled_keystreams_leak_everything}`


## What I learned

- **Never reuse a nonce in a stream cipher.** For AES-CTR and any stream cipher, reusing a (key, nonce) pair means the same keystream is used twice. One known message is then enough to unlock the other.
- **Rotating the key slowly doesn't fix nonce reuse.** The "refreshed daily" claim sounds safe, but within one batch the key is fixed, so the repeated nonce still breaks it.
- **Known plaintext is powerful.** Because we knew one message from part 1, we could pull out the keystream and read a second message without the key at all.
- **Chain challenges reward reading everything.** The flag gives the points, but the entropy state line is what sets up part 3.
