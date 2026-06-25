# GFF Online: Cleanup Audit

This audit identifies (1) asset files that appear to be unused and (2) menu items that are
non-functional, so cleanup can be done in small, low-risk steps.

The guiding rule throughout: **when in doubt, keep it and flag it.** Anything with even
a plausible dynamic reference was left in the "keep" or "confirm" buckets rather than
marked for deletion.

## Status of this branch

This branch (`cleanup/unused-assets-and-dead-menus`) removes **only the A1 "Definitely
unused" set: 6 image files** (listed below, now struck through). Nothing else is touched.

Everything in **A2 (Probably unused)** and **all 5 non-functional menu entries** are left
in place and listed here as **recommended next steps, pending Ray's confirmation**. They
are deliberately not removed in this PR because each is either a plausible planned feature
or a product decision that is Ray's to make.

---

## How assets are loaded (why this matters)

Assets are not referenced one-by-one in code. The build step
(`tools/create-asset-manifest.mjs`) scans `src/assets/` and writes manifests listing
every `.png`, `.mp3`/`.wav`, `.json`, and `.ttf` it finds. `GLoadingScene` then loads
every file in those manifests, using the **filename without extension as the Phaser key**
(e.g. `vcf_1_ba.mp3` loads as key `vcf_1_ba`).

Consequence: a file being on disk does **not** mean it is used. It is loaded regardless.
An asset is only truly "used" if its key is referenced somewhere in the code, either:

- **statically**, as a literal string (`'main_menu_bg'`), or
- **dynamically**, as a key assembled at runtime (`` `load_bg_${RANDOM.randInt(1,4)}` ``).

Because this game is heavily procedural, dynamic keys are the norm. The audit below was
cross-checked against the dynamic key-building patterns found in the code, so that
procedurally-referenced assets are **not** falsely flagged.

### Method

1. Listed every asset basename (image / sprite / audio / json).
2. Searched all `.ts` source plus all data `.json` for each key as a literal.
3. For anything with no literal hit, checked whether a dynamic pattern could produce it
   (region + suffix, color + suffix, index loops, `${voice}_${syllable}`, etc.).
4. Only assets with **no literal reference and no possible dynamic reference** are listed
   as candidates below. Each candidate was re-checked across `.ts`, `.html`, `.css`,
   `.json`, and `.xml` and found to have **zero** references.

---

# Part A: Assets

## A1. Definitely unused (REMOVED in this branch)

These had zero references **and** positive evidence they were superseded or intentionally
disabled. They are the only files removed in this PR. Their entries were also removed from
`image-manifest.json` so the loader never requests them (no missing-asset warnings).

| File (removed) | Why it was unused |
|---|---|
| ~~`images/bg/main_menu_bg_old.png`~~ | The `_old` suffix; the active main menu uses `main_menu_bg.png` (`GMainMenuContent.ts:63`, literal `'main_menu_bg'`). This was the replaced version. |
| ~~`images/map/test_edge_n.png`~~ | Map rendering draws `map_edge_n` (`GMapUI.ts:361`), not `test_edge_n`. Leftover "test" versions of the edge tiles. |
| ~~`images/map/test_edge_s.png`~~ | Map uses `map_edge_s` (`GMapUI.ts:379`). |
| ~~`images/map/test_edge_e.png`~~ | Map uses `map_edge_e` (`GMapUI.ts:373`). |
| ~~`images/map/test_edge_w.png`~~ | Map uses `map_edge_w` (`GMapUI.ts:367`). |
| ~~`images/map/map_gold_chest.png`~~ | The map code explicitly never draws a gold chest. Comment at `GMapUI.ts:152-154`: gold-chest rooms use `map_boss` as their feature instead. No code path sets a room feature to `map_gold_chest`. |

Subtotal removed: 6 files, ~0.3 MB.

## A2. Probably unused: RECOMMENDED NEXT, pending Ray's confirmation

**Not removed in this PR.** Zero references and no dynamic pattern that could reach them,
but no positive "replaced" evidence, so each may be a planned-but-unwired feature. These
are the recommended next removal batch once Ray confirms they are not intended for upcoming
work. (~1.2 MB of images + audio if all are approved; the JSON below is recommended to keep.)

### Images

