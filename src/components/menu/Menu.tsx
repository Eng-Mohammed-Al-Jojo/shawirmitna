import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import CategorySection from "./CategorySection";
import ItemRow from "./ItemRow";
import MenuSkeleton from "./MenuSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiSearch, FiX } from "react-icons/fi";
import { FaCommentDots } from "react-icons/fa";
import FeedbackModal from "./FeedbackModal";
import CategoryNavigation from "./CategoryNavigation";
import { MenuService } from "../../services/menuService";

/* ================= Types ================= */
export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  available?: boolean;
  order?: number;
  image?: string;
  visible?: boolean;
}

export interface Subcategory {
  id: string;
  nameAr: string;
  nameEn?: string;
  categoryId: string;
  image?: string;
  visible?: boolean;
  order?: number;
}

export interface Item {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  price: number;
  ingredients?: string;
  ingredientsAr?: string;
  ingredientsEn?: string;
  priceTw?: number;
  categoryId: string;
  subcategoryId?: string | null;
  visible?: boolean;
  star?: boolean;
  featured?: boolean;
  image?: string;
  createdAt?: number;
  order?: number;
}

/* ================= Props ================= */
interface Props {
  onLoadingChange?: (loading: boolean) => void;
}

type LoadingPhase = "loading" | "skeleton" | "ready";

const MIN_LOADING_TIME = 2000;
const SKELETON_DURATION = 600;

export default function Menu({ onLoadingChange }: Props) {
  const { t } = useTranslation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [phase, setPhase] = useState<LoadingPhase>("loading");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");

  const isMounted = useRef(true);
  const startTime = useRef(Date.now());

  /* ================= Data Fetching ================= */
  const stableLoadingChange = useRef(onLoadingChange);
  stableLoadingChange.current = onLoadingChange;

  useEffect(() => {
    isMounted.current = true;
    stableLoadingChange.current?.(true);

    let unsubscribe: (() => void) | null = null;

    const loadData = async () => {
      try {
        const { data } = await MenuService.getMenuWithFallback();
        if (!isMounted.current) return;

        setCategories(data.categories);
        setSubcategories(data.subcategories);
        setItems(data.items);

        const elapsed = Date.now() - startTime.current;
        const remainingFetchTime = Math.max(0, MIN_LOADING_TIME - elapsed);

        setTimeout(() => {
          if (!isMounted.current) return;
          stableLoadingChange.current?.(false);
          setPhase("skeleton");

          setTimeout(() => {
            if (isMounted.current) setPhase("ready");
          }, SKELETON_DURATION);
        }, remainingFetchTime);

        unsubscribe = MenuService.subscribeToMenuUpdates((freshData) => {
          if (!isMounted.current) return;
          setCategories(freshData.categories);
          setSubcategories(freshData.subcategories);
          setItems(freshData.items);
        });
      } catch (err) {
        console.error("Menu load failed:", err);
        if (isMounted.current) {
          stableLoadingChange.current?.(false);
          setPhase("ready");
        }
      }
    };

    loadData();
    return () => {
      isMounted.current = false;
      unsubscribe?.();
    };
  }, []);

  /* ================= Derived Data ================= */

  /** All items that are visible */
  const visibleItems = useMemo(
    () => items.filter(i => i.visible !== false),
    [items]
  );

  /** Categories that are available, visible, and have at least one visible item */
  const availableCategories = useMemo(() => {
    return categories
      .filter(cat => {
        if (cat.available === false) return false;
        if (cat.visible === false) return false;
        // Must have at least one visible item
        return visibleItems.some(item => item.categoryId === cat.id);
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [categories, visibleItems]);

  /** Search results — only visible items matching the query */
  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return [];
    return visibleItems.filter((item) => {
      const name = (item.nameAr || item.name || "").toLowerCase();
      const ingredients = (item.ingredientsAr || item.ingredients || "").toLowerCase();
      return name.includes(search) || ingredients.includes(search);
    });
  }, [visibleItems, searchTerm]);

  /** Reset active tab if the selected category is no longer available */
  useEffect(() => {
    if (
      activeCategoryId !== "all" &&
      availableCategories.length > 0 &&
      !availableCategories.some(cat => cat.id === activeCategoryId)
    ) {
      setActiveCategoryId("all");
    }
  }, [availableCategories, activeCategoryId]);

  /** Categories to display based on active tab */
  const displayedCategories = useMemo(() => {
    if (activeCategoryId === "all") return availableCategories;
    return availableCategories.filter(cat => cat.id === activeCategoryId);
  }, [availableCategories, activeCategoryId]);

  /** Whether the menu is truly empty */
  const isEmpty = availableCategories.length === 0;

  /** Clear search */
  const clearSearch = useCallback(() => setSearchTerm(""), []);

  /* ================= Loading ================= */
  if (phase === "loading") return null;

  if (phase === "skeleton") {
    return (
      <div className="menu-wrapper">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 pb-32">
          <MenuSkeleton />
        </motion.div>
      </div>
    );
  }

  /* ================= Ready ================= */
  return (
    <div className="menu-wrapper">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 pb-32"
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-6 opacity-60">🍽️</div>
            <h2 className="text-xl font-black text-(--menu-text) mb-2">
              لا يوجد أصناف بعد
            </h2>
            <p className="text-(--menu-text-muted) text-sm">
              سيتم إضافة الأصناف قريباً
            </p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="flex flex-col mb-8 gap-6">
              <div className="w-full max-w-2xl mx-auto relative group">
                <FiSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-(--menu-text-muted) transition-colors group-focus-within:text-primary" size={18} />
                <input
                  type="text"
                  placeholder={t("common.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-(--menu-search-bg) border border-(--menu-border) rounded-2xl py-4 pr-12 pl-10 text-sm font-bold text-right transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-(--menu-text-muted) placeholder:opacity-50"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-(--menu-border) text-(--menu-text-muted) hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Navigation — hidden during search */}
            {!searchTerm && (
              <CategoryNavigation
                categories={availableCategories}
                activeId={activeCategoryId}
                onSelect={setActiveCategoryId}
              />
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
              {searchTerm ? (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-6">
                      {filteredItems.map((item, idx) => (
                        <ItemRow key={item.id} item={item} index={idx} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="text-5xl mb-4 opacity-50">🔍</div>
                      <p className="text-base font-bold text-(--menu-text-muted)">
                        لا يوجد أصناف بعد
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={activeCategoryId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-12"
                >
                  {displayedCategories.map((cat) => (
                    <CategorySection
                      key={cat.id}
                      category={cat}
                      subcategories={subcategories}
                      items={visibleItems.filter(i => i.categoryId === cat.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Floating Feedback Button */}
        <motion.button
          onClick={() => setShowFeedbackModal(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 transition-shadow duration-300"
        >
          <FaCommentDots size={22} />
        </motion.button>

        <FeedbackModal
          show={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      </motion.div>
    </div>
  );
}