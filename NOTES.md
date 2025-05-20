# Notes

In this file I regroup various thoughts about how things could be done so I do
not forget.

This document is half rubber-ducking, half emptying my head from ideas that
came up to me at random unexpected times regarding this project (like shower
thoughts that I would prefer kept written somewhere, basically)!

## Real efficient application isolation

### Solution seen

It turns out that i-frame isolation rules are a mess, frequently evolving, yet
nonetheless what would appear to be the best fit here is to create unique
"origin" for each "sandboxed" application.

The idea is that unique origin allows many great things:

- applications don't have access to the parent environment (the desktop) nor its
  DOM.

- applications cannot mess with the desktop storage, or impersonate the actual
  desktop when they make requests etc.

- applications can run in parallel of the desktop. This is very nice as this
  means than an heavy app won't put the desktop to a halt - and if domains
  are unique per app - it also will allow to run parallely to other heavy
  apps.

Putting a restrictive `sandbox="allow-scripts"` on a same-origin iframe would
also unlock many of the same features but it also forbids the iframe's code
to perform a lot of things it would be expected to be able to do: WebWorker
stuff, resource loading from the same origin etc.

Different origins definitely looks less like a mess than trying to make the more
aptly-named `sandbox` attribute works as wanted, and I did tried to make it
work.

### Practical idea

If I were to implement that for fun, it seems most domain registration solutions
support an infinity of subdomain (e.g. `www.example.com`, `www2.example.com`
etc.) which are considered different origins by browser rules.

So the idea would be to generate unique subdomains for an application's
homepage, which is its `html` file that will be served (e.g.
`app43a44.example.com/app.html`).
Randomizing that subdomain may be a good idea conceptually, so an app doesn't
know by default how many other apps are launched.

To improve caching, the CSS stylesheet and JS "sandbox" could be served however
from a unique place, in which case proper CORS headers - enabling all possible
subdomains, should be set specifically for those two: e.g.
`common.example.com/app-style.css` and `common.example.com/app-sandbox.js`).

Also, for the JS of the applications themselves, I guess they do not require to
be served from the "id domain", and could also profit from caching, though there
may be details I'm missing with them, to check organically.
