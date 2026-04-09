import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { Category } from "./Menu";

interface Props {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CategoryNavigation({ categories, activeId, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <div className="relative mb-8 sm:mb-12 overflow-hidden">

      {/* Scroll Container */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 pb-4 snap-x snap-mandatory scroll-smooth overscroll-x-contain">

        <div className="flex items-center gap-2 w-fit">

          {/* زر الكل */}
          <TabButton
            label={t("common.all") || "الكل"}
            isActive={activeId === "all"}
            onClick={() => onSelect("all")}
          />

          {/* الأقسام */}
          {categories.map((cat) => (
            <TabButton
              key={cat.id}
              label={cat.nameAr || cat.name}
              isActive={activeId === cat.id}
              onClick={() => onSelect(cat.id)}
            />
          ))}

        </div>
      </div>

      {/* Gradient Indicators */}
      <div className="absolute top-0 right-0 h-full w-6 bg-linear-to-l from-(--menu-bg) to-transparent pointer-events-none lg:hidden" />
      <div className="absolute top-0 left-0 h-full w-6 bg-linear-to-r from-(--menu-bg) to-transparent pointer-events-none lg:hidden" />
    </div>
  );
}

// ================= TAB BUTTON =================
function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-5 py-3 sm:px-6 sm:py-3 rounded-2xl text-xs font-black transition-all duration-200 snap-start whitespace-nowrap
        ${isActive
          ? "text-white"
          : "text-(--menu-text-muted) bg-(--menu-card-bg)/40 border border-(--menu-border) hover:border-primary/30 hover:text-(--menu-text)"
        }
      `}
    >
      <span className="relative z-10">{label}</span>

      {isActive && (
        <motion.div
          layoutId="activeTabPill"
          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/25"
        />
      )}
    </button>
  );
}