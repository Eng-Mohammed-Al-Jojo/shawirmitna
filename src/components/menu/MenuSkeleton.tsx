import { motion } from "framer-motion";

export default function MenuSkeleton() {
  const categories = [1, 2, 3];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Skeleton (Desktop only) */}
      <div className="hidden lg:block w-72 h-screen sticky top-0 bg-(--bg-card)/40 border-r border-(--border-color) p-8 space-y-6">
          <div className="h-10 w-full bg-(--text-muted) opacity-10 rounded-2xl" />
          {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 w-full bg-(--text-muted) opacity-5 rounded-2xl flex items-center gap-3 px-4">
                  <div className="w-6 h-6 rounded-lg bg-(--text-muted) opacity-20" />
                  <div className="h-4 w-1/2 bg-(--text-muted) opacity-20 rounded-full" />
              </div>
          ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 p-6 sm:p-10 space-y-12">
        {/* Mobile Tabs Skeleton */}
        <div className="lg:hidden flex gap-3 overflow-hidden pb-4">
            {[1,2,3,4].map(i => (
                <div key={i} className="h-12 w-32 bg-(--text-muted) opacity-10 rounded-2xl shrink-0" />
            ))}
        </div>

        {/* Categories Sections */}
        {categories.map((cat, i) => (
          <div key={cat} className="space-y-8">
            {/* Section Header */}
            <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-primary opacity-30 rounded-full" />
                <div className="h-8 w-1/3 bg-(--text-muted) opacity-20 rounded-xl" />
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item, j) => (
                <div key={item} className="aspect-square bg-(--bg-card) border border-(--border-color) rounded-4xl relative overflow-hidden flex flex-col p-4 shadow-sm">
                    <div className="flex-1 bg-(--text-muted) opacity-10 rounded-2xl mb-4" />
                    <div className="space-y-3">
                        <div className="h-4 w-3/4 bg-(--text-muted) opacity-20 rounded-full" />
                        <div className="h-3 w-1/2 bg-(--text-muted) opacity-10 rounded-full" />
                    </div>
                     {/* Shimmer Effect */}
                    <motion.div
                        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-(--text-muted)/10 to-transparent z-10"
                        animate={{ translateX: ["-100%", "200%"] }}
                        transition={{ repeat: Infinity, duration: 2, delay: (i * 0.2) + (j * 0.1) }}
                    />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
