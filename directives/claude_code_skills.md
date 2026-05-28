# Directive: Claude Code Skills AI Integration

**Goal**: Utilize Anthropic's Agent Skills to improve the aesthetics, design system, and interactivity of the football news portal (*Zona Mista*), including the penalty shootout kick animation.

**Selected Skills**:
- **frontend-design**: For layout structure, responsive grids, and typography enhancements.
- **canvas-design**: For layout aesthetics, canvas animations, and visual organization.
- **web-artifacts-builder**: For rich HTML, CSS, and JS components.
- **brand-guidelines**: For maintaining consistent colors, styles, and neon football theme.

**Location**:
- The downloaded/copied skills are located in the `.claude/skills/` directory.
- The reference PDF is located in `docs/Claude Code Skills.pdf`.

**Execution**:
- Align stylesheet variables (`frontend/app.css`) with premium typography and green-neon football brand colors.
- Build the penalty shootout challenge (mini-game) using SVG/CSS and canvas animations in `frontend/index.html` and `frontend/app.js`.

**Edge Cases**:
- The interactive elements must work on both desktop and mobile screens.
- Animation triggers should be optimized so they do not block main main-thread performance (use hardware-accelerated CSS where possible).
- Fallback content must be displayed if canvas or animations are not supported.
