# Accessible component playground (FE-05)

Three components built from scratch against the W3C ARIA Authoring
Practices Guide, no component libraries:

```
src/
  components/
    Modal.tsx        # Dialog (Modal) pattern
    Tabs.tsx          # Tabs pattern
    Disclosure.tsx    # Disclosure (Show/Hide) pattern
  App.tsx             # demo wiring all three together
  main.tsx
  styles.css
```

## Running it

```bash
npm install
npm run dev        # start vite
npm run typecheck   # tsc --noEmit
```

> Built and reviewed in a sandboxed environment without network access,
> so `npm install` and the shadcn/ui CLI itself couldn't actually be run
> here. The code was written directly against React 19 + TypeScript's
> strict mode and checked with `tsc` against the globally-installed
> `react`/`react-dom` packages (which ship their own runtime, just not
> `@types/react`) to catch real bugs — this caught and fixed a missing
> `ReactNode` import in `Tabs.tsx`. Run `npm install` locally to pull in
> `@types/react` for the full, clean typecheck.

## Manual keyboard test checklist

**Modal**
- [ ] Tab to "Open dialog", press Enter/Space — focus moves inside the dialog
- [ ] Tab through all focusable elements in the dialog — focus wraps back to the first one, never escapes to the page behind it
- [ ] Shift+Tab from the first element — focus wraps to the last one
- [ ] Escape closes the dialog
- [ ] After closing (via Escape, the Close button, or backdrop click), focus returns to the "Open dialog" button

**Tabs**
- [ ] Tab into the tab list — lands on the *selected* tab only (roving tabindex, not every tab)
- [ ] ArrowRight/ArrowLeft move focus between tabs and switch the visible panel, wrapping at both ends
- [ ] Home/End jump to the first/last tab
- [ ] Tab out of the tab list moves to the tab panel's content, not to every individual tab

**Disclosure**
- [ ] Tab to the disclosure button
- [ ] Enter or Space toggles it open/closed
- [ ] `aria-expanded` reflects state (check via devtools or a screen reader)
- [ ] Collapsed content is not reachable by Tab

See `NOTES.md` for the shadcn/ui comparison.
