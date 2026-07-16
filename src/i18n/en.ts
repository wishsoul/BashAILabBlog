export interface UiCopy {
  brand: string;
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
  breadcrumb: {
    home: string;
  };
  archive: {
    filterByCategory: string;
    allProjectsShown: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    researchAreas: string;
    focusAreas: readonly string[];
    location: string;
    introduction: string;
  };
  metadata: {
    publicationDetails: string;
    minutesRead: string;
    tags: (title: string) => string;
    status: string;
    category: string;
    platform: string;
    role: string;
    year: string;
    started: string;
    projectInformation: string;
  };
  project: {
    featuredWork: string;
    view: string;
    caseStudy: string;
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
  brand: "Bash AI Lab",
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
  breadcrumb: {
    home: "Home",
  },
  archive: {
    filterByCategory: "Filter by category",
    allProjectsShown: "All projects are shown.",
  },
  hero: {
    eyebrow: "Bash AI Lab / Independent Research Practice",
    title: "Building systems that help one person create software with AI.",
    description:
      "I research how AI agents, product systems, and constrained interfaces turn ideas into production-ready software.",
    researchAreas: "Research areas",
    focusAreas: [
      "AI Product Research",
      "Agentic Development",
      "Native Software",
      "Independent Products",
    ],
    location: "Based in Shenzhen / Working globally",
    introduction: "Homepage introduction",
  },
  metadata: {
    publicationDetails: "Publication details",
    minutesRead: "min read",
    tags: (title) => `${title} tags`,
    status: "Status",
    category: "Category",
    platform: "Platform",
    role: "Role",
    year: "Year",
    started: "Started",
    projectInformation: "Project information",
  },
  project: {
    featuredWork: "Featured Work",
    view: "View",
    caseStudy: "Case study",
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
