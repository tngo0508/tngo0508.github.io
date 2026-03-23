---
title: "Solving Encode and Decode Strings in C#"
excerpt: "Learn how to encode and decode a list of strings in C# using both a unique separator and the robust length-prefix approach."
date: 2026-03-22
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - String Manipulation
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Encode and Decode Strings

The "Encode and Decode Strings" problem asks us to design an algorithm to convert a list of strings into a single string and then convert that single string back to the original list of strings.

> Design an algorithm to encode a list of strings to a string. The encoded string is then sent over the network and is decoded back to the original list of strings.

### 2. The Intuition: Separators vs. Length-Prefix

The core challenge is how to separate strings when they are joined together, especially if the strings themselves contain special characters. 

1.  **Unique Separator**: Use a specific delimiter (e.g., `<#string#>`) to mark the end of each string. This is simple but can fail if the separator itself appears in the input strings.
2.  **Length-Prefix (Neetcode approach)**: Prepend each string with its length and a special character (e.g., `4#word`). This is much more robust because it tells the decoder exactly how many characters to read next, regardless of what's inside the string.

### 3. Implementation (Version 1: Separator)

Here is the implementation using a private `_separator` field and standard C# string operations.

```csharp
using System.Text;

public class Solution {
    private string _separator = "<#string#>";

    public string Encode(IList<string> strs) {
        var sb = new StringBuilder();
        foreach (string current in strs) {
            sb.Append(current);
            sb.Append(_separator);
        }
        return sb.ToString();
    }

    public List<string> Decode(string s) {
        var arr = s.Split(_separator).ToList();
        if (arr.Count > 0) {
            arr.RemoveAt(arr.Count - 1);
        }
        return arr;
   }
}
```

### 4. Implementation (Version 2: Length-Prefix / Neetcode)

This version follows the Neetcode approach, which uses the **Length-Prefix** strategy. This is more robust as it doesn't rely on a unique separator that might appear in the data.

```csharp
public class Solution {
    public string Encode(IList<string> strs) {
        string res = "";
        foreach (string s in strs) {
            res += s.Length + "#" + s;
        }
        return res;
    }

    public List<string> Decode(string s) {
        List<string> res = new List<string>();
        int i = 0;
        while (i < s.Length) {
            int j = i;
            while (s[j] != '#') {
                j++;
            }
            int length = int.Parse(s.Substring(i, j - i));
            i = j + 1;
            j = i + length;
            res.Add(s.Substring(i, length));
            i = j;
        }
        return res;
    }
}
```

### 5. Step-by-Step Breakdown (Length-Prefix)

#### Step 1: The Encoding Logic
For every string, we calculate its length and append it to the result followed by a delimiter (like `#`) and then the string itself. For example, `["lint","code"]` becomes `"4#lint4#code"`.

#### Step 2: Finding the Length in Decoding
During decoding, we look for the first `#` to find where the length indicator ends. Everything before that `#` is parsed into an integer representing the string's length.

#### Step 3: Reading the String
Once we have the length $L$, we know exactly that the next $L$ characters belong to the original string. We extract this substring and move our pointer forward to the start of the next length indicator.

### 6. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N)** | We process each character in the input once during encoding and once during decoding (where N is the total number of characters across all strings). |
| **Space Complexity** | **O(N)** | We store the encoded string and the resulting list, both of which are proportional to the total number of characters. |

### 7. Why use these approaches?

- **Separator Version**: Extremely simple to implement using built-in .NET methods. Best when you have control over the input data or can guarantee a unique separator.
- **Length-Prefix (Neetcode)**: Much more robust and widely used in actual network protocols (like HTTP's `Content-Length`). It handles any characters in the input strings without escaping.

### 8. Summary
The Encode and Decode Strings problem is a classic exercise in data serialization. By choosing a clear delimiter and using efficient string building techniques, we can transform complex data structures into a format suitable for transmission and reconstruct them perfectly.

### 9. Further Reading
- [C# StringBuilder Documentation](https://learn.microsoft.com/en-us/dotnet/api/system.text.stringbuilder)
- [Neetcode - Encode and Decode Strings](https://neetcode.io/problems/string-encode-and-decode)
- [LeetCode Problem 271 (Premium)](https://leetcode.com/problems/encode-and-decode-strings/)
