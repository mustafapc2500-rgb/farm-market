# Farm Market original artwork

These project-specific illustrations were generated using OpenAI's image-generation tool for the Farm Market redesign. No official game screenshots, characters, logos, or third-party photos were supplied as image inputs. The brief requested a distinct sunny farming world, warm materials, colorful fields, and a consistent miniature-farm collection. The user's reference guided the interface's atmosphere rather than being reproduced.

- `farm-world.webp`: original 1536 × 1024 hero scene, including a farmhouse, red barn, trees, flower beds, fences, crops, sheep, chickens, and a duck pond.
- `service-worlds.webp`: original 1536 × 1024 collection of six 512 × 512 scenes, arranged in three columns and two rows.

Atlas mapping (left to right):

| Row    | First                    | Second                   | Third                            |
| ------ | ------------------------ | ------------------------ | -------------------------------- |
| Top    | Cottage / `meadow`       | Farm plan / `plan`       | Orchard consultation / `orchard` |
| Bottom | Flower garden / `garden` | Starter farm / `village` | Autumn sunset / `sunset`         |

`src/components/FarmArt.tsx` selects each scene using a clipped SVG viewport with `preserveAspectRatio="xMidYMid slice"`. Cards, galleries, and categories share one cached artwork download. Each viewport preserves the scene proportions when its frame changes shape. Artwork labels describe the depicted scene in Arabic. The artwork is illustrative sample content, not an image of a delivered client service.

The original generated PNGs were converted to WebP at quality 86 (hero) and 88 (collection), without changing the composition. Together the delivered assets are approximately 1.2 MB. No remote image hosts or font CDNs are required.
