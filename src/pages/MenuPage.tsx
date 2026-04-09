import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Footer from "../components/menu/footer";
import Menu from "../components/menu/Menu";
import LoadingScreen from "../components/common/LoadingScreen";
import { motion } from "framer-motion";

export default function MenuPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-(--menu-bg) text-(--menu-text) font-['Cairo'] relative transition-colors duration-500 overflow-x-hidden">

      {/* Global Loading Screen */}
      <LoadingScreen visible={isLoading} />

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-linear-to-b from-primary/15 to-transparent pointer-events-none" />

      {/* Content */}
      <main className="relative z-10 flex flex-col min-h-screen pb-20">

        {/* Hero Banner Area */}
        <div className="relative w-full h-[45vh] md:h-[55vh] flex flex-col items-center justify-center text-center overflow-visible">
          <div className="relative z-20 space-y-8 px-4 max-w-4xl mx-auto pt-0 sm:pt-1">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1, ease: "backOut" }}
              className="space-y-8"
            >
              {/* Premium Logo Container */}
              <div className="w-32 h-40 md:w-40 md:h-46 p-5 bg-white backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl mx-auto group hover:scale-110 hover:rotate-3 transition-all duration-700 ring-2 ring-white/5">
                <img src="/logo.png" className="w-full h-full object-contain drop-shadow-2xl brightness-110" alt="Logo" />
              </div>

              <div className="space-y-4">
                <motion.h1
                  initial={{ letterSpacing: "0.1em", opacity: 0 }}
                  animate={{ letterSpacing: "0.01em", opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="text-4xl md:text-6xl font-black text-primary drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                >
                  {t("menu.title")}
                </motion.h1>

                <div className="inline-block px-8 py-2.5 mb-4 rounded-full bg-primary/70 backdrop-blur-md border border-primary/30 shadow-2xl">
                  <p className="text-white text-xs md:text-sm font-black tracking-[0.3em] uppercase opacity-90">
                    {t("menu.subtitle")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Menu Component */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8">
          <Menu onLoadingChange={handleLoadingChange} />
        </div>

      </main>

      <Footer />
    </div>
  );
}