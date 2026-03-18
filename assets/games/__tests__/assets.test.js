// Unit tests for game image assets
// Feature: game-image-assets

const fs = require('fs');
const path = require('path');

describe('Game Image Assets', () => {
  describe('Asset Directory Structure', () => {
    it('should have assets/games directory', () => {
      const assetsDir = path.join(__dirname, '..');
      expect(fs.existsSync(assetsDir)).toBe(true);
    });
  });

  describe('Flappy Bird Asset', () => {
    const assetPath = path.join(__dirname, '..', 'flappy-bird.png');

    it('should exist', () => {
      expect(fs.existsSync(assetPath)).toBe(true);
    });

    it('should be a PNG file', () => {
      const buffer = fs.readFileSync(assetPath);
      // PNG signature: 137 80 78 71 13 10 26 10
      expect(buffer[0]).toBe(137);
      expect(buffer[1]).toBe(80);
      expect(buffer[2]).toBe(78);
      expect(buffer[3]).toBe(71);
    });

    it('should have reasonable dimensions for game rendering', () => {
      const buffer = fs.readFileSync(assetPath);
      // IHDR chunk starts at byte 16
      // Width is bytes 16-19, height is bytes 20-23
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      
      // Accept any reasonable size (will be scaled to 28x28 by React Native)
      expect(width).toBeGreaterThanOrEqual(28);
      expect(width).toBeLessThanOrEqual(2048);
      expect(height).toBeGreaterThanOrEqual(28);
      expect(height).toBeLessThanOrEqual(2048);
    });

    it('should use RGBA color type (with transparency support)', () => {
      const buffer = fs.readFileSync(assetPath);
      // Color type is at byte 25 in IHDR chunk
      // 6 = RGBA (truecolor with alpha)
      const colorType = buffer[25];
      expect(colorType).toBe(6);
    });
  });

  describe('Snake Food Asset', () => {
    const assetPath = path.join(__dirname, '..', 'snake-food.png');

    it('should exist', () => {
      expect(fs.existsSync(assetPath)).toBe(true);
    });

    it('should be a PNG file', () => {
      const buffer = fs.readFileSync(assetPath);
      // PNG signature: 137 80 78 71 13 10 26 10
      expect(buffer[0]).toBe(137);
      expect(buffer[1]).toBe(80);
      expect(buffer[2]).toBe(78);
      expect(buffer[3]).toBe(71);
    });

    it('should have reasonable dimensions for game rendering', () => {
      const buffer = fs.readFileSync(assetPath);
      // IHDR chunk starts at byte 16
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      
      // Accept any reasonable size (will be scaled to CELL-2 by React Native)
      expect(width).toBeGreaterThanOrEqual(20);
      expect(width).toBeLessThanOrEqual(2048);
      expect(height).toBeGreaterThanOrEqual(20);
      expect(height).toBeLessThanOrEqual(2048);
    });

    it('should use RGBA color type (with transparency support)', () => {
      const buffer = fs.readFileSync(assetPath);
      // Color type is at byte 25 in IHDR chunk
      const colorType = buffer[25];
      expect(colorType).toBe(6);
    });
  });

  describe('Asset Requirements Validation', () => {
    it('should have reasonable dimensions for mobile rendering (Requirement 1.2)', () => {
      const birdPath = path.join(__dirname, '..', 'flappy-bird.png');
      const foodPath = path.join(__dirname, '..', 'snake-food.png');
      
      const birdBuffer = fs.readFileSync(birdPath);
      const foodBuffer = fs.readFileSync(foodPath);
      
      const birdWidth = birdBuffer.readUInt32BE(16);
      const birdHeight = birdBuffer.readUInt32BE(20);
      const foodWidth = foodBuffer.readUInt32BE(16);
      const foodHeight = foodBuffer.readUInt32BE(20);
      
      // Check bird dimensions - accept any reasonable size
      expect(birdWidth).toBeGreaterThanOrEqual(28);
      expect(birdWidth).toBeLessThanOrEqual(2048);
      expect(birdHeight).toBeGreaterThanOrEqual(28);
      expect(birdHeight).toBeLessThanOrEqual(2048);
      
      // Check food dimensions - accept any reasonable size
      expect(foodWidth).toBeGreaterThanOrEqual(20);
      expect(foodWidth).toBeLessThanOrEqual(2048);
      expect(foodHeight).toBeGreaterThanOrEqual(20);
      expect(foodHeight).toBeLessThanOrEqual(2048);
    });

    it('should be stored in assets/games directory (Requirement 1.4)', () => {
      const birdPath = path.join(__dirname, '..', 'flappy-bird.png');
      const foodPath = path.join(__dirname, '..', 'snake-food.png');
      
      // Normalize paths for cross-platform compatibility
      const normalizedBirdPath = birdPath.replace(/\\/g, '/');
      const normalizedFoodPath = foodPath.replace(/\\/g, '/');
      
      expect(normalizedBirdPath).toContain('assets/games');
      expect(normalizedFoodPath).toContain('assets/games');
      expect(fs.existsSync(birdPath)).toBe(true);
      expect(fs.existsSync(foodPath)).toBe(true);
    });
  });
});
