import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ShieldCheck,
  Star,
  MoreVertical,
} from "lucide-react";

import { browser } from "../browser/BrowserAPI";
import { useBrowserStore } from "../store/browserStore";

export default function Navbar() {
  const tabs = useBrowserStore((s) => s.tabs);
  const activeTabId = useBrowserStore((s) => s.activeTabId);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const navigate = (e) => {
    if (e.key !== "Enter") return;

    let value = e.target.value.trim();

    if (!value.includes(".") || value.includes(" ")) {
      value = `https://www.google.com/search?q=${encodeURIComponent(value)}`;
    } else if (!value.startsWith("http")) {
      value = `https://${value}`;
    }

    browser.page.navigate(activeTabId, value);
  };

  return (
    <div className="control-island">
      <div className="nav-group">
        <button className="nav-btn" onClick={() => browser.page.back()}>
          <ChevronLeft size={20} />
        </button>

        <button className="nav-btn" onClick={() => browser.page.forward()}>
          <ChevronRight size={20} />
        </button>

        <button className="nav-btn" onClick={() => browser.page.reload()}>
          <RotateCw size={18} />
        </button>
      </div>

      <div className="search-bar-glass">
        <ShieldCheck size={16} color="var(--text-dim)" />

        <input
          defaultValue={activeTab?.url}
          onKeyDown={navigate}
          placeholder="Search or enter URL"
        />

        <Star size={16} color="var(--text-dim)" />
      </div>

      <button className="nav-btn">
        <MoreVertical size={20} />
      </button>

      {activeTab?.loading && <div className="loading-bar" />}
    </div>
  );
}
