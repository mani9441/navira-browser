export class PageClassifier {
  static classify(extraction) {
    if (!extraction) {
      return {
        type: "unknown",
        confidence: 0,
      };
    }

    const {
      url = "",
      title = "",
      headings = [],
      paragraphs = [],
      buttons = [],
      forms = [],
      interactiveElements = [],
    } = extraction;

    const text = [
      title,
      ...headings,
      ...paragraphs,
      ...buttons.map((b) => b.text),
      ...interactiveElements.map((e) => e.text),
    ]
      .join(" ")
      .toLowerCase();

    /* =========================================
       LOGIN
    ========================================= */

    const loginSignals = [
      "login",
      "sign in",
      "password",
      "email",
      "username",
      "forgot password",
    ];

    const loginMatches = loginSignals.filter((s) => text.includes(s)).length;

    if (loginMatches >= 2 && forms.length > 0) {
      return {
        type: "login",
        confidence: 0.95,
      };
    }

    /* =========================================
       ECOMMERCE
    ========================================= */

    const ecommerceSignals = [
      "buy now",
      "add to cart",
      "wishlist",
      "checkout",
      "price",
      "order",
      "shopping cart",
      "discount",
      "delivery",
    ];

    const ecommerceMatches = ecommerceSignals.filter((s) =>
      text.includes(s),
    ).length;

    if (ecommerceMatches >= 2) {
      return {
        type: "ecommerce",
        confidence: 0.92,
      };
    }

    /* =========================================
       VIDEO
    ========================================= */

    const videoSignals = [
      "watch",
      "subscribe",
      "playlist",
      "channel",
      "video",
      "live",
    ];

    const videoMatches = videoSignals.filter((s) => text.includes(s)).length;

    if (url.includes("youtube") || videoMatches >= 2) {
      return {
        type: "video",
        confidence: 0.94,
      };
    }

    /* =========================================
       DOCUMENTATION
    ========================================= */

    const docsSignals = [
      "api",
      "installation",
      "getting started",
      "reference",
      "sdk",
      "function",
      "class",
      "parameter",
      "example",
    ];

    const docsMatches = docsSignals.filter((s) => text.includes(s)).length;

    if (docsMatches >= 2) {
      return {
        type: "documentation",
        confidence: 0.9,
      };
    }

    /* =========================================
       SOCIAL MEDIA
    ========================================= */

    const socialSignals = [
      "like",
      "comment",
      "share",
      "follow",
      "post",
      "reply",
      "repost",
    ];

    const socialMatches = socialSignals.filter((s) => text.includes(s)).length;

    if (
      socialMatches >= 2 ||
      url.includes("twitter") ||
      url.includes("x.com") ||
      url.includes("instagram") ||
      url.includes("facebook")
    ) {
      return {
        type: "social_media",
        confidence: 0.9,
      };
    }

    /* =========================================
       CHAT
    ========================================= */

    const chatSignals = [
      "send message",
      "message",
      "chat",
      "online",
      "typing",
      "conversation",
    ];

    const chatMatches = chatSignals.filter((s) => text.includes(s)).length;

    if (chatMatches >= 2) {
      return {
        type: "chat",
        confidence: 0.88,
      };
    }

    /* =========================================
       SEARCH RESULTS
    ========================================= */

    if (url.includes("/search") || url.includes("?q=")) {
      return {
        type: "search_results",
        confidence: 0.9,
      };
    }

    /* =========================================
       DASHBOARD
    ========================================= */

    const dashboardSignals = [
      "analytics",
      "dashboard",
      "revenue",
      "statistics",
      "traffic",
      "reports",
      "overview",
    ];

    const dashboardMatches = dashboardSignals.filter((s) =>
      text.includes(s),
    ).length;

    if (dashboardMatches >= 2) {
      return {
        type: "dashboard",
        confidence: 0.88,
      };
    }

    /* =========================================
       ARTICLE
    ========================================= */

    if (paragraphs.length >= 8 && headings.length >= 2) {
      return {
        type: "article",
        confidence: 0.82,
      };
    }

    return {
      type: "generic",
      confidence: 0.5,
    };
  }
}
