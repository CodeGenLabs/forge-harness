# Stack Mappings: Vue 3, Nuxt, Nuxt UI v4, shadcn-vue & Tailwind CSS v4

Unified stack integration rules across Design-System Stack Matrix `[UPM]`, Craft &
Polish `[IMP]`, Baseline UI Constraints `[UIS]`, and Web Interface Audit `[WIG]`.

---

## 1. Token-to-Stack Pipeline (`tokens.json` $\rightarrow$ `tokens.css` $\rightarrow$ Framework)

Never hardcode hex colors or pixel spacing inside Vue templates or utility classes (`ST-06`,
`AP-25`). All frameworks consume the same semantic CSS custom properties defined in
`references/tokens.css`.

---

## 2. Tailwind CSS v4 (`@theme` & `@utility`) (`[UPM]`, `[UIS]`)

In Tailwind CSS v4, configure design tokens directly in CSS using `@theme inline` rather
than legacy `tailwind.config.js`:

```css
@import "tailwindcss";
@import "./tokens.css";
@import "./primitives.css";

@theme inline {
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
  --font-mono: var(--font-mono);

  --color-background: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-surface-raised: var(--color-surface-raised);
  --color-surface-sunken: var(--color-surface-sunken);

  --color-foreground: var(--color-fg);
  --color-foreground-secondary: var(--color-fg-secondary);
  --color-foreground-muted: var(--color-fg-muted);

  --color-primary: var(--color-primary);
  --color-primary-hover: var(--color-primary-hover);
  --color-on-primary: var(--color-on-primary);

  --color-border-subtle: var(--color-border-subtle);
  --color-border-strong: var(--color-border-strong);
  --color-ring: var(--color-focus-ring);

  --color-success: var(--color-success);
  --color-warning: var(--color-warning);
  --color-danger: var(--color-danger);
  --color-info: var(--color-info);

  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
}
```

### Tailwind v4 Guardrails

- **Ban `transition-all` (`AP-53`)**: Use `transition-colors`, `transition-opacity`, or `transition-transform duration-150 ease-out`.
- **Ban `h-screen` (`AP-42`)**: Always use `min-h-dvh` or `h-dvh`.
- **Use Every Layout classes for macro structure (`LP-01`..`LP-19`)**: Prefer `.l-stack`, `.l-sidebar`, `.l-switcher`, and `.l-grid` over chains of `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` viewport utilities.
- **Tabular numbers (`P-28`)**: Add `tabular-nums` on every numeric `<td>`, price, badge counter, and KPI metric.
- **Text wrapping (`P-29`)**: Add `text-balance` on headings and `text-pretty` on `<p>` blocks.

---

## 3. Nuxt 3/4 & Nuxt UI v4 (`@nuxt/ui`) (`[UPM]`)

### 3.1 Semantic Theme Binding (`app.config.ts` + `main.css`)

Nuxt UI v4 builds on Reka UI + Tailwind CSS v4. Map semantic color aliases in
`app.config.ts` and bind your OKLCH shades in `assets/css/main.css`:

```ts
// app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'slate',
      success: 'emerald',
      warning: 'amber',
      error: 'rose',
      info: 'sky',
    },
    button: {
      slots: {
        base: 'font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2',
      },
    },
    card: {
      slots: {
        root: 'bg-[var(--color-surface)] ring-1 ring-[var(--color-border-subtle)] rounded-[var(--radius-lg)] shadow-none',
        header: 'px-5 py-4 border-b border-[var(--color-border-subtle)]',
        body: 'p-5',
        footer: 'px-5 py-4 border-t border-[var(--color-border-subtle)]',
      },
    },
  },
})
```

### 3.2 Nuxt & Nuxt UI Component Rules

- **`UApp` Root Wrapper**: Wrap `app.vue` in `<UApp>` so toast notifications (`useToast`), modals (`UModal`), slideovers (`USlideover`), and tooltips share a single accessible portal context.
- **Async Data 4-State Completeness (`P-90`, `SS-01`..`SS-04`)**: Every `useFetch` or `useAsyncData` call in a Nuxt page/component must explicitly render all 4 states:
  1. `status === 'pending'` $\rightarrow$ `<USkeleton>` matching loaded geometry (`P-89`).
  2. `error` $\rightarrow$ `<UAlert color="error" variant="subtle">` with actionable message and a retry `<UButton>` (`P-108`).
  3. `!data?.length` $\rightarrow$ Empty state `.l-stack` with explanation and primary creation `<UButton>` (`P-73`).
  4. Populated state $\rightarrow$ `<UTable>` or `.l-grid` with `tabular-nums`.
