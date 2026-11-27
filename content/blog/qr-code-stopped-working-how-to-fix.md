If your QR code stopped working after it was printed, scan it and look at what happens. If your camera shows nothing, the print is the problem. If it opens an error page, the website it points to has moved or gone down. If it opens a page about an expired trial, a paused code or a plan upgrade, the company that made the code has switched off its redirect. Each of those has a different fix, and only one of them means you have to reprint.

## Key facts

- A QR code's printed pattern never expires. When a code stops working, either the print can't be read, the page it opens is gone, or the company running its redirect switched it off.
- Scan it and read the address your phone shows. Your own website means a static code; a short link on another company's domain means a dynamic code.
- Only a switched-off dynamic code from another company forces a reprint, unless you pay that company to turn it back on. A broken page can be fixed on your website without touching the code.
- Many QR companies deactivate dynamic codes when a free trial ends or a paid plan lapses. QRCG by Bitly and Uniqode say so in their own help centres.
- Static codes can't be switched off by anyone, because there's no company in the middle.

## Find your symptom

| What you see when you scan | What failed | What to do |
| --- | --- | --- |
| The camera doesn't react at all | The print: size, contrast, glare, damage or missing margin | Try a second phone, better light and a closer distance. If no phone reads it, reprint it larger and dark on light |
| Some phones read it and others don't | The print is borderline | Reprint bigger, with a clear white border and no gloss |
| A "page not found" or browser error | The destination website | Fix or restore that page, or point the code somewhere else if it's editable |
| A login screen or "access denied" | The destination is private | Make the page or file public, then test in a private browser window |
| "This QR code has been deactivated", "trial ended" or a pricing page | The QR company's redirect | Sign in to that account, or replace the code (see below) |
| A "destination preview" page with an ad, then your page | A free Bitly link | Upgrade that Bitly account or reprint, see [Bitly QR code showing an ad?](/blog/bitly-qr-code-ad-preview-page) |
| The wrong page, but it loads fine | An old or mistyped link | Edit it if the code is dynamic, otherwise make a new code |

## Step 1: rule out the print

Scan the same code with two phones, in good light, from about 20 to 30 cm away. Keep the whole square and the blank margin around it in the frame. If neither phone gets a link out of it, the QR pattern itself is unreadable. Common causes are a code printed too small for the distance people scan from, light ink on a dark background, a laminated or glossy surface catching light, or a crease through the middle.

No QR company can fix this one, because the problem is on the paper. Print a new copy at a bigger size, test one sample on a couple of phones, then print the rest.

## Step 2: read the link inside the code

If a phone does read it, look at the web address it shows before you tap. That address tells you what kind of code you have.

- **It's your own website or file** (like yourcafe.com/menu or a Google Drive link). This is a static code. The link is stored in the pattern itself, so no QR company is involved. If it fails, the problem is that page.
- **It's a short link on someone else's domain** (a QR company's or link shortener's domain). This is a dynamic code. Every scan goes to that company first, and their server forwards it to your page. If their server stops forwarding, the code stops working even though your website is fine.

If the address is a domain you don't recognise at all, on a code someone may have stuck over yours, see [is it safe to scan a QR code?](/blog/is-it-safe-to-scan-a-qr-code) for how to spot a swapped code.

Write down the exact address. You'll need it for everything below.

## Step 3: if the destination is broken

Open the address from the code directly in a browser on mobile data. If it fails there too, the website is the problem, not the QR code.

Websites get rebuilt, pages get renamed, menus get moved to a new PDF link, and every printed code pointing at the old address lands on an error. If you control that website, the simplest fix is to put the page back at the old address, or set up a redirect from the old address to the new one. That repairs every printed copy without touching the code.

If the code is dynamic and you can still sign in to the account that made it, change the destination there and every printed copy works again.

If it's a shared file (Google Drive, Dropbox, OneDrive), check that sharing is set to "anyone with the link" and test it in a private window where you aren't signed in.

## Step 4: if the QR company switched it off

A page saying the code was deactivated, the trial ended, or you need to upgrade means the redirect has been turned off. Your phone and your print are fine. This usually happens when a free trial ends, a subscription lapses or is cancelled, or the account goes over a plan limit.