| File | Note |
|---|---|
| `images/bg/main_menu_bg_1.png` | Alternate main-menu background (~0.8 MB). Code uses the fixed key `'main_menu_bg'`; there is no `main_menu_bg_${n}` pattern, so the `_1` variant is never reached. Possibly a spare art option. |
| `images/interface/title_overlay.png` | No reference anywhere. Possibly a planned title-screen overlay. |
| `images/interface/ui_icons/preach_on.png` | Toolbar icons are built as `` `${option}_on` ``/`_off` from the button list in `GUIScene.ts:124-218`. The active options are exit, options, glossary, map, people, bible, books, status, actions. `preach` is **not** in that list (though `GUIScene.ts:220` references "street preaching" being disabled in subscreens, hinting at a planned button). |
| `images/interface/ui_icons/preach_off.png` | Same as above. |
| `images/interface/ui_icons/save_on.png` | `save` is not in the toolbar button list (saving happens through the Exit dialog, not a dedicated button). |
| `images/interface/ui_icons/save_off.png` | Same as above. |
| `images/interface/ui_icons/stats_on.png` | The toolbar uses `status` (not `stats`); `stats` icons appear to be an unused alternate name. |
| `images/interface/ui_icons/stats_off.png` | Same as above. |
| `images/scenery/wip/stone_path.png` | In the `scenery/wip` folder. Note: the rest of that folder (bench, camp_tent, cars, mailbox, etc.) **is** used, so do **not** delete the folder; only `stone_path` is unreferenced. |

### Audio

| File | Note |
|---|---|
| `audio/sounds/parry.wav` | No reference in battle code or elsewhere. Possibly a planned combat sound. |
| `audio/sounds/lying_words.mp3` | The "lying words" battle effect (`GBattleContent.ts`) uses image marks (`lyingWordsImages`), not this sound. No `playSound('lying_words')` anywhere. |
| `audio/sounds/debug_on.wav` | No reference. Likely intended for a debug-mode toggle that does not play a sound. |
| `audio/sounds/debug_off.wav` | Same as above. |

### JSON (developer scaffolding, lean toward keep)

These authoring templates and test fixtures are loaded but never invoked by name. They
look like intentional tooling Ray uses when writing new content, so I recommend leaving
them unless Ray confirms otherwise:

- `json/conversations/_duo_template`, `_solo_template`
- `json/conversations/choice_test_conv`, `duo_test_conv`, `dynamic_test_conv`, `solo_test_conv`
- `json/conversations/church_sermons/_church_sermon_template`
- `json/conversations/street_sermons/_street_sermon_template`
- `json/conversations/christmas` (possibly seasonal/unfinished)

Subtotal of A2 image+audio: 13 files, ~1.2 MB. (JSON left as keep-recommended.)

## A3. Referenced / keep

Verified as used (mostly via dynamic keys). Listed so the reviewer can see the procedural
systems that were checked and deliberately left alone:

- **All character sprites** under `sprites/chars/**` (4,353 PNGs): keyed by
  `` `${spriteKeyPrefix}_${animName}[_${dir}]` `` (`GCharSprite.ts`). Out of scope for this
  pass (see A4).
- **All voice clips** `audio/sounds/voices/**` (~1,100 files): keyed by
  `` `${voiceKey}_${syllable}` `` where `voiceKey = vc{gender}_{voice}` and gender is f/m
  plus `vca` for the player (`GSoundManager.ts:221-229`, `GPersonSprite.ts:131`).
- **Region background fades** `*_bg_fade_{n,s,e,w}` (24 files): built as
  `getBgImageName() + '_fade_' + dir` (`GRoom.ts:764`).
- **Loading backgrounds** `load_bg_1..4`: `` `load_bg_${RANDOM.randInt(1,4)}` ``.
- **Cutscene clouds** `cloud_1..3`: `` `cloud_${cloudType}` ``.
- **Stronghold room patterns** `rpt_1..10`: discovered via
  `getTextureKeys().filter(k => k.startsWith('rpt_'))` (`GStrongholdRegion.ts:376`).
- **Vision radius** `radius_0..9`: `'radius_' + commandments` (`GAdventureContent.ts:701`).
- **Open chests** `{black,blue,brown,gold,purple,red}_chest_open`: `` `${color}_chest_open` ``.
- **Active toolbar icons** (`exit/options/glossary/map/people/bible/books/status/actions` `_on`/`_off`).
- **Map terrain overlaps** `map_{region}_overlap`: `terrain + '_overlap'` where
  `terrain = room.getMapTerrain()` returns `map_desert`, `map_forest`, etc. (`GMapUI.ts:179`).
