import type { Challenge } from "./types"

export const mockChallenges: Challenge[] = [
  {
    id: "1",
    title: "SQL Injection Basics",
    description: `# SQL Injection Basics

Your mission is to exploit a vulnerable login form to gain unauthorized access.

## Challenge Description

The target application has a login form that's vulnerable to SQL injection. The backend query looks something like this:

\`\`\`sql
SELECT * FROM users WHERE username = '$username' AND password = '$password'
\`\`\`

Can you bypass the authentication?

## Hints
- Try using SQL comments
- Think about how to make the query always return true

**Target URL:** \`http://challenge.vuctf.com/sql-basics\`

Submit the flag you find after successful login.`,
    category: "Web",
    points: 100,
    flag: "VUCtf{sql_1nj3ct10n_1s_fun}",
    solves: 42,
    createdBy: "admin",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Caesar's Secret",
    description: `# Caesar's Secret

A classic cipher with a twist.

## Challenge

We intercepted this message:

\`\`\`
Yhfwi{fdhvdu_flskhu_zlwk_d_wzlvw}
\`\`\`

It appears to be encrypted with a Caesar cipher, but something seems off about the flag format...

## Note
The flag format is \`VUCtf{...}\``,
    category: "Crypto",
    points: 50,
    flag: "VUCtf{caesar_cipher_with_a_twist}",
    solves: 89,
    createdBy: "admin",
    createdAt: "2025-01-14T15:30:00Z",
  },
  {
    id: "3",
    title: "Buffer Overflow 101",
    description: `# Buffer Overflow 101

Learn the basics of stack-based buffer overflows.

## Challenge

You're given a vulnerable C program:

\`\`\`c
#include <stdio.h>
#include <string.h>

void win() {
    printf("VUCtf{buff3r_0v3rfl0w_m4st3r}\\n");
}

void vulnerable() {
    char buffer[64];
    gets(buffer);
}

int main() {
    vulnerable();
    return 0;
}
\`\`\`

**Binary:** \`nc challenge.vuctf.com 9001\`

Overflow the buffer and redirect execution to the \`win()\` function.`,
    category: "Pwn",
    points: 200,
    flag: "VUCtf{buff3r_0v3rfl0w_m4st3r}",
    solves: 23,
    createdBy: "admin",
    createdAt: "2025-01-13T09:00:00Z",
  },
  {
    id: "4",
    title: "Hidden in Plain Sight",
    description: `# Hidden in Plain Sight

Sometimes the answer is right in front of you.

## Challenge

Download the image file and find the hidden flag.

**File:** [mystery.png](http://challenge.vuctf.com/files/mystery.png)

## Tools you might need
- \`strings\`
- \`exiftool\`
- \`binwalk\`
- A hex editor`,
    category: "Forensics",
    points: 75,
    flag: "VUCtf{m3t4d4t4_t3lls_st0r13s}",
    solves: 67,
    createdBy: "admin",
    createdAt: "2025-01-12T14:20:00Z",
  },
  {
    id: "5",
    title: "Reverse Me",
    description: `# Reverse Me

Can you figure out what this program does?

## Challenge

You're given a compiled binary that checks for a password. Reverse engineer it to find the correct input.

**Binary:** [reverse_me](http://challenge.vuctf.com/files/reverse_me)

## Recommended Tools
- \`ghidra\`
- \`radare2\`
- \`gdb\`
- \`IDA\`

The flag is the correct password in the format \`VUCtf{password}\``,
    category: "Reverse Engineering",
    points: 150,
    flag: "VUCtf{r3v3rs3_3ng1n33r1ng_pr0}",
    solves: 31,
    createdBy: "admin",
    createdAt: "2025-01-11T11:45:00Z",
  },
  {
    id: "6",
    title: "XSS Playground",
    description: `# XSS Playground

Exploit a Cross-Site Scripting vulnerability.

## Challenge

The target website has a comment section that doesn't properly sanitize user input. Your goal is to execute JavaScript code that will reveal the flag.

**Target:** \`http://challenge.vuctf.com/xss-playground\`

## Objective
Inject a script that will display the admin's cookie, which contains the flag.

## Hint
The site uses a basic blacklist filter. Can you bypass it?`,
    category: "Web",
    points: 125,
    flag: "VUCtf{xss_4tt4ck_succ3ssful}",
    solves: 45,
    createdBy: "admin",
    createdAt: "2025-01-10T16:00:00Z",
  },
  {
    id: "7",
    title: "RSA Rookie",
    description: `# RSA Rookie

A beginner-friendly RSA challenge.

## Challenge

You intercepted an RSA encrypted message with the following parameters:

\`\`\`
n = 323
e = 5
c = 144
\`\`\`

Where:
- \`n\` is the modulus
- \`e\` is the public exponent
- \`c\` is the ciphertext

Decrypt the message to get the flag.

## Hint
With such a small modulus, you can factor it easily!`,
    category: "Crypto",
    points: 100,
    flag: "VUCtf{rs4_1s_n0t_s0_h4rd}",
    solves: 56,
    createdBy: "admin",
    createdAt: "2025-01-09T13:30:00Z",
  },
  {
    id: "8",
    title: "Memory Dump Analysis",
    description: `# Memory Dump Analysis

Analyze a memory dump to find sensitive information.

## Challenge

You've been given a memory dump from a compromised system. Find the flag hidden in the memory.

**File:** [memory.dmp](http://challenge.vuctf.com/files/memory.dmp) (500MB)

## Tools
- \`volatility\`
- \`strings\`
- \`grep\`

## Hint
Look for processes, command history, or clipboard data.`,
    category: "Forensics",
    points: 250,
    flag: "VUCtf{m3m0ry_f0r3ns1cs_3xp3rt}",
    solves: 15,
    createdBy: "admin",
    createdAt: "2025-01-08T10:15:00Z",
  },
  {
    id: "9",
    title: "JWT Token Forgery",
    description: `# JWT Token Forgery

Exploit a weak JWT implementation to gain admin access.

## Challenge

The application uses JWT tokens for authentication, but the secret key is weak.

**Target:** \`http://challenge.vuctf.com/jwt-app\`

Your token:
\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoidXNlciJ9.xxxxxxxxxxx
\`\`\`

## Objective
Forge a token with admin privileges and access the /admin endpoint to get the flag.

## Hints
- The secret might be in a common wordlist
- Try tools like \`jwt_tool\` or \`hashcat\``,
    category: "Web",
    points: 175,
    flag: "VUCtf{jwt_f0rg3ry_m4st3r}",
    solves: 28,
    createdBy: "admin",
    createdAt: "2025-01-07T09:30:00Z",
  },
  {
    id: "10",
    title: "Format String Vulnerability",
    description: `# Format String Vulnerability

Exploit a format string bug to leak memory.

## Challenge

\`\`\`c
#include <stdio.h>

int main() {
    char buffer[100];
    fgets(buffer, sizeof(buffer), stdin);
    printf(buffer);  // Vulnerable!
    return 0;
}
\`\`\`

**Connect:** \`nc challenge.vuctf.com 9002\`

The flag is stored somewhere in memory. Use format string specifiers to leak it.

## Useful Format Specifiers
- \`%x\` - Print hex value
- \`%s\` - Print string
- \`%p\` - Print pointer`,
    category: "Pwn",
    points: 225,
    flag: "VUCtf{f0rm4t_str1ng_l34k}",
    solves: 19,
    createdBy: "admin",
    createdAt: "2025-01-06T14:00:00Z",
  },
  {
    id: "11",
    title: "Vigenere Cipher",
    description: `# Vigenere Cipher

Break a Vigenere cipher without knowing the key.

## Challenge

Encrypted message:
\`\`\`
Zfhxk{e1g3n3r3_c1ph3r_br0k3n_w1th_fr3qu3ncy}
\`\`\`

## Hints
- The key length is 5
- Frequency analysis is your friend
- The plaintext is in English

Flag format: \`VUCtf{...}\``,
    category: "Crypto",
    points: 150,
    flag: "VUCtf{v1g3n3r3_c1ph3r_br0k3n_w1th_fr3qu3ncy}",
    solves: 34,
    createdBy: "admin",
    createdAt: "2025-01-05T11:20:00Z",
  },
  {
    id: "12",
    title: "Steganography 101",
    description: `# Steganography 101

Find the hidden message in the image.

## Challenge

Download the image and extract the hidden data.

**File:** [beach.jpg](http://challenge.vuctf.com/files/beach.jpg)

## Tools
- \`steghide\`
- \`stegsolve\`
- \`zsteg\`

## Hint
Sometimes you need a password to extract. Try common passwords or look for clues in the image metadata.`,
    category: "Forensics",
    points: 100,
    flag: "VUCtf{st3g4n0gr4phy_n1nj4}",
    solves: 52,
    createdBy: "admin",
    createdAt: "2025-01-04T16:45:00Z",
  },
  {
    id: "13",
    title: "ARM Assembly Challenge",
    description: `# ARM Assembly Challenge

Reverse engineer an ARM binary.

## Challenge

You're given an ARM binary that performs some calculations. Find the correct input that produces the flag.

**Binary:** [arm_challenge](http://challenge.vuctf.com/files/arm_challenge)

## Tools
- \`qemu-arm\`
- \`ghidra\` with ARM support
- \`radare2\`

## Note
The binary expects a 4-digit PIN as input.`,
    category: "Reverse Engineering",
    points: 200,
    flag: "VUCtf{4rm_r3v3rs1ng_ch4mp}",
    solves: 21,
    createdBy: "admin",
    createdAt: "2025-01-03T10:00:00Z",
  },
  {
    id: "14",
    title: "SSRF to RCE",
    description: `# SSRF to RCE

Chain Server-Side Request Forgery to Remote Code Execution.

## Challenge

The application has an SSRF vulnerability in its URL preview feature. Exploit it to gain RCE and read the flag from \`/flag.txt\`.

**Target:** \`http://challenge.vuctf.com/url-preview\`

## Hints
- The server is running on localhost:5000
- There's an internal admin panel at \`http://localhost:5000/admin\`
- The admin panel has a command execution feature

## Objective
Chain SSRF → Access internal admin panel → Execute commands → Read flag`,
    category: "Web",
    points: 300,
    flag: "VUCtf{ssrf_t0_rc3_ch41n3d}",
    solves: 12,
    createdBy: "admin",
    createdAt: "2025-01-02T13:15:00Z",
  },
  {
    id: "15",
    title: "Return Oriented Programming",
    description: `# Return Oriented Programming

Use ROP to bypass DEP/NX protection.

## Challenge

The binary has NX enabled, so you can't execute shellcode on the stack. Use ROP gadgets to spawn a shell.

**Binary:** [rop_challenge](http://challenge.vuctf.com/files/rop_challenge)
**Connect:** \`nc challenge.vuctf.com 9003\`

## Tools
- \`ROPgadget\`
- \`ropper\`
- \`pwntools\`

## Hint
Look for gadgets that can call \`system("/bin/sh")\``,
    category: "Pwn",
    points: 350,
    flag: "VUCtf{r0p_ch41n_m4st3r}",
    solves: 8,
    createdBy: "admin",
    createdAt: "2025-01-01T09:00:00Z",
  },
  {
    id: "16",
    title: "Elliptic Curve Cryptography",
    description: `# Elliptic Curve Cryptography

Break a weak ECC implementation.

## Challenge

You intercepted an ECDH key exchange with the following parameters:

\`\`\`python
# Curve: y^2 = x^3 + ax + b (mod p)
p = 233
a = 1
b = 1
G = (3, 10)  # Generator point
n = 239      # Order of G

# Alice's public key
A = (74, 73)

# Bob's public key  
B = (155, 166)

# Encrypted flag (using shared secret as key)
ciphertext = "8f3a2b..."
\`\`\`

Find the shared secret and decrypt the flag.`,
    category: "Crypto",
    points: 275,
    flag: "VUCtf{3cc_br0k3n_sm4ll_curv3}",
    solves: 11,
    createdBy: "admin",
    createdAt: "2024-12-31T15:30:00Z",
  },
  {
    id: "17",
    title: "PCAP Analysis",
    description: `# PCAP Analysis

Analyze network traffic to find the flag.

## Challenge

You've captured network traffic from a suspicious connection. Find the flag hidden in the packets.

**File:** [capture.pcap](http://challenge.vuctf.com/files/capture.pcap)

## Tools
- \`wireshark\`
- \`tshark\`
- \`tcpdump\`

## Hints
- Look for HTTP traffic
- Check for file transfers
- Examine DNS queries
- Follow TCP streams`,
    category: "Forensics",
    points: 125,
    flag: "VUCtf{p4ck3t_4n4lys1s_pr0}",
    solves: 41,
    createdBy: "admin",
    createdAt: "2024-12-30T12:00:00Z",
  },
  {
    id: "18",
    title: "Obfuscated JavaScript",
    description: `# Obfuscated JavaScript

Deobfuscate and understand the code.

## Challenge

\`\`\`javascript
eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('0.1("2{3_4_5_6_7}");',8,8,'console|log|VUCtf|j4v4scr1pt|d30bfusc4t10n|1s|fun'.split('|'),0,{}))
\`\`\`

Deobfuscate this code to reveal the flag.

## Tools
- Browser console
- Online deobfuscators
- Manual analysis`,
    category: "Reverse Engineering",
    points: 75,
    flag: "VUCtf{j4v4scr1pt_d30bfusc4t10n_1s_fun}",
    solves: 63,
    createdBy: "admin",
    createdAt: "2024-12-29T14:30:00Z",
  },
]

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("ctf_challenges")
  if (!stored) {
    localStorage.setItem("ctf_challenges", JSON.stringify(mockChallenges))
  }
}