- **Single Primary `<UButton>` (`P-07`, `LUX-08`)**: At most one `<UButton color="primary" variant="solid">` per view. Secondary actions use `color="neutral" variant="outline"` or `variant="ghost"`. Destructive triggers in lists use `color="neutral" variant="ghost"` and open a confirmation `<UModal>` (`P-08`, `P-105`).
- **Accessible Forms (`<UForm>` + `<UFormField>`)**: Always wrap inputs (`<UInput>`, `<USelect>`, `<UTextarea>`, `<URadioGroup>`) inside `<UFormField label="..." name="..." required>` so `<label for>`, `aria-invalid`, and `aria-describedby` error messages bind automatically (`A11Y-04`, `A11Y-19`).
- **No Nested `<UCard>` Inside `<UCard>` (`AP-32`, `P-60`)**: Use `<UCard>` only for the outer container; structure internal subsections with `.l-stack` and subtle background wells (`bg-[var(--color-surface-sunken)]`).
- **Icons (`<UIcon>`)**: Use a single icon collection (`i-lucide-*` or `i-ph-*`) with consistent stroke weight (`P-77`). Icon-only `<UButton icon="i-lucide-x" />` must always include `aria-label="Close"` (`A11Y-02`).

---

## 4. Vue 3 & `shadcn-vue` (`reka-ui`) (`[UPM]`, `[UIS]`)

When building with Vue 3 + `shadcn-vue` (built on `reka-ui` primitives):

- **Bridge CSS Variables in `assets/index.css`**: Map `shadcn-vue` variables directly to our OKLCH tokens (`--background: var(--color-bg)`, `--foreground: var(--color-fg)`, `--card: var(--color-surface)`, `--primary: var(--color-primary)`, `--primary-foreground: var(--color-on-primary)`, `--muted-foreground: var(--color-fg-muted)`, `--border: var(--color-border-subtle)`, `--ring: var(--color-focus-ring)`, `--radius: var(--radius-md)`).
- **Dialog & Sheet Accessibility (`KB-05`, `A11Y-05`)**: Every `<DialogContent>` and `<SheetContent>` must include `<DialogTitle>` and `<DialogDescription>` (use `<VisuallyHidden>` only when the title is visually redundant, never omit `<DialogTitle>`).
- **Form Validation (`vee-validate` + `zod`)**: Configure validation mode to trigger on `blur` or `submit`, and re-validate on `input` only after an field has been marked invalid (`P-102`, `C-18`).
- **Prevent Prop-Drilling Visual Overrides**: Define variants via `cva` (`class-variance-authority`) inside `components/ui/*` rather than scattering ad-hoc classes across feature views.

---

## 5. Secondary UI Library Reference Matrix (`[UPM]`, `C-25`)

When a project uses another component library, bridge `tokens.css` using these mechanisms:

| Library | Token Integration Mechanism | Critical Craft & License Guardrails |
|---|---|---|
| **PrimeVue v4** (`@primevue/themes`) | `definePreset(Aura, { semantic: { primary: ..., colorScheme: { light: ..., dark: ... } } })` or Pass-Through (`pt`) | **Target PrimeVue v4 (`C-25`)**. Warn the user before adopting PrimeVue v5 due to restrictive commercial license changes on core components. |
| **Vuetify 3** | `createVuetify({ theme: { themes: { light: { colors: ... }, dark: { colors: ... } } }, defaults: { VBtn: { variant: 'flat' }, VCard: { elevation: 0, border: true } } })` | Override default Material ripple/elevation bloat (`VCard` `elevation: 0` + `1px` border; `text-transform: none` on `VBtn` for Sentence case `P-109`). |
| **Element Plus** | Override `--el-color-primary`, `--el-text-color-primary`, `--el-border-color-light`, `--el-border-radius-base` on `:root` | Replace narrow `12px` helper text and low-contrast `#909399` placeholder gray with WCAG AA `--color-fg-muted` (`>= 4.5:1`). |
| **MUI (Material UI)** | `extendTheme({ cssVarPrefix: 'studio', colorSchemes: { light: ..., dark: ... }, typography: { button: { textTransform: 'none' } } })` | Disable default ALL-CAPS buttons (`P-109`), heavy 3-part Material shadows (`P-62`), and floating label shrink animations that obscure labels (`P-99`). |
| **Ant Design / Ant Design Vue** | `<ConfigProvider :theme="{ token: { colorPrimary, colorBgContainer, colorText, borderRadius, fontSize: 16 } }">` | Raise default `fontSize` from `14px` to `16px` (`P-30`, `FM-02`) and increase control height from `32px` to `40px–44px` (`TG-01`). |
