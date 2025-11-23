import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "en";
  });

  const changeLang = (lng: string) => {
    i18n.changeLanguage(lng);
    setLang(lng);
    localStorage.setItem("lang", lng);
  };

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => changeLang("en")}
        className={`px-2 py-1 rounded ${
          lang === "en"
            ? "bg-emerald-500 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        EN
      </button>

      <button
        onClick={() => changeLang("cs")}
        className={`px-2 py-1 rounded ${
          lang === "cs"
            ? "bg-emerald-500 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        CZ
      </button>
    </div>
  );
}
