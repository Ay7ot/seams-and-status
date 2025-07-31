const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
    const svgPath = path.join(__dirname, '../public/app-icon.svg');
    const iconsDir = path.join(__dirname, '../public/icons');

    // Ensure icons directory exists
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }

    // Icon sizes for PWA
    const sizes = [
        { size: 192, name: 'icon-192x192.png' },
        { size: 512, name: 'icon-512x512.png' },
        { size: 180, name: 'apple-touch-icon.png' }, // Apple touch icon
        { size: 32, name: 'favicon-32x32.png' },
        { size: 16, name: 'favicon-16x16.png' }
    ];

    console.log('Generating icons from SVG...');

    for (const { size, name } of sizes) {
        try {
            await sharp(svgPath)
                .resize(size, size)
                .png()
                .toFile(path.join(iconsDir, name));
            console.log(`✓ Generated ${name} (${size}x${size})`);
        } catch (error) {
            console.error(`✗ Failed to generate ${name}:`, error.message);
        }
    }

    // Generate favicon.ico for app directory (32x32 PNG)
    try {
        await sharp(svgPath)
            .resize(32, 32)
            .png()
            .toFile(path.join(__dirname, '../src/app/favicon.ico'));
        console.log('✓ Generated app/favicon.ico');
    } catch (error) {
        console.error('✗ Failed to generate app/favicon.ico:', error.message);
    }

    console.log('Icon generation complete!');
}

generateIcons().catch(console.error); 