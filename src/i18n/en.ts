export interface UiCopy {
  nav: {
    work: string;
    research: string;
    log: string;
    about: string;
    github: string;
  };
  header: {
    primaryNavigation: string;
    mobileNavigation: string;
    menu: string;
    closeMenu: string;
    theme: string;
    useLightTheme: string;
    useDarkTheme: string;
  };
  footer: {
    summary: string;
    navigation: string;
    email: string;
    resume: string;
    rss: string;
    copyright: string;
    builtWithAstro: string;
  };
  cta: {
    exploreWork: string;
    readResearch: string;
    viewProject: string;
    readArticle: string;
    backHome: string;
  };
  status: {
    all: string;
    exploring: string;
    researching: string;
    designing: string;
    building: string;
    testing: string;
    active: string;
    paused: string;
    shipped: string;
  };
  language: {
    label: string;
    english: string;
    chinese: string;
    switchToEnglish: string;
    switchToChinese: string;
  };
  editionStatus: {
    eyebrow: string;
    title: string;
    description: string;
    backToEnglish: string;
  };
  common: {
    opensNewTab: string;
    readMore: string;
    updated: string;
  };
}

export const en = {
  nav: {
    work: "Work",
    research: "Research",
    log: "Log",
    about: "About",
    github: "GitHub",
  },
  header: {
    primaryNavigation: "Primary",
    mobileNavigation: "Mobile",
    menu: "Menu",
    closeMenu: "Close menu",
    theme: "Theme",
    useLightTheme: "Use light theme",
    useDarkTheme: "Use dark theme",
  },
  footer: {
    summary:
      "AI product research, agentic development systems and independent software built by Bash.",
    navigation: "Footer",
    email: "Email",
    resume: "Resume",
    rss: "RSS",
    copyright: "All rights reserved.",
    builtWithAstro: "Built with Astro",
  },
  cta: {
    exploreWork: "Explore Work",
    readResearch: "Read Research",
    viewProject: "View project",
    readArticle: "Read article",
    backHome: "Back home",
  },
  status: {
    all: "All",
    exploring: "Exploring",
    researching: "Researching",
    designing: "Designing",
    building: "Building",
    testing: "Testing",
    active: "Active",
    paused: "Paused",
    shipped: "Shipped",
  },
  language: {
    label: "Language",
    english: "English",
    chinese: "中文",
    switchToEnglish: "Switch to English",
    switchToChinese: "切换到中文",
  },
  editionStatus: {
    eyebrow: "Chinese edition",
    title: "The Chinese edition is in preparation.",
    description:
      "Reviewed Chinese content will be published here when it is ready. The English edition remains fully available.",
    backToEnglish: "Visit the English edition",
  },
  common: {
    opensNewTab: "Opens in a new tab",
    readMore: "Read more",
    updated: "Updated",
  },
} satisfies UiCopy;
