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

            const isVisible = (el) => {
              const style = window.getComputedStyle(el);
              return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                parseFloat(style.opacity) > 0 &&
                el.getBoundingClientRect().width > 0 &&
                el.getBoundingClientRect().height > 0
              );
            };

            const generateSelector = (el) => {
              if (el.id) return \`#\${el.id}\`;
              let selector = el.tagName.toLowerCase();
              if (el.className && typeof el.className === "string") {
                const classes = el.className.split(" ").filter(Boolean).slice(0, 2).join(".");
                if (classes) selector += "." + classes;
              }
              return selector;
            };

            const detectType = (el) => {
              const tag = el.tagName.toLowerCase();
              if (tag === "button") return "button";
              if (tag === "a") return "link";
              if (tag === "textarea") return "textarea";
              if (tag === "select") return "dropdown";
              if (tag === "input") {
                const inputType = el.type?.toLowerCase();
                if (inputType === "submit" || inputType === "button") return "button";
                return inputType || "input";
              }
              return tag;
            };

            // Existing Extractions
            const headings = unique([...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(el => clean(el.innerText)).filter(Boolean));
            const paragraphs = unique([...document.querySelectorAll("p")].map(el => clean(el.innerText)).filter(text => text.length > 40)).slice(0, 100);
            const buttons = [...document.querySelectorAll("button,input[type='button'],input[type='submit']")].map(el => ({ text: clean(el.innerText || el.value) })).filter(b => b.text);
            const links = [...document.querySelectorAll("a[href]")].map(el => ({ text: clean(el.innerText), href: el.href })).filter(l => l.href);
            const forms = [...document.forms].map(f => ({ action: f.action, method: f.method }));
            const images = [...document.querySelectorAll("img")].map(img => ({ alt: clean(img.alt), src: img.src })).filter(img => img.src);
            const tables = [...document.querySelectorAll("table")].map(t => ({ rows: t.rows.length }));

            // NEW EXTRACTIONS
            const codeBlocks = [...document.querySelectorAll("pre, code")].map(el => clean(el.innerText)).filter(Boolean).slice(0, 50);

            const lists = [...document.querySelectorAll("ul, ol")]
              .map(list => ({
                items: [...list.querySelectorAll("li")].map(li => clean(li.innerText)).filter(Boolean).slice(0, 20),
              }))
              .filter(list => list.items.length > 0)
              .slice(0, 30);

            const navigation = [...document.querySelectorAll("nav")]
              .map(nav => ({
                links: [...nav.querySelectorAll("a")].map(a => ({ text: clean(a.innerText), href: a.href })).filter(l => l.text),
              }))
              .filter(nav => nav.links.length > 0);

            const interactiveElements = [...document.querySelectorAll(\`button, a[href], input, textarea, select, [role="button"], [onclick]\`)]
              .map((el, index) => {
                const rect = el.getBoundingClientRect();
                return {
                  id: el.id || \`navira-el-\${index}\`,
                  type: detectType(el),
                  text: clean(el.innerText || el.value || el.placeholder || el.getAttribute("aria-label")),
                  role: el.getAttribute("role") || el.tagName.toLowerCase(),
                  selector: generateSelector(el),
                  visible: isVisible(el),
                  disabled: el.disabled || false,
                  href: el.href || null,
                  placeholder: el.placeholder || null,
                  boundingBox: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
                };
              })
              .filter(el => el.visible && (el.text || el.placeholder || el.href))
              .slice(0, 300);

            return {
              url: location.href,
              title: clean(document.title),
              description: clean(document.querySelector('meta[name="description"]')?.content),
              headings,
              paragraphs,
              buttons,
              links,
              forms,
              tables,
              images,
              codeBlocks,
              lists,
              navigation,
              interactiveElements,
              metadata: { extractedAt: Date.now() },
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
