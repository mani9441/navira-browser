import { EmptyPageSchema } from "./ExtractionSchemas";

export class DOMExtractor {
  static async extract(webview) {
    try {
      const result = await webview.executeJavaScript(`
          (() => {
            const clean = (text) => {
              return text
                ?.replace(/\\s+/g, " ")
                ?.trim() || "";
            };

            const unique = (arr) => {
              return [...new Set(arr)];
            };

            const headings =
              unique(
                [...document.querySelectorAll(
                  "h1,h2,h3,h4,h5,h6"
                )]
                  .map((el) =>
                    clean(el.innerText)
                  )
                  .filter(Boolean)
              );

            const paragraphs =
              unique(
                [...document.querySelectorAll("p")]
                  .map((el) =>
                    clean(el.innerText)
                  )
                  .filter(
                    (text) =>
                      text.length > 40
                  )
              ).slice(0, 100);

            const buttons =
              [...document.querySelectorAll(
                "button,input[type='button'],input[type='submit']"
              )]
                .map((el) => ({
                  text: clean(
                    el.innerText ||
                    el.value
                  ),
                }))
                .filter(
                  (button) =>
                    button.text
                );

            const links =
              [...document.querySelectorAll(
                "a[href]"
              )]
                .map((el) => ({
                  text: clean(
                    el.innerText
                  ),

                  href: el.href,
                }))
                .filter(
                  (link) =>
                    link.href
                );

            const forms =
              [...document.forms]
                .map((form) => ({
                  action:
                    form.action,

                  method:
                    form.method,
                }));

            const images =
              [...document.querySelectorAll(
                "img"
              )]
                .map((img) => ({
                  alt: clean(img.alt),

                  src: img.src,
                }))
                .filter(
                  (img) =>
                    img.src
                );

            const tables =
              [...document.querySelectorAll(
                "table"
              )]
                .map((table) => ({
                  rows:
                    table.rows.length,
                }));

            const interactiveElements =
              [...document.querySelectorAll(
                "button, a, input, textarea, select"
              )]
                .map((el, index) => ({
                  id:
                    el.id ||
                    \`navira-el-\${index}\`,

                  text: clean(
                    el.innerText ||
                    el.value ||
                    el.placeholder
                  ),

                  role:
                    el.getAttribute(
                      "role"
                    ) ||
                    el.tagName.toLowerCase(),

                  selector:
                    el.tagName.toLowerCase() +
                    (el.id
                      ? "#" + el.id
                      : ""),
                }))
                .filter(
                  (el) =>
                    el.text ||
                    el.selector
                );

            return {
              url: location.href,

              title: clean(
                document.title
              ),

              description: clean(
                document.querySelector(
                  'meta[name="description"]'
                )?.content
              ),

              headings,

              paragraphs,

              buttons,

              links,

              forms,

              tables,

              images,

              interactiveElements,

              metadata: {
                extractedAt:
                  Date.now(),
              },
            };
          })();
        `);

      return {
        ...EmptyPageSchema,
        ...result,
      };
    } catch (error) {
      console.error("[DOMExtractor]", error);

      return EmptyPageSchema;
    }
  }
}
