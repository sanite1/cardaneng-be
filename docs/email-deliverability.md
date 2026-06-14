# Email deliverability — SPF, DKIM & DMARC

The contact form sends two emails (notify the company + confirm to the sender).
Without domain authentication, providers like Gmail/Outlook will flag them as
spam or reject them. These are **DNS records on the `cardaneng.com` domain** —
no code changes. Set them once.

> **Recommendation:** send through a reputable provider (Resend, Brevo, Mailgun,
> SendGrid, Zoho, or Google Workspace) rather than a raw cPanel mailbox — their
> IPs have good reputation and they walk you through DKIM. Whatever you pick,
> the domain in `MAIL_FROM` **must** be the domain you authenticate here.

---

## 1. SPF — authorizes who may send for your domain

Add **one** TXT record on `cardaneng.com` (only ever one SPF record — merge
`include:` entries if you have several senders):

| Type | Name | Value |
| --- | --- | --- |
| TXT | `@` (cardaneng.com) | `v=spf1 include:<provider> ~all` |

Replace `<provider>` with your sender's include:

| Provider | include |
| --- | --- |
| Google Workspace | `_spf.google.com` |
| Zoho | `zoho.com` |
| Brevo | `spf.sendinblue.com` |
| SendGrid | `sendgrid.net` |
| Mailgun | `mailgun.org` |
| Resend | `amazonses.com` (or the value Resend shows) |

Example (Brevo): `v=spf1 include:spf.sendinblue.com ~all`

---

## 2. DKIM — cryptographically signs your mail

DKIM is **provider-specific** — you can't hand-write it. In your email
provider's dashboard, open the domain/sending-authentication section and
"Authenticate" / "Verify" `cardaneng.com`. It will give you one or more records
to add, usually CNAMEs like:

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `s1._domainkey` | `s1.domainkey.u123.<provider>.net` |
| CNAME | `s2._domainkey` | `s2.domainkey.u123.<provider>.net` |

Add exactly what the provider shows, then click Verify.

---

## 3. DMARC — tells receivers what to do & gives you reports

Add a TXT record at `_dmarc.cardaneng.com`. **Start in monitor mode** (`p=none`)
so nothing legitimate is blocked while you confirm SPF/DKIM pass:

| Type | Name | Value |
| --- | --- | --- |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@cardaneng.com; adkim=s; aspf=s; pct=100` |

Once reports show SPF + DKIM passing for your real mail (a week or two), tighten
to `p=quarantine` and eventually `p=reject`.

---

## 4. Verify it works

- Send a test from the contact form and view the received email's headers —
  `SPF=pass`, `DKIM=pass`, `DMARC=pass`.
- Or use a checker: **mail-tester.com** (send to the address it gives, aim for
  10/10), or **MXToolbox** SPF/DKIM/DMARC lookups.

## 5. Common gotchas

- **`MAIL_FROM` must match the authenticated domain.** Sending "from"
  `no-reply@cardaneng.com` only passes if `cardaneng.com` is the domain you
  set up above — not a gmail.com / yahoo.com address.
- **Only one SPF record** per domain. Two SPF TXT records = both invalid.
- DNS changes take time to propagate (minutes to a few hours).
- The confirmation email to the *visitor* is the one most likely to hit spam —
  authentication is what gets it into the inbox.
