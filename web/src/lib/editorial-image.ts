const EDITORIAL_IMAGE_EXPORT_DENSITY = 2

export function getEditorialImageDisplayDimensions(
  assetWidth: number,
  assetHeight: number,
  density = EDITORIAL_IMAGE_EXPORT_DENSITY
) {
  const safeDensity = Number.isFinite(density) && density > 0 ? density : 1

  return {
    displayWidth: Math.max(1, Math.round(assetWidth / safeDensity)),
    displayHeight: Math.max(1, Math.round(assetHeight / safeDensity)),
  }
}
