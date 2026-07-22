# Notes: hand-built components vs shadcn/ui

## A caveat on how this was produced

This sandbox has no network access, so I couldn't actually run
`npx shadcn@latest init` / `add dialog tabs` here and diff the generated
files line by line. What follows is based on how shadcn/ui's `dialog.tsx`
and `tabs.tsx` actually work — they're thin, styled wrappers around
`@radix-ui/react-dialog` and `@radix-ui/react-tabs` — not a guess at what
a good implementation *might* do. To verify this against the literal
generated source on your machine:

```bash
npm create vite@latest shadcn-check -- --template react-ts
cd shadcn-check
npx shadcn@latest init
npx shadcn@latest add dialog tabs
# then read src/components/ui/dialog.tsx and tabs.tsx
```

Everything below is written so you can check it against that output.

## What I built vs. what Radix (which shadcn wraps) does

### Modal / Dialog

My version handles the four things the eval criteria actually asks for:
`role="dialog"` + `aria-modal`, a manual focus trap on Tab/Shift+Tab,
Escape to close, and returning focus to the trigger. Gaps against
Radix's `Dialog`:

1. **No portal.** My dialog renders in place in the React tree. Radix
   renders `Dialog.Content` through a `Portal` into `document.body` (or a
   custom container). Without a portal, a dialog nested inside a
   `overflow: hidden` or `position: relative` ancestor can get clipped or
   z-index-trapped — the DOM position and the visual "this is on top of
   everything" intent are two different problems, and I only solved the
   second one with CSS.

2. **No scroll lock.** Radix uses `react-remove-scroll` to lock body
   scroll (and prevent touch-scroll on mobile) while the dialog is open.
   In my version, a long page can still scroll behind the modal, which
   both looks wrong and lets a screen magnifier user or a mouse user
   scroll content that's supposed to be inert.

3. **Weaker focus trap edge cases.** My trap walks
   `querySelectorAll(FOCUSABLE_SELECTOR)` and wraps Tab/Shift+Tab between
   the first and last match. It breaks down for elements that become
   focusable/unfocusable after mount (e.g. a `disabled` button toggling),
   and it doesn't handle `display: none` vs. actually-hidden distinctions
   as carefully as Radix's `FocusScope`, which tracks focusable elements
   more defensively and also handles the "no focusable children" case by
   keeping focus parked on the container itself.

4. **No `aria-describedby` wiring, no dev-time warning.** Radix's
   `Dialog.Description` auto-generates an id and wires it to
   `aria-describedby` on the content, and — notably — logs a console
   warning in development if you render a dialog with no description and
   no explicit `aria-describedby` override. My version only wires
   `aria-labelledby`; a screen reader user gets the title but no
   supporting context unless I remember to add it by hand every time.

5. **No open/close animation lifecycle.** Radix uses a `Presence`
   component so the dialog stays mounted (with `data-state="closed"`)
   long enough for a CSS exit animation to finish before actually
   unmounting. My version unmounts immediately on `isOpen = false` —
   fine for correctness, but it means I can't add an exit transition
   without rebuilding this mechanism.

6. **Dismissal layering.** Radix's `DismissableLayer` understands
   *which* dialog should respond to Escape/outside-click when multiple
   are stacked, and distinguishes a genuine outside click from things
   like text selection dragging past the boundary or a click on a
   scrollbar. My version only knows about one dialog at a time.

### Tabs

My version covers the eval bar: `tablist`/`tab`/`tabpanel` roles, roving
`tabIndex`, and Left/Right/Home/End with wraparound (automatic
activation — moving focus also selects). Gaps against Radix's `Tabs`:

1. **No `orientation` support.** Radix ships `orientation="horizontal" |
   "vertical"` which both sets `aria-orientation` on the tablist *and*
   swaps which arrow keys navigate (Up/Down instead of Left/Right for a
   vertical tab list, per the APG pattern). Mine is hard-coded to
   Left/Right.

2. **No RTL awareness.** Radix reads `dir` from context and reverses
   ArrowLeft/ArrowRight in right-to-left layouts, so "next tab" always
   means the same visual direction as "forward" in that language. Mine
   always treats ArrowRight as "next", which is backwards in an RTL
   document.

3. **No disabled-tab handling.** Radix's roving-tabindex logic skips
   disabled tabs when computing the next focus target on Home/End/arrow
   keys. My `focusAndSelect` just does modulo arithmetic over the full
   list, so a disabled tab would still receive focus.

4. **No configurable activation mode.** Radix exposes
   `activationMode="automatic" | "manual"` — manual mode moves focus
   with the arrow keys but only activates the tab on Enter/Space, which
   is the other APG-sanctioned pattern and is meaningfully better when
   switching tabs is expensive (e.g. triggers a network request). I only
   implemented automatic activation and didn't make it a choice.

### Disclosure

This is the one where my version and shadcn/Radix land closest, mostly
because there's no `@radix-ui/react-disclosure` primitive in shadcn's
default set — a plain `<button aria-expanded>` plus a controlled `hidden`
region genuinely is the correct, complete pattern here, which is
reassuring. The main thing a Radix-style `Collapsible` primitive adds
that I skipped is animating the height on open/close (measuring
`scrollHeight` and animating to it) rather than an instant show/hide.

## Two-line summary (for the eval checklist)

- **Biggest gap in Modal:** no portal + no scroll lock, meaning the
  dialog isn't truly decoupled from the page it renders inside, and
  the page behind it isn't actually inert to scrolling.
- **Biggest gap in Tabs:** no `orientation`/RTL/disabled-tab handling —
  my roving tabindex math assumes a fixed, uniform, LTR, all-enabled
  list, which real tab lists often aren't.
