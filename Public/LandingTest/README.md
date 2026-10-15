# LIFT experimental landing

Open `/Public/LandingTest/index.html` with the project's local server.

This page is an isolated, seven-chapter scroll experience. `index.html` keeps meaningful copy, links, headings, and navigation in semantic HTML. `hero-test.css` gives a real walking photograph a restrained forward-camera motion, and `hero-test.js` runs that motion only while the hero is visible. `full-3d-experience.css` handles the remaining chapter layouts. `full-3d-experience.js` owns one persistent Three.js canvas for the day route, goals, personalization, lifestyle pillars, expert support, and final CTA.

`day-environment.js` builds the architectural Home → Work → Move → Fuel → Recover route. `personalization-scene.js` animates lifestyle input cards into a realistic LIFT phone interface, then reveals workout, nutrition, recovery, and progress modules. The page's copy and three-step flow describe the same cause → result story for accessibility.

The route's walking figure uses Quaternius's existing [Man model](https://graysoft.dev/3d/m/man-fjHyMd5Wxw.html), licensed [CC0](https://creativecommons.org/publicdomain/zero/1.0/). The clothing colors are adjusted for LIFT, while skin and hair materials remain visible. Its included walk clip accompanies one steady 12-second journey from Home to Recover; stage copy and route markers advance as it reaches each stop. The matching Three.js r160 module and loader are kept under `vendor/` for this test page only.

The test hero photograph is [Emma Simpson's morning jog photograph](https://unsplash.com/photos/woman-walking-on-pathway-during-daytime-mNGaaLeWEp0), used under the [Unsplash License](https://unsplash.com/license), and stored locally as `assets/human-walk.jpg`. Photography for the later chapters is local under `experimental-hero/assets`. Existing navbar and footer components remain shared. No production landing files are changed.

The browser falls back to a styled background if WebGL is unavailable. Reduced motion shows the hero photograph without camera movement. The hero motion runs only while it is visible. The Three.js pixel ratio is capped, with a lower cap on mobile, and scene resources are disposed on page exit.
