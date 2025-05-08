import { useState } from "react";

interface VisualizationTabsProps {
  activeTab: number;
  onTabChange: (tabIndex: number) => void;
}

export default function VisualizationTabs({ activeTab, onTabChange }: VisualizationTabsProps) {
  const tabs = [
    { id: 1, label: "Salary Insights" },
    { id: 2, label: "Job Distribution" },
    { id: 3, label: "Time Trends" },
  ];

  return (
    <nav className="mb-6">
      <ul className="flex flex-wrap border-b border-gray-200">
        {tabs.map((tab) => (
          <li key={tab.id} className="mr-1">
            <a
              href="#"
              className={`inline-block px-4 py-2 ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary font-medium"
                  : "text-gray-500 hover:text-gray-700 font-medium"
              }`}
              onClick={(e) => {
                e.preventDefault();
                onTabChange(tab.id);
              }}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
