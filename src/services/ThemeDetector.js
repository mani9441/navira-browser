export class ThemeDetector {
  static async detect(view) {
    try {
      const brightness = await view.executeJavaScript(`
        (() => {
          function getBrightness(rgbString) {
            const rgb = rgbString.match(/\\d+/g);

            if (!rgb) return 0;

            const [r, g, b] = rgb.map(Number);

            return (r * 299 + g * 587 + b * 114) / 1000;
          }

          const bodyBg =
            getComputedStyle(document.body).backgroundColor;

          const htmlBg =
            getComputedStyle(document.documentElement).backgroundColor;

          const bodyBrightness = getBrightness(bodyBg);
          const htmlBrightness = getBrightness(htmlBg);

          return Math.max(bodyBrightness, htmlBrightness);
        })();
      `);

      return brightness > 150 ? "light" : "dark";
    } catch {
      return "dark";
    }
  }
}