This is common and documented by the companies themselves. QRCG by Bitly (qr-code-generator.com) [says in its help center](https://support.qr-code-generator.com/hc/en-us/articles/7665013224205-I-received-a-message-saying-that-my-QR-Codes-will-be-deactivated-What-does-that-mean) that dynamic codes made during its 14-day trial are deactivated when the trial ends. Uniqode's help center [says](https://docs.uniqode.com/en/articles/17190918-what-happens-to-my-qr-codes-when-my-subscription-changes-or-ends) its dynamic codes stop working when a trial expires, and after the renewal date if you cancel. Other companies have their own rules, so check the policy of whoever made your code. We put [11 QR companies' cancellation policies side by side](/blog/what-happens-to-qr-codes-when-you-cancel). If the code came from a $1 download that turned into a subscription, here is [how to cancel and what to expect](/blog/qr-code-1-dollar-trial-subscription).

You have two real options:

1. **Turn it back on with the same company.** Sign in to the original account and follow their reactivation steps, which usually means paying for a plan. QRCG's [reactivation guide](https://support.qr-code-generator.com/hc/en-us/articles/7665090677005-How-can-I-reactivate-my-QR-Codes) says you have to upgrade the original account; a new account or a new code with the same content won't bring the old one back.
2. **Replace the code.** Make a new one somewhere else and reprint. Put a sticker over the old code in the meantime if reprinting takes a while.

What you can't do is fix it from a different QR service. The old short link belongs to the company that made it, and no other company can change where it goes.

## Step 5: make the replacement last

Before you print again, decide which kind of code fits.

- **Use a static code** if the address won't change. A menu at yourcafe.com/menu can be updated as often as you like without touching the code, as long as the address stays the same. Nobody can switch a static code off, because there's no company in the middle.
- **Use a dynamic code** if you need to change where it points after printing, or you want scan counts. Before you rely on one, read what that company does to existing codes when a trial ends, when you cancel, and when you go over a limit.
- **If you run your own website**, you can also put a page address you control in the code (like yourcafe.com/qr) and set where it goes from your own site. Then no outside company can break your printed codes.

Always test one printed sample on two phones before printing the full run.

## Where Scanstone fits

[Scanstone's free static generator](/qr-code-generator) makes PNG and SVG codes with no account, and those codes go straight to your link. For editable codes and short links on scst.one, the free plan includes 3 in total and [Pro](/pricing) is $9 USD a month or $79 USD a year. Scanstone doesn't disable redirects because a plan was cancelled, downgraded or went over its limit; that's written into [our terms](/terms). Deleting a code or your account does remove its redirect, and like any dynamic code, it still depends on our redirect service and your destination being up.

If you're dealing with a restaurant menu, the [menu QR code guide](/restaurant-menu-qr-code) covers when a plain link to your menu is enough. For more on how free trials catch people out, see [why some QR codes stop working after a free trial](/blog/qr-code-subscription-trap).

## Common questions

### Can a QR code expire on its own?

The printed pattern doesn't expire. A static code keeps working as long as it's readable and the page it links to is up. A dynamic code can stop when the company running its redirect switches it off.

### How do I tell if my QR code is static or dynamic?

Scan it and look at the address before opening it. If it's your own website or file, it's static. If it's a short link on a QR company's domain, it's dynamic and depends on that company.

### Should I put a short link inside a QR code?

Only if you'll need to change where it goes after printing. A short link puts a company between the scan and your page, and if that company retires the link, the code stops working. If your address won't change, a static code that points straight to your own site is the safer choice. If you do need to edit it later, pick a service that says in writing what happens to your links when you stop paying. That includes Scanstone: our scst.one links keep working after you cancel or downgrade, as [our terms](/terms) say, but they still depend on our redirect service being up.

### Can another QR company fix my deactivated code?

No. Only the company whose short link is inside the code can make it work again. Any other service can only give you a new code to print.

### Will reprinting the same link with a new generator fix it?

Only if you encode your real destination address. If you paste the old company's short link into a new code, you get the same dead redirect in a new pattern.

### Why does my code work on my phone but not my customer's?

The print is probably borderline. Older cameras and low light struggle with small, low-contrast or glossy codes. Reprint it larger with a clear margin.

_Sources: [QRCG by Bitly trial deactivation policy](https://support.qr-code-generator.com/hc/en-us/articles/7665013224205-I-received-a-message-saying-that-my-QR-Codes-will-be-deactivated-What-does-that-mean) and [reactivation instructions](https://support.qr-code-generator.com/hc/en-us/articles/7665090677005-How-can-I-reactivate-my-QR-Codes), and [Uniqode's subscription help article](https://docs.uniqode.com/en/articles/17190918-what-happens-to-my-qr-codes-when-my-subscription-changes-or-ends), checked November 13, 2026. Scanstone limits and prices checked against the current site on the same date._
