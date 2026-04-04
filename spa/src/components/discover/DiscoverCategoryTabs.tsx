import { discoverCategories } from "./discoverData";

export function DiscoverCategoryTabs() {
  return (
    <div className="discover-category-tabs">
      {discoverCategories.map((category, index) => (
        <button
          key={category}
          className={`discover-category-tabs__item ${index === 0 ? "discover-category-tabs__item--active" : ""}`}
          type="button"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
