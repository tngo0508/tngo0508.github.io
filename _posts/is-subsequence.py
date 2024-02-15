# My solution
class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        if not s:
            return True
        for i, c in enumerate(t):
            if s and c == s[0]:
                idx_t = i
                idx_s = 0
                while idx_t < len(t):
                    if t[idx_t] == s[idx_s]:
                        idx_s += 1
                    idx_t += 1
                    if idx_s == len(s):
                        return True
        
        return False
