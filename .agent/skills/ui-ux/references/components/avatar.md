# Avatar

**If the project already has an avatar component, use theirs** (rule sentence 2, section 0). This file is only
for when grep comes back empty.

---

## No image means an initial on a pastel background

A light background, text in the **same hue** but darker. Not white text on a solid background —
five or six solid colours next to each other in a list turn into a rainbow palette.

```
  ╭───╮ ╭───╮ ╭───╮ ╭───╮
  │ A │ │ H │ │ B │ │ L │     pastel background, same hue darker text,
  ╰───╯ ╰───╯ ╰───╯ ╰───╯     thin ring in the same hue
```

```tsx
interface AvatarTone {
  background: string;
  text: string;
  ring: string;
}

const avatarTones: AvatarTone[] = [
  { background: "bg-emerald-50 dark:bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-200 dark:ring-emerald-500/30" },
  { background: "bg-sky-50 dark:bg-sky-500/15", text: "text-sky-700 dark:text-sky-300", ring: "ring-sky-200 dark:ring-sky-500/30" },
  { background: "bg-indigo-50 dark:bg-indigo-500/15", text: "text-indigo-700 dark:text-indigo-300", ring: "ring-indigo-200 dark:ring-indigo-500/30" },
  { background: "bg-pink-50 dark:bg-pink-500/15", text: "text-pink-700 dark:text-pink-300", ring: "ring-pink-200 dark:ring-pink-500/30" },
  { background: "bg-amber-50 dark:bg-amber-500/15", text: "text-amber-700 dark:text-orange-400", ring: "ring-amber-200 dark:ring-amber-500/30" },
  { background: "bg-violet-50 dark:bg-violet-500/15", text: "text-violet-700 dark:text-violet-300", ring: "ring-violet-200 dark:ring-violet-500/30" },
];

// The same person always gets the same colour, on every screen, on every reload.
function getAvatarTone(seed: string): AvatarTone {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }

  return avatarTones[Math.abs(hash) % avatarTones.length];
}

// "Tran Nguyen Anh Tuan" -> "T"; a one-word name -> that letter
function getInitial(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase("vi");
}
```

```tsx
// The seed is the id (or email), NOT the display name — see "Why it works" below
const tone = getAvatarTone(user.id);

<span
  className={cn(
    "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
    "text-sm font-semibold ring-1",
    tone.background,
    tone.text,
    tone.ring,
  )}
  aria-hidden
>
  {getInitial(name)}
</span>
```

**Without Tailwind**, replace the classes with the codes below. These are exactly the Tailwind v4 classes
above converted to hex, so both kinds of project get the same colours. Avatar colours are
identity colours, they carry no meaning, so they do not go into `tokens.css`: put them directly in the array.

| Hue | Background `-50` | Text `-700` | Ring `-200` | Text/background contrast |
| --- | --- | --- | --- | --- |
| emerald | `#ecfdf5` | `#007a55` | `#a4f4cf` | 5.1:1 |
| sky | `#f0f9ff` | `#0069a8` | `#b8e6fe` | 5.5:1 |
| indigo | `#eef2ff` | `#432dd7` | `#c6d2ff` | 7.2:1 |
| pink | `#fdf2f8` | `#c6005c` | `#fccee8` | 5.4:1 |
| amber | `#fffbeb` | `#bb4d00` | `#fee685` | 4.9:1 |
| violet | `#f5f3ff` | `#7008e7` | `#ddd6ff` | 6.7:1 |

