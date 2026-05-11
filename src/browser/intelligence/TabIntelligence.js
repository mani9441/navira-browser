export class TabIntelligence {
  static analyze(tab, allTabs = []) {
    const extraction = tab.extraction || {};

    const classification = tab.classification || {};

    const url = tab.url || "";

    const title = tab.title || "";

    const domain = this.extractDomain(url);

    const keywords = this.extractKeywords({
      title,
      extraction,
    });

    const topic = this.detectTopic({
      classification,
      keywords,
      title,
    });

    const summary = this.generateSummary({
      title,
      extraction,
      classification,
    });

    const duplicateTabs = this.findDuplicateTabs(tab, allTabs);

    const relatedTabs = this.findRelatedTabs(tab, allTabs);

    const group = this.detectGroup({
      topic,
      classification,
      domain,
    });

    return {
      domain,

      topic,

      summary,

      keywords,

      duplicateTabs,

      relatedTabs,

      group,
    };
  }

  /* =========================================
     DOMAIN
  ========================================= */

  static extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  }

  /* =========================================
     KEYWORDS
  ========================================= */

  static extractKeywords({ title, extraction }) {
    const text = [
      title,

      ...(extraction.headings || []),

      ...(extraction.paragraphs || []).slice(0, 10),
    ]
      .join(" ")
      .toLowerCase();

    const words = text.match(/\b[a-z]{4,20}\b/g) || [];

    const frequency = {};

    for (const word of words) {
      if (this.isStopWord(word)) {
        continue;
      }

      frequency[word] = (frequency[word] || 0) + 1;
    }

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);
  }

  static isStopWord(word) {
    const stopWords = [
      "this",
      "that",
      "with",
      "from",
      "have",
      "your",
      "about",
      "there",
      "their",
      "which",
      "would",
      "could",
      "should",
      "into",
      "after",
      "before",
      "while",
      "where",
      "when",
      "what",
      "will",
      "been",
      "them",
      "they",
      "then",
      "than",
    ];

    return stopWords.includes(word);
  }

  /* =========================================
     TOPIC DETECTION
  ========================================= */

  static detectTopic({ classification, keywords, title }) {
    if (classification.type === "ecommerce") {
      return "shopping";
    }

    if (classification.type === "documentation") {
      return "development";
    }

    if (classification.type === "video") {
      return "media";
    }

    if (classification.type === "article") {
      return "research";
    }

    if (classification.type === "social_media") {
      return "social";
    }

    const joined = [title, ...keywords].join(" ").toLowerCase();

    if (
      joined.includes("laptop") ||
      joined.includes("iphone") ||
      joined.includes("price")
    ) {
      return "shopping";
    }

    if (
      joined.includes("react") ||
      joined.includes("javascript") ||
      joined.includes("api")
    ) {
      return "development";
    }

    return "general";
  }

  /* =========================================
     SUMMARY
  ========================================= */

  static generateSummary({ title, extraction, classification }) {
    const firstHeading = extraction.headings?.[0];

    const firstParagraph = extraction.paragraphs?.[0];

    const type = classification.type || "generic";

    return [
      `${title}`,

      firstHeading ? `• ${firstHeading}` : null,

      firstParagraph ? `• ${firstParagraph.slice(0, 180)}` : null,

      `• Page Type: ${type}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  /* =========================================
     DUPLICATES
  ========================================= */

  static findDuplicateTabs(currentTab, allTabs) {
    return allTabs
      .filter((tab) => {
        if (tab.id === currentTab.id) {
          return false;
        }

        return tab.url === currentTab.url;
      })
      .map((tab) => tab.id);
  }

  /* =========================================
     RELATED TABS
  ========================================= */

  static findRelatedTabs(currentTab, allTabs) {
    const currentKeywords =
      currentTab?.intelligence?.keywords ||
      this.extractKeywords({
        title: currentTab.title,

        extraction: currentTab.extraction || {},
      });

    return allTabs
      .filter((tab) => {
        if (tab.id === currentTab.id) {
          return false;
        }

        const otherKeywords = this.extractKeywords({
          title: tab.title,

          extraction: tab.extraction || {},
        });

        const overlap = currentKeywords.filter((k) =>
          otherKeywords.includes(k),
        );

        return overlap.length >= 3;
      })
      .map((tab) => ({
        id: tab.id,

        title: tab.title,

        url: tab.url,
      }))
      .slice(0, 10);
  }

  /* =========================================
     GROUPING
  ========================================= */

  static detectGroup({ topic, classification, domain }) {
    if (topic === "shopping") {
      return "Shopping";
    }

    if (topic === "development") {
      return "Development";
    }

    if (topic === "research") {
      return "Research";
    }

    if (topic === "media") {
      return "Media";
    }

    if (domain.includes("github")) {
      return "Development";
    }

    if (domain.includes("youtube")) {
      return "Media";
    }

    return "General";
  }
}
