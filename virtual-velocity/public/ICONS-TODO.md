# App Icons - Generation Instructions

The following PNG icon files need to be generated from `favicon.svg`:

## Required Icon Sizes

### Standard Icons
- **favicon.ico** - 32x32px (multi-size .ico file containing 16x16, 32x32, 48x48)
- **icon-192.png** - 192x192px (for Android/Chrome)
- **icon-512.png** - 512x512px (for Android/Chrome large)
- **apple-touch-icon.png** - 180x180px (for iOS devices)

## Generation Methods

### Option 1: Using Online Tool (Recommended)
1. Visit https://realfavicongenerator.net/
2. Upload `favicon.svg`
3. Configure settings:
   - **iOS**: Use the leaf icon with sage green background
   - **Android Chrome**: Use the leaf icon with transparent background
   - **Windows Metro**: Sage green background (#657a52)
   - **macOS Safari**: Enable pinned tab icon
4. Download and extract the generated icons to `/public/` folder

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first: https://imagemagick.org/

# Generate from SVG
magick convert -background none favicon.svg -resize 192x192 icon-192.png
magick convert -background none favicon.svg -resize 512x512 icon-512.png
magick convert -background none favicon.svg -resize 180x180 apple-touch-icon.png

# Generate multi-size favicon.ico
magick convert favicon.svg -define icon:auto-resize=16,32,48 favicon.ico
```

### Option 3: Using Figma/Design Tool
1. Open `favicon.svg` in Figma or similar design tool
2. Export as PNG at the following sizes:
   - 192x192px → `icon-192.png`
   - 512x512px → `icon-512.png`
   - 180x180px → `apple-touch-icon.png`
3. For `favicon.ico`, use a tool like https://icoconvert.com/

## Design Specifications

**Color Palette:**
- Primary: Sage Green (#657a52)
- Gradient Start: #7a9063
- Gradient End: #657a52
- Accent: Earth Orange (#d8915b)
- Light: Warm White (#f6f7f3)

**Design Elements:**
- Leaf shape representing holistic wellness
- Meridian lines (leaf veins) symbolizing acupuncture pathways
- Three accent dots representing acupuncture points
- Gradient from top to bottom for depth

## Browser/Platform Testing

After generating icons, test on:
- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & iOS)
- [ ] Firefox
- [ ] Edge
- [ ] Android Chrome (home screen add)
- [ ] iOS Safari (home screen add)

## File Checklist

- [ ] favicon.svg ✅ (Already created)
- [ ] favicon.ico (32x32, multi-size)
- [ ] icon-192.png (192x192)
- [ ] icon-512.png (512x512)
- [ ] apple-touch-icon.png (180x180)
- [ ] site.webmanifest ✅ (Already created)

## Notes

- All PNG icons should have transparent backgrounds except where noted
- Ensure icons are optimized for file size (use tools like TinyPNG)
- Test the appearance on both light and dark backgrounds
- The SVG favicon will automatically adapt to dark mode via CSS

---

**Priority:** High - Required before production deployment
**Estimated Time:** 30 minutes
