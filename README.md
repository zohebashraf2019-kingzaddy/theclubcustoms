# The Club Customs: Website

Website for **The Club Customs** (Wrap X Print), a vehicle wrap, fleet graphics, print and embroidery shop in Reno, NV. Est. 2017.
Built by [Nexora Digital](https://www.nexoradigital.live).

Static site (HTML/CSS/JS). There is no build step, so it deploys to Vercel as-is.

## Features
- **Wrap Visualizer**: customers upload a photo of their car, tap the paint to select it (magic wand + brush/erase), then preview any color in Gloss, Satin, Matte, Metallic, Chrome, Color Shift or Carbon Fiber. Includes a before/after slider, a download, and "Send this design with my estimate", which attaches the preview to the quote form. Photos are processed in the browser and are never uploaded until the customer submits the form.
- **Fleet Mockup Studio**: businesses upload their logo, pick a cargo van, pickup, box truck or trailer, choose a graphic style and colors, and send the mockup with their quote.
- **Our Work gallery** with filters and a lightbox. **Reels** section with all 4 shop videos.
- **Fleet showcase**, **Services**, **Process**, **FAQ** (13 questions), and a detailed **Estimate form** (services, vehicle, coverage, finish, budget, timeline, file uploads, policy acknowledgement).
- Mobile-first, with a floating "Free Estimate" button, scroll animations and SEO meta tags.

## Before launch: edit `js/config.js`
```js
phone: '',        // shop phone
email: '',        // shop email
address: 'Reno, NV',
mapsUrl: '',
hours: '',
formEndpoint: ''  // Formspree endpoint, see below
```
Empty values are hidden automatically.

### Estimate form delivery
1. Create a free form at https://formspree.io using the shop's email.
2. Paste the endpoint (`https://formspree.io/f/xxxxxxx`) into `formEndpoint`.
3. Every request is emailed to the shop, including the visualizer or fleet design preview. Formspree's file-upload support depends on the plan.

If `formEndpoint` is empty but `email` is set, the form opens the visitor's email app with everything filled in.
If both are empty, the request is copied to the visitor's clipboard and they're pointed to the Instagram DMs.

## Deploy
```bash
git init && git add . && git commit -m "The Club Customs website"
git branch -M main
git remote add origin https://github.com/zohebashraf2019-kingzaddy/theclubcustoms.git
git push -u origin main
```
Then import the repo in Vercel (Framework preset: **Other**, no build command, output directory `.`).

## Structure
```
index.html
css/style.css
js/config.js       <- contact info + form endpoint
js/main.js         <- gallery, reels, lightbox, FAQ, form
js/visualizer.js   <- wrap visualizer
js/fleet.js        <- fleet mockup studio
assets/img/        <- logo + project photos
assets/video/      <- reels (web-compressed) + poster frames
```

To add more work, put the photo in `assets/img/` and add a line to the `GALLERY` list at the top of `js/main.js`. Reels go in `REELS`.