**Dark background** (`M32`): a `-50` background in dark mode is six white dots on a black screen. The background is the `-500` hue
at 15%, text `-300`, ring the `-500` hue at 30%; the `dark:` classes are already in the array above. Amber alone uses
**`orange-400`** for text: `amber-300` drifts 35° towards yellow compared with the light theme's `amber-700` (`M7`, "Pick the dark variant by hue").
Without Tailwind, text: emerald `#5ee9b5`, sky `#74d4ff`, indigo `#a3b3ff`, pink `#fda5d5`,
amber `#ff8904` (orange-400), violet `#c4b4ff`; background and ring are `color-mix(in srgb, <-500 code> 15%, transparent)`
and `30%` with emerald `#00bc7d`, sky `#00a6f4`, indigo `#615fff`, pink `#f6339a`, amber `#fe9a00`,
violet `#8e51ff`.

```ts
const avatarTones: AvatarTone[] = [
  { background: "#ecfdf5", text: "#007a55", ring: "#a4f4cf" },
  // ... the other five hues from the table, keep the exact order so the same id gets the same colour
];
// style={{ background: tone.background, color: tone.text, boxShadow: `0 0 0 1px ${tone.ring}` }}
```

**Why it works**

- **The colour comes from the `id` or email, not the name.** Two people with the same name still get different colours, and changing the display name does not make the colour jump. Picking randomly at render time gives a different colour on every reload — users recognise each other by colour, and a jumping colour is lost.
- **The same person has the same colour everywhere, including on the same screen.** The avatar in the header, the sidebar footer, the profile page and the member list all call one component with the same seed. The usual place it drifts is the large avatar on the profile page built separately: an indigo background in the header and amber on the profile page, same letter "T".
- **The letter comes from the saved name, not the field being edited, and is never "?".** An empty name (new account, no name yet) takes the first letter of the email.
- **Six hues, fixed.** Enough for a list of ten people to look different, few enough not to become a rainbow. Do not generate free HSL colours from the hash — you get muddy dull hues nobody would choose. Identity colours for projects, boards and categories (`M34`) share exactly these six hues.
- **No `red`, no `rose`.** Those two hues already mean something in the app: errors and dangerous actions (`M30`). A red avatar for a person looks like that account has a problem. For pink, use `pink`.
- **Background `-50`, text `-700`, ring `-200`**: all three in the same hue. `-700` text on a `-50` background reaches readable contrast at `text-sm`.
- **`aria-hidden`** — the user's name is already shown right next to the avatar. A screen reader reading "T" before the name is redundant.
- The ring uses `ring-1`, not `border` — see `M17` and `card.md`: things with a fixed size use a ring so the outline does not eat into the size.

---

## One letter or two

**One letter.** Taking the first two letters of a Vietnamese name gives "TN" for "Tran Nguyen…" —
two letters of the **family name**, and nobody recognises anyone. Taking the first letter of the given name ("Tuan" → "T") is more
correct, but separating the given name from the family and middle names in every case cannot be done.

The first letter of the name string is always correct, always predictable, and the background colour already handles
telling people apart.

If the project is already used to two letters (used everywhere), follow the project, do not change it.

English-language apps are the opposite: two letters, first name and last name (`Jane Doe` → `JD`). In English
names the given name comes first and the family name last, so two letters always split correctly (`T28`).

---

## Stacked

Groups of people, member lists, "3 people viewing":

```tsx
// -space-x-2: overlapping is the nature of an avatar group, there is no positive alternative (N11 step 4).
<div className="flex -space-x-2">
  {members.map((member) => (
    <Avatar key={member.id} className="ring-2 ring-surface" {...member} />
  ))}
</div>
```

- **`ring-2 ring-surface`** replaces the coloured ring when stacked — the white ring cuts each avatar off from the one behind it. Without it the circles merge into one blob.
- Stack `-space-x-2` with size `size-10`. Stacking deeper hides the letters.
- More than 4 people: show 3, then a `+5` cell of the same size, `--background` background, `--muted` text.

---

## With an image

```tsx
<Image src={avatarUrl} alt="" width={40} height={40} className="size-10 rounded-full object-cover ring-1 ring-border" />
```

`alt=""` for the same reason as `aria-hidden` above. If the image fails, fall back to the initial, do not
leave an empty grey circle.