- **People mini-map terrain** `mini_map_{region}`: `` `mini_${room.getMapTerrain()}` `` (`GPeopleUI.ts:145`).
- **Zone templates** `zone_template_1..8`, **name lists** `{f,m,s}_{ethnicity}_names`,
  **saint bios** `saint_bio_{bg,cv}_*`, **sermons**, **music** (all 17), and the
  `_test_saves/test_save.gffsave` fixture (fetched in `GMainMenuContent.ts:413`).

## A4. Out of scope for this pass (deliberate)

- **`sprites/` (4,353 files):** the character/animation key space is enormous and fully
  procedural (NPC prefix x animation x 8 directions x armor state). Safely auditing it
  needs a dedicated pass that enumerates every valid prefix/anim combination. Flagging
  individual sprites here would risk false positives that break rendering, so the whole
  tree is left untouched.
- **`voices/` (1,100 files):** all reachable via the `${voice}_${syllable}` system above.

---

# Part B: Menus

A full per-scene inventory of all ~104 clickable UI items was taken. Almost everything is
wired and working (toolbar, options sliders, Bible/Books/Glossary/People/Map/Status
screens, title and credits flow, new-game options). The only non-functional items are on
the **Main Menu** (`GMainMenuContent.ts`), where five entries only print a "(not
implemented yet)" line to the console.

| Menu item | Location | Handler | Status |
|---|---|---|---|
| New Game | `GMainMenuContent.ts:110` | opens new-game options | Working |
| Continue Game | `:115` | file picker / load save | Working |
| **Duel Mode** | `:120` | `console.log('Duel Mode - (not implemented yet)')` | **Non-functional** |
| **Top Scores** | `:125` | `console.log('Top Scores - (not implemented yet)')` | **Non-functional** |
| **View Glossary** | `:130` | `console.log('View Glossary - (not implemented yet)')` | **Non-functional** |
| **Options** | `:135` | `console.log('Options - (not implemented yet)')` | **Non-functional** |
| Credits | `:140` | switches to credits mode | Working |
| **Exit Game** | `:149` | `console.log('Exit Game - (not implemented yet)')` | **Non-functional** |

**None of these menu entries are changed in this PR.** All 5 are listed as recommended
next steps, pending Ray's confirmation, split below.

### B1. Safe to remove (dead duplicates of features that already exist)

- **View Glossary** and **Options**: these features are fully built and reachable from the
  in-game toolbar (`GUIScene` Glossary and Options buttons). The Main Menu entries are dead
  stubs that just print "(not implemented yet)" and duplicate working screens. They are the
  safest menu items to remove, and could alternatively be wired to the existing screens
  rather than deleted. **Recommended next, pending Ray's confirmation.**

### B2. Keep for now (roadmap placeholders)

- **Duel Mode**, **Top Scores**, **Exit Game**: each is explicitly marked
  "(not implemented yet)", which reads as an intentional roadmap placeholder for a planned
  feature. Removing them is a product decision that is Ray's to make. **Recommend keeping**
  unless Ray wants a leaner menu.

---

# Summary and recommended next steps

This PR removes **only the A1 set (6 image files, ~0.3 MB)**. Everything below is recorded
for Ray to decide on; nothing else was changed.

| Bucket | Files / items | Approx size | This PR | Recommendation |
|---|---|---|---|---|
| A1 Definitely unused | 6 images | ~0.3 MB | **Removed** | done |
| A2 Probably unused (images + audio) | 13 | ~1.2 MB | left in place | remove next, pending Ray's OK |
| A2 JSON dev scaffolding | ~9 | small | left in place | lean keep (authoring tools) |
| Menu: View Glossary, Options | 2 entries | n/a | left in place | safe to remove, pending Ray's OK |
| Menu: Duel Mode, Top Scores, Exit Game | 3 entries | n/a | left in place | keep (roadmap placeholders) |
| Sprites / voices | ~5,400 | large | left in place | keep; needs a dedicated pass |

Asset folder size: ~171 MB in `src/assets` before, ~170.7 MB after this PR's 6-file removal.
