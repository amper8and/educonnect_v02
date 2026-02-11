# EduConnect V2.0 - Asset Inventory

## Required Assets from Hub

### Logos
- **MTN EduConnect logo.png** → `/public/assets/logos/mtn_educonnect_logo.png`
  - Usage: Login page main logo
  - Hub file: `MTN EduConnect logo.png`

- **EduConnect_landscape_logo.png** → `/public/assets/logos/educonnect_landscape_logo.png`
  - Usage: Dashboard and Solution Builder top-left
  - Hub file: `EduConnect_landscape_logo.png`

### Images
- **educonnect_hero_image.png** → `/public/assets/images/hero_image.png`
  - Usage: Login page hero/background image
  - Hub file: `educonnect_hero_image.png`

### Solution Type Icons
- **edustudent icon.png** → `/public/assets/icons/edustudent.png`
  - Usage: EduStudent solution type selector
  - Hub file: `edustudent icon.png`

- **eduflex icon.png** → `/public/assets/icons/eduflex.png`
  - Usage: EduFlex solution type selector
  - Hub file: `eduflex icon.png`

- **eduschool icon 2.png** → `/public/assets/icons/eduschool.png`
  - Usage: EduSchool solution type selector
  - Hub file: `eduschool icon 2.png`

- **edusafe icon.png** → `/public/assets/icons/edusafe.png`
  - Usage: EduSafe solution type selector
  - Hub file: `edusafe icon.png`

### Connectivity Icons
- **fibre icon.png** → `/public/assets/icons/fibre.png`
  - Usage: Fibre connectivity product indicator
  - Hub file: `fibre icon.png`

- **fixed wireless icon.png** → `/public/assets/icons/wireless.png`
  - Usage: Wireless connectivity product indicator
  - Hub file: `fixed wireless icon.png`

- **mobile icon.png** → `/public/assets/icons/mobile.png`
  - Usage: Mobile connectivity product indicator
  - Hub file: `mobile icon.png`

### Other Icons
- **person icon.png** → `/public/assets/icons/person.png`
  - Usage: User/person indicator
  - Hub file: `person icon.png`

- **site icon.png** → `/public/assets/icons/site.png`
  - Usage: Site/location indicator
  - Hub file: `site icon.png`

- **folder icon.png** → `/public/assets/icons/folder.png`
  - Usage: Folder/document indicator
  - Hub file: `folder icon.png`

- **asset icon.png** → `/public/assets/icons/asset.png`
  - Usage: Asset/bus indicator
  - Hub file: `asset icon.png`

## Asset Extraction Status

❌ **Direct download from Hub URLs failed** (Backend denied access)

### Current Status:
- **Fonts**: ✅ Successfully downloaded (MTN Brighter Sans - Light, Regular, Bold)
- **Hero Image**: ⚠️ Using gradient fallback (actual image needs manual upload)
- **Logos**: ⚠️ Placeholder paths created (actual files need manual upload)
- **Icons**: ⚠️ Placeholder paths created (actual files need manual upload)

### Action Required:
To use the actual images from Hub files, please:
1. Download images from Hub manually
2. Place in the following locations:
   - `public/assets/images/hero_image.png` - educonnect_hero_image.png
   - `public/assets/logos/mtn_educonnect_logo.png` - MTN EduConnect logo.png
   - `public/assets/logos/educonnect_landscape_logo.png` - EduConnect_landscape_logo.png
   - `public/assets/icons/*.png` - All icon files
3. Rebuild: `npm run build`
4. Restart: `pm2 restart educonnect-v2`

### Temporary Workaround:
- Hero section uses professional gradient background as fallback
- Logos will show broken image icon (can be hidden with CSS)
- Icons will load when files are manually placed

*Last Updated: 2026-02-11*
