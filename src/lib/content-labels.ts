import type { Locale } from "../config/site";

const labels: Record<Locale, Record<string, string>> = {
  en: {},
  zh: {
    Products: "产品",
    Infrastructure: "基础设施",
    Experiments: "实验",
    Exploring: "探索中",
    Researching: "研究中",
    Designing: "设计中",
    Building: "构建中",
    Testing: "测试中",
    Active: "进行中",
    Paused: "已暂停",
    Shipped: "已发布",
    "Agentic Development": "智能体开发",
    "AI-Native Interfaces": "AI 原生界面",
    "Independent Products": "独立产品",
    "AI Product Management": "AI 产品管理",
    "Human-AI Collaboration": "人机协作",
    Note: "随笔",
    Essay: "文章",
    Research: "研究",
    Experiment: "实验",
    Framework: "框架",
    "Case Study": "案例研究",
    "Build Log": "构建日志",
    "Research Note": "研究笔记",
    Changelog: "更新日志",
    Decision: "决策",
  },
};

export function displayContentLabel(locale: Locale, value: string): string {
  return labels[locale][value] ?? value;
}
