# Spatial Computing Lab

The site is the Obsidian Canvas HTML export, styled minimally with `site.css`.
The Canvas remains the source of truth for its content, layout, and connections.
Keep the `site.css` link and `site.js` script in the exported `index.html`, and
the `../../site.css` links and back-to-network arrow in exported note pages,
after refreshing the export.
The header's last-edited date uses the browser's `document.lastModified` value.

`site.js` adds smooth, pointer-centered zoom when using trackpad pinch or
scrolling with Cmd/Ctrl held, constrains zoom and panning to the Canvas content,
and hides the header when idle. Drag the board background to pan; Alt-drag
selects a zoom area. Shift-scroll moves horizontally. Links in nodes and the
Content list focus their corresponding node in the network instead of opening a
separate page. The export's zoom buttons, navigation, and connection lines
remain in place.

Node focus is capped to keep previews readable; reset returns to the full map.
Desktop nodes can be repositioned with the move cursor; connected lines and
minimap markers follow. Positions persist across page reloads. Reframe fits the
current layout without changing node positions; Reset restores exported
positions and fits the full map. Drag Navigation by its toolbar button or either
side edge. Group frames have transparent fills, colored borders, and do not
intercept pointer input; connection lines are layered above the frames. Day/night
mode follows local time unless a visitor saves a preference.
The toolbar adapts to mobile with Content, Search, Navigation, and Reframe
controls; Content and Navigation arrows indicate when their panels are open.
On touch screens, two-finger pinching zooms the Canvas directly, nodes are not
draggable, and the minimap can be moved by its larger header. Mobile zoom has a
higher minimum scale to avoid rendering failures in iPhone Safari. At overview
scale, node previews switch to labelled, hatched boxes to stay legible. The lab
model node contains an orbitable 3D preview with white projection screens, a
grey floor, dimension arrows for X/Y/Z, and a schematic subwoofer beside a floor
speaker at the back of the room. Overview node labels and group names scale
gently with zoom. Resizing the page updates the fitted map continuously without
resetting a manually chosen zoom level.
