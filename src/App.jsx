import { useEffect } from "react";

import "./index.css";

import { useBrowserStore } from "./store/browserStore";

import { browser } from "./browser/BrowserAPI";

import TabBar from "./components/TabBar";
import Navbar from "./components/Navbar";
import WebviewContainer from "./components/WebviewContainer";

import { ProfileManager } from "./browser/ProfileManager";

import { StorageService } from "./services/StorageService";

export default function App() {
  const isLoaded = useBrowserStore((s) => s.isLoaded);

  const themeMode = useBrowserStore((s) => s.themeMode);

  const setTabs = useBrowserStore((s) => s.setTabs);

  const setProfiles = useBrowserStore((s) => s.setProfiles);

  const setActiveProfile = useBrowserStore((s) => s.setActiveProfile);

  const setActiveTab = useBrowserStore((s) => s.setActiveTab);

  const setLoaded = useBrowserStore((s) => s.setLoaded);

  useEffect(() => {
    const init = async () => {
      let profiles = await ProfileManager.getAll();

      if (!profiles || profiles.length === 0) {
        const personal = await ProfileManager.create("Personal");

        profiles = [personal];
      }

      setProfiles(profiles);

      setActiveProfile(profiles[0]);

      const savedTabs = await StorageService.loadTabs();

      if (savedTabs && savedTabs.length > 0) {
        const mapped = savedTabs.map((t) => ({
          id: t.id,
          profileId: t.profile_id,

          partition: t.partition_name,

          url: t.url,
          title: t.title,
          favicon: t.favicon,

          loading: false,

          createdAt: t.created_at,
        }));

        setTabs(mapped);

        const active = savedTabs.find((t) => t.is_active === 1);

        setActiveTab(active?.id || mapped[0].id);
      } else {
        browser.tabs.create();
      }

      setLoaded(true);
    };

    init();
  }, []);

  if (!isLoaded) {
    return <div className="loading-screen" />;
  }

  return (
    <div className="window-shell">
      <div
        className={`main-wrapper ${
          themeMode === "light" ? "theme-light" : "theme-dark"
        }`}
      >
        <TabBar />

        <Navbar />

        <WebviewContainer />
      </div>
    </div>
  );
}
