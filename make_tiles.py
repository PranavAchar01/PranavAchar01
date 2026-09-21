"""Generate the icon tiles for the GitHub profile README grid."""

from pathlib import Path

W, H = 240, 150
FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

# Each icon is drawn in a 48x48 box, stroked in the tile's accent color.
ICONS = {
    "arm": '<rect x="6" y="38" width="18" height="6" rx="2"/><path d="M15 38 L15 26 L30 14"/><circle cx="15" cy="26" r="3"/><circle cx="30" cy="14" r="3"/><path d="M30 14 L40 10 M30 14 L38 20"/>',
    "eye": '<path d="M4 24 C12 12 36 12 44 24 C36 36 12 36 4 24 Z"/><circle cx="24" cy="24" r="6"/>',
    "factory": '<path d="M6 42 L6 22 L16 28 L16 22 L26 28 L26 22 L36 28 L36 10 L42 10 L42 42 Z"/><path d="M12 36 h4 M22 36 h4 M32 36 h4"/>',
    "pulse": '<path d="M4 26 L14 26 L18 16 L24 36 L30 12 L34 26 L44 26"/>',
    "shield": '<path d="M24 5 L40 11 L40 23 C40 33 33 40 24 43 C15 40 8 33 8 23 L8 11 Z"/><path d="M17 24 L22 29 L31 19"/>',
    "nodes": '<circle cx="10" cy="12" r="4"/><circle cx="38" cy="12" r="4"/><circle cx="24" cy="36" r="4"/><circle cx="24" cy="20" r="3"/><path d="M13 14 L21 19 M35 14 L27 19 M24 23 L24 32"/>',
    "steps": '<rect x="4" y="18" width="10" height="12" rx="2"/><rect x="19" y="18" width="10" height="12" rx="2"/><rect x="34" y="18" width="10" height="12" rx="2"/><path d="M14 24 h5 M29 24 h5"/>',
    "merge": '<circle cx="12" cy="10" r="4"/><circle cx="12" cy="38" r="4"/><circle cx="36" cy="24" r="4"/><path d="M12 14 L12 34 M12 18 C12 26 22 24 32 24"/>',
    "target": '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="8"/><path d="M24 2 v8 M24 38 v8 M2 24 h8 M38 24 h8"/>',
    "bone": '<circle cx="10" cy="14" r="5"/><circle cx="14" cy="10" r="5"/><circle cx="38" cy="34" r="5"/><circle cx="34" cy="38" r="5"/><path d="M15 15 L33 33"/>',
    "search": '<circle cx="20" cy="20" r="12"/><path d="M29 29 L42 42"/>',
    "headset": '<path d="M8 28 L8 22 C8 12 15 6 24 6 C33 6 40 12 40 22 L40 28"/><rect x="5" y="26" width="8" height="12" rx="3"/><rect x="35" y="26" width="8" height="12" rx="3"/><path d="M40 38 C40 42 36 44 28 44"/>',
    "sun": '<circle cx="24" cy="24" r="8"/><path d="M24 4 v6 M24 38 v6 M4 24 h6 M38 24 h6 M10 10 l4 4 M34 34 l4 4 M38 10 l-4 4 M14 34 l-4 4"/>',
    "doc": '<path d="M12 4 L30 4 L38 12 L38 44 L12 44 Z"/><path d="M30 4 L30 12 L38 12"/><path d="M18 22 h14 M18 29 h14 M18 36 h9"/>',
    "globe": '<circle cx="24" cy="24" r="18"/><path d="M6 24 h36 M24 6 C16 14 16 34 24 42 M24 6 C32 14 32 34 24 42"/>',
    "linkedin": '<rect x="5" y="5" width="38" height="38" rx="7"/><path d="M15 21 L15 34 M15 14 L15 14.5 M22 34 L22 21 M22 26 C22 20 33 19 33 26 L33 34"/>',
}

TILES = [
    ("player-two", "arm", "#38bdf8", "Player Two", "1st, Executable World"),
    ("sixthsense", "eye", "#a78bfa", "SixthSense", "2nd, ExecuTorch + PyTorch blog"),
    ("foundry", "factory", "#fbbf24", "Foundry", "1st, terac track"),
    ("healthflow", "pulse", "#fb7185", "HealthFlow", "1st, Scalekit x Apify"),
    ("vigil", "shield", "#34d399", "Vigil", "Finalist, Anthropic x Abridge"),
    ("optivia", "nodes", "#818cf8", "Optivia", "Co-founder"),
    ("reasoning", "steps", "#f472b6", "LLM Reasoning", "UCSC AIEA research"),
    ("open-source", "merge", "#4ade80", "Open Source", "statsmodels, LanceDB, Biome"),
    ("guardianeye", "target", "#f97316", "GuardianEye", "Pose + depth safety agent"),
    ("osteon", "bone", "#e2e8f0", "Osteon", "Implant-design agent in Blender"),
    ("scrutineer", "search", "#22d3ee", "Scrutineer", "Self-improving UI agent"),
    ("sightline", "headset", "#c084fc", "Sightline", "Screen-aware voice agent"),
    ("lumen", "sun", "#facc15", "Lumen", "Accessibility agent"),
    ("resume", "doc", "#f8fafc", "Resume", "One page, PDF"),
    ("website", "globe", "#60a5fa", "Website", "pranavachar.vercel.app"),
    ("linkedin", "linkedin", "#0ea5e9", "LinkedIn", "in/pranavachar"),
]


def tile(icon: str, accent: str, title: str, sub: str) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111827"/><stop offset="1" stop-color="#1f2937"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.18" cy="0.25" r="0.6">
      <stop offset="0" stop-color="{accent}" stop-opacity="0.28"/><stop offset="1" stop-color="{accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="1" y="1" width="{W - 2}" height="{H - 2}" rx="18" fill="url(#bg)" stroke="#374151" stroke-width="1.5"/>
  <rect x="1" y="1" width="{W - 2}" height="{H - 2}" rx="18" fill="url(#glow)"/>
  <g transform="translate(20 18)" fill="none" stroke="{accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">{ICONS[icon]}</g>
  <text x="20" y="100" fill="#f9fafb" font-family="{FONT}" font-size="21" font-weight="700">{title}</text>
  <text x="20" y="124" fill="#9ca3af" font-family="{FONT}" font-size="13">{sub}</text>
</svg>
'''


out = Path(__file__).parent / "tiles"
out.mkdir(exist_ok=True)
for slug, icon, accent, title, sub in TILES:
    (out / f"{slug}.svg").write_text(
        tile(icon, accent, title, sub.replace("&", "&amp;"))
    )
print(f"wrote {len(TILES)} tiles to {out}")
