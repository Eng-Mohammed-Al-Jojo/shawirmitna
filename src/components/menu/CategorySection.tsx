import { useMemo } from "react";
import ItemRow from "./ItemRow";
import type { Category, Item, Subcategory } from "./Menu";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface Props {
  category: Category;
  subcategories: Subcategory[];
  items: Item[];
}

export default function CategorySection({ category, subcategories, items }: Props) {
  const { i18n } = useTranslation();

  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    const noSubItems: Item[] = [];

    items.forEach(item => {
      const sub = subcategories.find(s => s.id === item.subcategoryId);
      if (item.subcategoryId && sub) {
        if (sub.visible === false) return;
        if (!groups[item.subcategoryId]) groups[item.subcategoryId] = [];
        groups[item.subcategoryId].push(item);
      } else {
        noSubItems.push(item);
      }
    });

    return { groups, noSubItems };
  }, [items, subcategories]);

  const activeSubcategories = useMemo(() => {
    return subcategories
      .filter(sub => sub.categoryId === category.id && sub.visible !== false && groupedItems.groups[sub.id])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [category.id, subcategories, groupedItems.groups]);

  // Hide section if no items at all
  if (items.length === 0) return null;

  const catName = category.nameAr || category.name || "";

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className="w-full space-y-10">
      {/* Category Header */}
      <div className="flex items-center gap-4">
        <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(167,10,5,0.3)]" />
        <h2 className="text-3xl font-black text-(--menu-text) tracking-tight">
          {catName}
        </h2>
      </div>

      <div className="space-y-12">
        {/* Main Items (no subcategory) */}
        {groupedItems.noSubItems.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3 sm:gap-6"
          >
            {groupedItems.noSubItems.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                index={idx}
              />
            ))}
          </motion.div>
        )}

        {/* Subcategories */}
        {activeSubcategories.map((sub) => (
          <div key={sub.id} className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-xl bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest border border-secondary/20">
                {i18n.language === 'en' ? (sub.nameEn || sub.nameAr) : sub.nameAr}
              </span>
              <div className="h-px flex-1 bg-primary/10" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-3 sm:gap-6"
            >
              {groupedItems.groups[sub.id].map((item, idx) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={idx}
                />
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}