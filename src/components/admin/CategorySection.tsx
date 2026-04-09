import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiCheck, FiChevronDown, FiMove, FiEye, FiEyeOff } from "react-icons/fi";
import { db } from "../../firebase";
import { ref, update } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import type { PopupState, Category } from "./types";

interface Props {
  categories: Record<string, Category>;
  setPopup: (popup: PopupState) => void;
  toggleCategoryVisibility: (id: string, current: boolean) => void;
  showNotification: (message: string, type?: "success" | "error") => void;
  newCategoryNameAr: string;
  setNewCategoryNameAr: (val: string) => void;
}

const CategoryCard: React.FC<{
  cat: Category & { id: string };
  editingId: string | null;
  editNameAr: string;
  setEditNameAr: React.Dispatch<React.SetStateAction<string>>;
  saveEdit: (id: string) => void;
  startEditing: (id: string, nameAr: string) => void;
  toggleCategoryVisibility: (id: string, current: boolean) => void;
  setPopup: (popup: PopupState) => void;
}> = ({
  cat,
  editingId,
  editNameAr,
  setEditNameAr,
  saveEdit,
  startEditing,
  toggleCategoryVisibility,
  setPopup,
}) => {

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id: cat.id });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "none",
    };

    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        layout
        className={`
        relative flex items-center gap-3 px-4 py-3
        bg-(--bg-card) rounded-2xl border transition-all duration-300
        ${isDragging ? "z-50 border-primary shadow-2xl scale-[1.02]" : "border-(--border-color) hover:border-primary/20 shadow-sm hover:shadow-md"}
        ${!cat.visible ? "opacity-50 grayscale" : ""}
      `}
      >
        {/* Drag Handle */}
        <div
          {...listeners}
          className="p-1.5 text-(--text-muted) hover:text-primary cursor-grab active:cursor-grabbing transition-colors shrink-0"
        >
          <FiMove size={14} />
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          {editingId === cat.id ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                className="flex-1 px-2 py-1 bg-(--bg-main) border border-primary rounded-lg text-sm font-bold outline-none text-right"
                value={editNameAr}
                onChange={(e) => setEditNameAr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit(cat.id)}
              />
              <button
                onClick={() => saveEdit(cat.id)}
                className="p-1.5 rounded-lg bg-green-500 text-white shrink-0"
              >
                <FiCheck size={13} />
              </button>
            </div>
          ) : (
            <span className="text-sm font-black text-(--text-main) truncate block" title={cat.nameAr}>
              {cat.nameAr}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggleCategoryVisibility(cat.id, cat.visible ?? true)}
            className={`p-1.5 rounded-lg transition-colors ${cat.visible ? "text-green-500 hover:bg-green-50" : "text-red-400 hover:bg-red-50"
              }`}
          >
            {cat.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
          </button>
          <button
            onClick={() => startEditing(cat.id, cat.nameAr)}
            className="p-1.5 text-(--text-muted) hover:text-primary transition-colors rounded-lg"
          >
            <FiEdit size={14} />
          </button>
          <button
            onClick={() => setPopup({ type: "deleteCategory", id: cat.id })}
            className="p-1.5 text-(--text-muted) hover:text-red-500 transition-colors rounded-lg"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </motion.div>
    );
  };

const CategorySection: React.FC<Props> = ({
  categories,
  setPopup,
  toggleCategoryVisibility,
  showNotification,
  newCategoryNameAr,
  setNewCategoryNameAr,
}) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [openCategories, setOpenCategories] = useState(false);

  const startEditing = (id: string, nameAr: string) => {
    setEditingId(id);
    setEditNameAr(nameAr);
  };

  const saveEdit = async (id: string) => {
    if (!editNameAr.trim()) {
      showNotification(t("admin.category_name_required"), "error");
      return;
    }
    try {
      await update(ref(db, `categories/${id}`), { nameAr: editNameAr.trim() });
      setEditingId(null);
      setEditNameAr("");
      showNotification(t("common.success") + " ✅");
    } catch {
      showNotification(t("common.error"), "error");
    }
  };

  const categoriesArray = Object.entries(categories)
    .map(([id, cat]) => ({ ...cat, id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoriesArray.findIndex((c) => c.id === active.id);
    const newIndex = categoriesArray.findIndex((c) => c.id === over.id);
    const newArray = arrayMove(categoriesArray, oldIndex, newIndex);

    const updates: Record<string, any> = {};
    newArray.forEach((cat, index) => {
      updates[`categories/${cat.id}/order`] = index;
    });
    await update(ref(db), updates);
  };

  return (
    <div className="bg-(--bg-card) p-6 sm:p-8 rounded-4xl sm:rounded-[2.5rem] mb-8 border border-(--border-color) shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-primary">{t("admin.categories")}</h2>
          <p className="text-(--text-muted) text-xs sm:text-sm font-medium mt-1">{t("admin.category_desc")}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newCategoryNameAr}
            onChange={(e) => setNewCategoryNameAr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setPopup({ type: "addCategory" })}
            placeholder={t("admin.add_category_placeholder")}
            className="w-full md:w-64 h-12 px-4 rounded-xl bg-(--bg-main) border border-(--border-color) text-sm font-bold outline-none text-right"
          />
          <button
            onClick={() => setPopup({ type: "addCategory" })}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <FiPlus size={24} />
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setOpenCategories((p) => !p)}
        className="w-full mb-2 flex items-center justify-between px-4 sm:px-6 py-4 bg-(--bg-main) rounded-2xl font-black text-sm sm:text-base text-(--text-main) hover:bg-primary/5 hover:text-primary transition-all border border-(--border-color)"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiChevronDown className={`transition-transform duration-300 ${openCategories ? "rotate-180" : ""}`} />
          </span>
          <span>{t("admin.view_all_categories")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest hidden sm:inline">{t("admin.total")}</span>
          <span className="bg-primary text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-lg shadow-lg shadow-primary/20">
            {categoriesArray.length}
          </span>
        </div>
      </button>

      {/* List */}
      <AnimatePresence>
        {openCategories && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={categoriesArray.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2">
                    {categoriesArray.map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        cat={cat}
                        editingId={editingId}
                        editNameAr={editNameAr}
                        setEditNameAr={setEditNameAr}
                        saveEdit={saveEdit}
                        startEditing={startEditing}
                        toggleCategoryVisibility={toggleCategoryVisibility}
                        setPopup={setPopup}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategorySection;