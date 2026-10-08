# Spatial Computing Lab

The site is the Obsidian Canvas HTML export, styled minimally with `site.css`.
The Canvas remains the source of truth for its content, layout, and connections.
Keep the `site.css` link and `site.js` script in the exported `index.html`, and
the `../../site.css` links and back-to-network arrow in exported note pages,
after refreshing the export.
The header's last-edited date uses the browser's `document.lastModified` value.

`site.js` adds animated, pointer-centered zoom when using trackpad pinch or
scrolling with Cmd/Ctrl held, constrains zoom and panning to the Canvas content,
and hides the header when idle. Dragging pans the board; Shift-scroll moves it
horizontally. Links in nodes and the Content list focus their corresponding
node in the network instead of opening a separate page. The export's zoom
buttons, navigation, and connection lines remain in place.
