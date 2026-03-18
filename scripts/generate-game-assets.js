// Script to generate PNG image assets for games
// This creates simple colored PNG files with transparency

const fs = require('fs');
const path = require('path');

// PNG file format helpers
function createPNG(width, height, color) {
  // Create a simple PNG with the specified color
  // This is a minimal PNG implementation for solid colors with transparency
  
  const { r, g, b, a } = color;
  
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk (image header)
  const ihdr = createChunk('IHDR', Buffer.concat([
    Buffer.from([
      (width >> 24) & 0xff, (width >> 16) & 0xff, (width >> 8) & 0xff, width & 0xff,
      (height >> 24) & 0xff, (height >> 16) & 0xff, (height >> 8) & 0xff, height & 0xff,
      8, // bit depth
      6, // color type (RGBA)
      0, // compression
      0, // filter
      0  // interlace
    ])
  ]));
  
  // Create image data
  const imageData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    imageData[rowStart] = 0; // filter type: none
    
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 4;
      imageData[pixelStart] = r;
      imageData[pixelStart + 1] = g;
      imageData[pixelStart + 2] = b;
      imageData[pixelStart + 3] = a;
    }
  }
  
  // Compress image data (simplified - just use raw data)
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(imageData);
  
  // IDAT chunk (image data)
  const idat = createChunk('IDAT', compressed);
  
  // IEND chunk (image end)
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = calculateCRC(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function calculateCRC(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc = crc ^ buffer[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0; // Ensure unsigned 32-bit integer
}

// Parse hex color to RGBA
function hexToRGBA(hex, alpha = 255) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, a: alpha };
}

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets', 'games');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate flappy-bird.png (28x28, cyan color #38BDF8)
const birdColor = hexToRGBA('#38BDF8', 255);
const birdPNG = createPNG(28, 28, birdColor);
fs.writeFileSync(path.join(assetsDir, 'flappy-bird.png'), birdPNG);
console.log('✓ Created flappy-bird.png (28x28)');

// Generate snake-food.png (20x20, red color #EF4444)
const foodColor = hexToRGBA('#EF4444', 255);
const foodPNG = createPNG(20, 20, foodColor);
fs.writeFileSync(path.join(assetsDir, 'snake-food.png'), foodPNG);
console.log('✓ Created snake-food.png (20x20)');

console.log('\nGame assets generated successfully!');
