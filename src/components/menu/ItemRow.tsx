import { memo } from "react";
import { type Item } from "./Menu";
import { FaFire } from "react-icons/fa";
import { motion } from "framer-motion";

interface Props {
  item: Item;
  index?: number;
}

const ItemRow = memo(({ item, index = 0 }: Props) => {
  const prices = String(item.price).split(",");
  const basePrice = Number(prices[0]);

  const itemName = item.nameAr || item.name || "";
  const itemIngredients = item.ingredientsAr || item.ingredients || "";
  const isFeatured = item.star || item.featured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 10) * 0.05 }}
      className="relative flex flex-col h-full bg-(--bg-card) rounded-3xl border-2 border-(--border-color) p-4 gap-3 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 active:scale-95 cursor-pointer"
    >
      {/* Header: Name + Featured badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-black text-(--text-main) leading-snug flex-1 line-clamp-2">
          {itemName}
        </h3>
        {isFeatured && (
          <span className="shrink-0 w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md animate-pulse">
            <FaFire size={13} />
          </span>
        )}
      </div>

      {/* Ingredients */}
      {itemIngredients ? (
        <p className="text-[11px] font-medium text-(--text-muted) leading-relaxed line-clamp-2 opacity-70 flex-1">
          {itemIngredients}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      {/* Footer: Price */}
      <div className="flex items-center justify-between pt-3 border-t border-(--border-color)/30">
        <div className="flex flex-col gap-0.5">
          {prices.length === 1 ? (
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-black text-primary">{basePrice}</span>
              <small className="text-[10px] opacity-60 font-bold text-primary">₪</small>
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {prices.map((price, i) => (
                <div key={i} className="flex items-baseline gap-0.5">
                  <span className="text-sm font-black text-primary">{Number(price)}</span>
                  <small className="text-[10px] opacity-60 font-bold text-primary">₪</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default ItemRow;