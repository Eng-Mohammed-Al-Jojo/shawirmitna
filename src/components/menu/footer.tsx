import {
  FaLaptopCode,
  FaMapMarkerAlt,
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
  FaPhoneAlt,
  FaTelegramPlane,
  FaTiktok,
  FaCommentDots,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { useTranslation } from "react-i18next";
import FeedbackModal from "../menu/FeedbackModal";

const LOCAL_STORAGE_KEY = "footerInfo";

export default function Footer() {

  const { t } = useTranslation();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");

  const [footer, setFooter] = useState({
    address: "",
    phone: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    telegram: "",
  });


  useEffect(() => {
    /* ===== footerInfo ===== */
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) setFooter(JSON.parse(localData));

    const footerRef = ref(db, "settings/footerInfo");
    const unsubFooter = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFooter(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
    });

    /* ===== complaintsWhatsapp ===== */
    const complaintsRef = ref(db, "settings/complaintsWhatsapp");
    const unsubComplaints = onValue(complaintsRef, (snapshot) => {
      const value = snapshot.val();
      setComplaintsWhatsapp(value ? String(value).trim() : "");
    });

    return () => {
      unsubFooter();
      unsubComplaints();
    };
  }, []);

  /* ===== Social Icons ===== */
  const socialIcons: { Icon: any; url: string | undefined }[] = [
    {
      Icon: FaWhatsapp,
      url: footer.whatsapp
        ? `https://wa.me/${footer.whatsapp}`
        : undefined,
    },
    { Icon: FaInstagram, url: footer.instagram || undefined },
    { Icon: FaFacebookF, url: footer.facebook || undefined },
    { Icon: FaTiktok, url: footer.tiktok || undefined },
    { Icon: FaTelegramPlane, url: footer.telegram || undefined },
  ];

  return (
    <footer className="w-full bg-(--menu-card-bg)/40 backdrop-blur-md border-t border-(--menu-border) py-12 px-6 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
        {/* Contact info Row */}
        <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-(--menu-text)">
          {footer.address && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary" />
              <span className="text-primary">{footer.address}</span>
            </div>
          )}
          {footer.phone && (
            <a href={`tel:${footer.phone}`} className="flex items-center gap-2 hover:text-(--menu-primary) transition-colors">
              <FaPhoneAlt className="text-primary" />
              <span>{footer.phone}</span>
            </a>
          )}
        </div>

        {/* Social Icons */}
        <div className="flex gap-4">
          {socialIcons.map(({ Icon, url }, i) => url && (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-(--menu-bg) border border-(--menu-border) text-primary hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg">
              <Icon size={18} />
            </a>
          ))}
        </div>

        {/* Feedback Button */}
        {complaintsWhatsapp !== "" && (
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-(--menu-primary) text-white font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <FaCommentDots />
            <span>{t('admin.feedback')}</span>
          </button>
        )}

        {/* Developer Signature - Creative & Iconic */}
        <div className="pt-8 border-t border-(--menu-border) w-full flex flex-col items-center gap-3">

          {/* Developer Link */}
          <a
            href="https://engmohammedaljojo.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-2 hover:bg-(--menu-card-bg)/80 rounded-lg transition-all duration-300 hover:scale-105"
          >
            {/* Icon with gradient */}
            <div className="p-2 rounded-full bg-linear-to-tr from-(--menu-primary) to-(--menu-secondary) text-primary shadow-md group-hover:scale-110 transition-transform duration-300">
              <FaLaptopCode size={20} />
            </div>

            {/* Developer Text */}
            <div className="text-xs font-extrabold uppercase tracking-widest text-center text-(--menu-text) group-hover:text-(--menu-primary) transition-colors">
              Developed by <span className="text-(--menu-primary)">Eng. Mohammed El Joujo</span>
            </div>
          </a>

          {/* Copyright */}
          <p className="text-[10px] text-(--menu-text-muted) font-bold opacity-80">
            © {new Date().getFullYear()} All Rights Reserved
          </p>

        </div>
      </div>

      {complaintsWhatsapp !== "" && (
        <FeedbackModal
          show={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </footer>
  );
}
