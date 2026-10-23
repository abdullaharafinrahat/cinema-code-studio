export interface SafeZonePadding {
  topPx: number;
  bottomPx: number;
  leftPx: number;
  rightPx: number;
  opticalCenterY: number;
}

/**
 * Computes aspect-aware safe zones protecting typography & focal elements
 * from TikTok/Reels/Shorts UI chrome on 9:16 and broadcast overscan on 16:9.
 */
export function getSafeZone(width: number, height: number): SafeZonePadding {
  const isVertical = height > width;
  if (isVertical) {
    return {
      topPx: Math.round(height * 0.12),
      bottomPx: Math.round(height * 0.22),
      leftPx: Math.round(width * 0.08),
      rightPx: Math.round(width * 0.14), // Clears right-rail social buttons
      opticalCenterY: Math.round(height * 0.44),
    };
  }
  return {
    topPx: Math.round(height * 0.09),
    bottomPx: Math.round(height * 0.11),
    leftPx: Math.round(width * 0.08),
    rightPx: Math.round(width * 0.08),
    opticalCenterY: Math.round(height * 0.47),
  };
}
