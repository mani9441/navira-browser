export class CursorService {
  static async inject(view, mode) {
    try {
      const cursorSVG =
        mode === "light"
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
              <path d="M6 4 Q4 4 4 7 L9 27 Q9.5 29 11 29 Q12.5 29 13 27 L18 17 L27 13 Q29 12.5 29 11 Q29 9.5 27 9 L7 4 Q6.5 4 6 4 Z" fill="black"/>
             </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
              <path d="M6 4 Q4 4 4 7 L9 27 Q9.5 29 11 29 Q12.5 29 13 27 L18 17 L27 13 Q29 12.5 29 11 Q29 9.5 27 9 L7 4 Q6.5 4 6 4 Z" fill="white"/>
             </svg>`;

      const encodedSVG = encodeURIComponent(cursorSVG);

      const uniqueCursor = `data:image/svg+xml;utf8,${encodedSVG}#${Date.now()}`;

      await view.executeJavaScript(`
        (() => {
          const existing =
            document.getElementById("__custom_cursor_style");

          if (existing) existing.remove();

          const style = document.createElement("style");

          style.id = "__custom_cursor_style";

          style.textContent = \`
            * {
              cursor: url("${uniqueCursor}") 2 2, auto !important;
            }

            input,
            textarea {
              cursor: text !important;
            }

            button,
            a,
            [role="button"] {
              cursor: pointer !important;
            }
          \`;

          document.head.appendChild(style);
        })();
      `);
    } catch (err) {
      console.log(err);
    }
  }
}