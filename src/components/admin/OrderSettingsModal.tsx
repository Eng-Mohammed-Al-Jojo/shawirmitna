import { useState, useEffect } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiSettings, FiInfo, FiSmartphone, FiLayout } from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { useTranslation } from "react-i18next";

/* ================= Toast ================= */
function Toast({ type, message }: { type: "success" | "error"; message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className={`fixed bottom-10 left-1/2 z-100 px-8 py-4 rounded-2xl shadow-2xl text-white font-black flex items-center gap-3 ${type === "success" ? "bg-secondary" : "bg-red-500"}`}
        >
            {type === "success" ? <FiCheck /> : "❌"}
            {message}
        </motion.div>
    );
}

/* ================= Simple Components ================= */
const inputClass = "w-full bg-(--bg-main) border border-(--border-color) rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-(--text-muted)/50";



/* ================= Modal ================= */
export default function OrderSettingsModal({ setShowOrderSettings, orderSettings: initialSettings, onSave }: any) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [orderSystem, setOrderSystem] = useState(true);
    const [inRestaurant, setInRestaurant] = useState(false);
    const [takeaway, setTakeaway] = useState(false);
    const [sendToWhatsApp, setSendToWhatsApp] = useState(true);
    const [saveToDashboard, setSaveToDashboard] = useState(true);
    const [inPhone, setInPhone] = useState("");
    const [outPhone, setOutPhone] = useState("");
    const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");
    const [footer, setFooter] = useState({ address: "", phone: "", whatsapp: "", facebook: "", instagram: "", tiktok: "" });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<any>(null);

    useEffect(() => {
        if (!initialSettings) return;
        setOrderSystem(initialSettings.orderSystem ?? true);
        const s = initialSettings.orderSettings ?? {};
        setInRestaurant(!!s.inRestaurant);
        setTakeaway(!!s.takeaway);
        setSendToWhatsApp(initialSettings.sendToWhatsApp ?? true);
        setSaveToDashboard(initialSettings.saveToDashboard ?? true);
        setInPhone(s.inPhone || "");
        setOutPhone(s.outPhone || "");
        setComplaintsWhatsapp(initialSettings.complaintsWhatsapp || "");
        setFooter(initialSettings.footerInfo || {});
        setLoading(false);
    }, [initialSettings]);

    if (loading) return null;

    const handleSave = async () => {
        console.log("💾 [OrderSettings] Saving settings...", { orderSystem, inRestaurant, takeaway, sendToWhatsApp, saveToDashboard });

        if ((inRestaurant && inPhone.trim() === "") || (takeaway && outPhone.trim() === "")) {
            setToast({ type: "error", message: t('admin.whatsapp_required') });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        const newSettings = {
            orderSystem,
            sendToWhatsApp,
            saveToDashboard,
            orderSettings: { inRestaurant, takeaway, inPhone, outPhone },
            complaintsWhatsapp,
            footerInfo: footer,
        };

        try {
            setSaving(true);
            await update(ref(db, "settings"), newSettings);
            console.log("✅ [OrderSettings] Saved successfully.");
            onSave?.(newSettings);
            setToast({ type: "success", message: t('admin.settings_saved_success') });
            setTimeout(() => setShowOrderSettings(false), 1500);
        } catch (error) {
            console.error("❌ [OrderSettings] Save failed:", error);
            setToast({ type: "error", message: t('admin.settings_save_error') });
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderSettings(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-(--bg-card)/80 backdrop-blur-2xl w-full max-w-lg rounded-[2.5rem] border border-(--border-color) shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10"
            >
                {/* Header */}
                <div className="p-6 border-b border-(--border-color) flex items-center justify-between bg-(--bg-main)/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shadow-inner">
                            <FiSettings />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-(--text-main)">{t('admin.system_settings')}</h2>
                            <p className="text-(--text-muted) text-[10px] uppercase tracking-widest font-bold">{t('admin.system_config_desc')}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowOrderSettings(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-(--bg-main) text-(--text-muted) hover:text-red-500 transition-all border border-(--border-color)">
                        <FiX />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    {/* Complaints */}
                    <div className="p-6 rounded-3xl bg-red-50/50 border border-red-100/50 space-y-4 shadow-sm group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shadow-inner">
                                <FiInfo />
                            </div>
                            <p className="font-black text-sm text-(--text-main)">{t('admin.complaints_whatsapp')}</p>
                        </div>
                        <div className="relative">
                            <FaWhatsapp className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-red-400 opacity-50`} />
                            <input
                                value={complaintsWhatsapp}
                                onChange={(e) => setComplaintsWhatsapp(e.target.value.replace(/\D/g, ""))}
                                placeholder={t('admin.whatsapp_placeholder')}
                                className={`${inputClass} ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                            />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-6 rounded-3xl bg-(--bg-main)/50 border border-(--border-color) space-y-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-(--bg-card) text-primary flex items-center justify-center shadow-inner border border-(--border-color)">
                                <FiLayout />
                            </div>
                            <p className="font-black text-sm text-(--text-main)">{t('admin.footer_info')}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="relative">
                                <FiSmartphone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--text-muted) opacity-50`} />
                                <input placeholder={t('admin.address_detail')} value={footer.address} onChange={(e) => setFooter({ ...footer, address: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`} />
                            </div>
                            <div className="relative">
                                <FiSmartphone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--text-muted) opacity-50`} />
                                <input placeholder={t('admin.primary_phone')} value={footer.phone} onChange={(e) => setFooter({ ...footer, phone: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`} />
                            </div>
                            <div className="relative">
                                <FaWhatsapp className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--text-muted) opacity-50`} />
                                <input placeholder={t('admin.contact_whatsapp')} value={footer.whatsapp} onChange={(e) => setFooter({ ...footer, whatsapp: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <FaFacebook className={`absolute ${isRtl ? 'right-4 text-xs' : 'left-4'} top-1/2 -translate-y-1/2 text-(--text-muted) opacity-50`} />
                                    <input placeholder="Facebook" value={footer.facebook} onChange={(e) => setFooter({ ...footer, facebook: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-2 text-right' : 'pl-10 pr-2 text-left'} text-[10px]`} />
                                </div>
                                <div className="relative">
                                    <FaInstagram className={`absolute ${isRtl ? 'right-4 text-xs' : 'left-4'} top-1/2 -translate-y-1/2 text-(--text-muted) opacity-50`} />
                                    <input placeholder="Instagram" value={footer.instagram} onChange={(e) => setFooter({ ...footer, instagram: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-2 text-right' : 'pl-10 pr-2 text-left'} text-[10px]`} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <FaTiktok className={`absolute ${isRtl ? 'right-4 text-xs' : 'left-4'} top-1/2 -translate-y-1/2 text-(--text-muted) opacity-50`} />
                                    <input placeholder="TikTok" value={footer.tiktok} onChange={(e) => setFooter({ ...footer, tiktok: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-2 text-right' : 'pl-10 pr-2 text-left'} text-[10px]`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Save */}
                <div className="p-6 border-t border-(--border-color) bg-(--bg-main)/30">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full py-4 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 ${saving ? "bg-green-500/50 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 shadow-green-500/20"}`}
                    >
                        {saving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>⚙️</motion.div> : <FiCheck />}
                        <span>{t('admin.save_changes')}</span>
                    </button>
                </div>

                <AnimatePresence>
                    {toast && (
                        <Toast type={toast.type} message={toast.message} />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
