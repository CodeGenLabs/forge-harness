---
skill: ui-ux
id: invented-parallel-components
fails-without: >
  Asked to build a screen, the agent generates custom Button, Input, and Modal
  components from scratch, ignoring existing implementations in the project's
  component library and creating visual inconsistency across the application.
with-skill: >
  The agent performs a 3-layer codebase audit before generating code, discovers
  existing project components, and composes the requested screen using the
  project's established primitives.
caught-by: none
---

An application screen is requested in a codebase that already uses shadcn/ui or
an internal design system.

Without the skill, an agent frequently introduces inline primitives (e.g., custom
`<button className="...">` or new `<Avatar>` components), producing inconsistent
border radii, colours, and focus rings.

With the skill, step 1 mandates an audit of existing components and libraries.
Existing project primitives are reused, and only missing components are
introduced.
