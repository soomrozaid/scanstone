Some QR codes stop working after a free trial because they contain a provider’s redirect link, and the provider deactivates that link when the trial ends. A static QR pattern has no trial expiry, although the website it points to can still disappear. Before printing, check which kind of code you created and what the provider’s cancellation policy actually says.

## What expires: the redirect, not the printed pattern

A static QR code stores its content directly. For a menu URL, the pattern contains that URL; a compatible phone reads it and opens the website. The QR generator does not need to operate a separate redirect for the scan to work. If you own the menu URL and keep it available, you can change the menu content at that address without changing the QR code.

A dynamic code stores a redirect URL instead. The redirect service sends the visitor to your chosen destination. This makes it possible to change that destination after printing and count scans, but both the redirect service and the destination website need to remain available.

“Free” can describe a static generator, an ongoing free plan, or a limited trial of a dynamic service. Those are different offers. An account requirement alone does not tell you which kind of code you have.

## One documented example

QRCG by Bitly, the service at qr-code-generator.com, [states in its help center](https://support.qr-code-generator.com/hc/en-us/articles/7665013224205-I-received-a-message-saying-that-my-QR-Codes-will-be-deactivated-What-does-that-mean) that dynamic codes created during its 14-day free trial are deactivated when the trial ends. Scans then reach a service page. Its static codes continue working.

That is a specific provider’s documented policy, not a claim that every QR generator behaves the same way. Read the policy for the service you are considering, including any ongoing free plan, scan limits, and cancellation terms. A paid dynamic service may suit your needs; the important question is what happens to material you have already printed when you leave it.

## Check the code before printing

Start with a sample and follow the entire route from camera to destination:

1. **Inspect the encoded URL.** Use a QR reader that shows the raw decoded content. Compare its hostname with the website you intended to link to. A provider’s short domain indicates a redirect dependency. A browser’s final address alone can hide that intermediate step.
2. **Check your account and plan.** Look for trial dates and rules for inactive or paused codes. Ask the provider whether cancellation affects existing redirects, only paid features, or both.
3. **Test your destination without signing in.** Open it in a private browser window and on mobile data. A working QR code is not useful if guests see a login screen or permission error.
4. **Print one sample.** Test the real size, paper, lighting, and placement with more than one phone. Keep a clear margin around the pattern and avoid folds and reflections.
5. **Save the source and plan details.** Keep the destination URL, download, and the policy you relied on so the next person maintaining the menu knows how it works.

For a restaurant, the [menu QR code guide](/restaurant-menu-qr-code) walks through the choice between a stable URL and an editable redirect. Updating menu items at the same URL does not, by itself, require a dynamic code.

## If your printed code has already stopped working

First distinguish a scanning failure from a destination failure. If the camera cannot read the pattern, check print quality, contrast, damage, and lighting. If it reads the URL but the page fails, open that URL directly and check your website, permissions, and redirect provider.

If a provider reports an expired trial, follow its documented reactivation process. QRCG by Bitly’s [reactivation instructions](https://support.qr-code-generator.com/hc/en-us/articles/7665090677005-How-can-I-reactivate-my-QR-Codes) say to upgrade the original account. They also explain that creating a new account or generating another code with the same content does not reactivate the original.

A new QR generator cannot change the pattern already on your table cards. Unless you control the URL encoded in that pattern, moving providers normally means replacing the printed code. If you do control that URL, you may be able to change its content or redirect on your own website. Confirm that control before promising a migration without reprinting.

## Choosing a setup you can maintain

A static code is a good fit when you control a stable destination and do not need scan analytics. A dynamic service is useful when destinations may move or you want to compare scans across placements. Evaluate the cancellation policy alongside those features.

[Scanstone’s free static generator](/qr-code-generator) produces PNG and SVG codes without an account. For editable codes and short links, the free account includes 3 in total. Its [redirect policy](/terms) does not disable existing redirects because of cancellation, downgrade, or plan limits; [paid plans](/pricing) add capacity and reporting features. Deleting a code or account still removes its redirects, and both the redirect service and the destination must remain available.

Choose the workflow that fits what you print, test a sample, and keep the destination maintained. That preparation matters more than a broad promise that a code will “last forever.”

_Sources: [QRCG by Bitly — trial deactivation policy](https://support.qr-code-generator.com/hc/en-us/articles/7665013224205-I-received-a-message-saying-that-my-QR-Codes-will-be-deactivated-What-does-that-mean) and [reactivation instructions](https://support.qr-code-generator.com/hc/en-us/articles/7665090677005-How-can-I-reactivate-my-QR-Codes), checked November 4, 2026. Product limits checked against Scanstone’s current implementation on the same date._
