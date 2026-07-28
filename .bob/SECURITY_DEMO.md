# 🔐 APS Security Demo — Run-of-Show
**Duration:** ~10 minutes | **Branch:** `demo/security`

---

## Pre-Demo Checklist
- [ ] `demo/security` branch is pushed and CI is showing **red** (security + lint jobs failing)
- [ ] `security-demo/src/services/scadaService.js` is open in a split pane
- [ ] `.bob/rules.xml` is open to the `SEC-001` block
- [ ] Agent mode is ready to switch to for Beat 4
- [ ] GitHub Actions tab is open in a browser tab

---

## Beat 1 — Context (~1 min)

**Screen:** `.bob/rules.xml` — scroll to `<security-rules>`

**Say:**
> "Before we write a single line of code, Bob already knows the rules.
> These governance rules in `rules.xml` live in the repo alongside the code —
> version-controlled, reviewable, enforced automatically.
> Today we're going to see two of them in action: a real CVE hiding in a
> dependency, and someone trying to sneak a hardcoded secret past the gate."

---

## Beat 2 — Red CI Badge (~2 min)

**Screen:** GitHub Actions tab → `CI — APS Security Demo` → `🔐 Dependency Vulnerability Scan` job (red)

**Say:**
> "This is the `demo/security` branch. The CI pipeline ran `npm audit`
> automatically when the branch was pushed. It found a HIGH severity
> vulnerability — `semver 7.3.4`, CVE-2022-25883, a Regular Expression
> Denial of Service. Not in our code — in a dependency."

**Click through:** expand the failing step output, point at:
```
semver  7.0.0 - 7.5.1
Severity: high
semver vulnerable to Regular Expression Denial of Service
https://github.com/advisories/GHSA-c2qf-rxjj-qqgw
```

**Say:**
> "This is shift-left. The vulnerability was caught in CI, on a branch,
> before it ever reached main. Now let's see the second story."

---

## Beat 3 — Governance Rule Block (~1 min)

**Screen:** `security-demo/src/services/scadaService.js` — scroll to line 18

**Point at:**
```js
const SCADA_API_KEY = "APS-SCADA-k7mN3xQ9vR2pL8wT";   // ← SEC-001 fires here
```

**Say:**
> "A developer added a SCADA API key directly in the source file.
> Bob's SEC-001 rule matches this pattern — `api_key = '...'` — and marks it
> critical severity, action: block. You can also see it here in CI:"

**Screen:** switch to the `🔒 Secrets Scan (Bob SEC-001)` job (also red)

**Show CI output:**
```
❌ BOB GOVERNANCE BLOCK — SEC-001: Hardcoded credentials detected!
   Rule: No Hardcoded Credentials (severity: critical)
   Fix:  Use process.env.SCADA_API_KEY instead.
```

**[If audience asks "can't you just delete rules.xml?"]**
> "You can — but that deletion shows up as a diff in the PR, just like any
> other code change. The governance file is version-controlled. Removing a
> critical rule requires a reviewer to approve it. Bob flags the change, the
> PR title calls it out, your security lead sees it in the review queue.
> Bypassing governance is possible — but it is **never silent**."

---

## Beat 4 — Live Bob CVE Fix (~4 min)

**Switch to Agent mode. Say:**
> "Now watch Bob fix the CVE. I'm going to ask Bob to read the audit output,
> identify the vulnerable package, open a branch, apply the fix, and raise a PR.
> All without me touching the code."

**Prompt Bob:**
> "Read the npm audit output in security-demo/, identify the semver CVE, fix it
> by bumping to the patched version, run the tests, and open a PR with the CVE
> details."

**Bob will:**
1. Run `npm audit --json` in `security-demo/`
2. Create branch `bob/fix-cve-semver` off `demo/security`
3. Edit `package.json`: `"semver": "7.3.4"` → `"semver": "^7.5.2"`
4. Run `npm install` + `npm test` (9 tests pass)
5. Push `package.json` + `package-lock.json`
6. Open PR: `[Bob] Fix CVE-2022-25883 — bump semver 7.3.4 → ^7.5.2`

**Screen:** watch the GitHub PR appear, then switch to Actions tab

**Say (while CI runs):**
> "CI is running on the PR branch. The security job will go green because
> `semver 7.5.2` has the ReDoS fix applied. The lint job will still be red —
> the hardcoded SCADA key is still in the file. Bob fixed the CVE. The secret
> needs a separate PR to remediate properly, using `process.env.SCADA_API_KEY`."

**Wait for green security badge on PR.**

---

## Beat 5 — Wrap (~2 min)

**Screen:** GitHub PR showing green security job, red lint job (for contrast)

**Say:**
> "In under 4 minutes, Bob:
> — Read a real CVE advisory
> — Created a branch following the `bob/` naming convention in rules.xml
> — Applied a one-line fix
> — Confirmed tests still pass
> — Opened a PR with the full CVE reference
> — And CI confirmed the vulnerability is gone
>
> The governance rules didn't slow Bob down — they guided it.
> The secret in `scadaService.js` is still blocked, waiting for a human
> decision about how to manage that credential in production.
>
> That's shift-left: security issues caught at the branch, not in prod.
> CVEs fixed in minutes, not sprint cycles. And governance that's enforced
> automatically — because it lives in the repo, not in a slide deck."

---

## Advisory Reference
- **CVE:** CVE-2022-25883
- **Package:** semver 7.0.0 – 7.5.1
- **Type:** Regular Expression Denial of Service (ReDoS)
- **Fix:** semver >= 7.5.2
- **Advisory:** https://github.com/advisories/GHSA-c2qf-rxjj-qqgw
- **CVSS:** 7.5 HIGH

## Governance Reference
- **Rule:** SEC-001 — No Hardcoded Credentials
- **Severity:** Critical | **Action:** Block
- **Pattern matched:** `api[_-]?key\s*=\s*["'][^"']+["']`
- **File:** `.bob/rules.xml`

---
*Made with Bob AI Developer*
