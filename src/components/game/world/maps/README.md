# Gjeravica tile world

Open `gjeravica-world.json` with Tiled 1.12 or newer. The map uses the external
`gjeravica-tiles.tsj` tileset and its SVG atlas, so every runtime tile has a
matching visual symbol in the editor.

Layers are ordered exactly as they render in the app:

1. `Background vegetation`
2. `Ground`
3. `Path details`
4. `Foreground`
5. `Route` (the avatar's walk height)
6. `Biomes` (hidden editor metadata)

The native app reads this JSON directly. After painting in Tiled, save the map
without changing its layer names. `npm run world:generate` recreates the seeded
version and should only be run when intentionally resetting the map.
