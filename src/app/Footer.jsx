"use client"; // عشان الكومبوننت يشتغل في جهة الكلاينت في Next.js

import { Facebook, Instagram, Mail } from "lucide-react"; 
// استيراد أيقونات من مكتبة lucide-react

export default function Footer() {
  return (
    <footer className="bg text-white p-6 mt-10">
      {/* الـ container الأساسي للـ footer */}
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        
        {/* الجزء الخاص باللوجو / اسم المتجر */}
        <div className="text-lg font-semibold mb-4 md:mb-0">
          © {new Date().getFullYear()} Wn store
          {/* {new Date().getFullYear()} => بيعرض السنة الحالية بشكل ديناميك */}
        </div>

        {/* أيقونات السوشيال ميديا */}
        <div className="flex space-x-6">
          {/* رابط الفيسبوك */}
          <a
            href="https://facebook.com/"
            target="_blank" // يفتح الرابط في تاب جديدة
            rel="noopener noreferrer" // حماية ضد بعض الثغرات
            className="hover:text-blue-400 transition"
          >
            <Facebook size={22} />
          </a>

          {/* رابط الانستجرام */}
          <a
            href="https://www.instagram.com/wn_store_eg_2025/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition"
          >
            <Instagram size={22} />
          </a>

          {/* رابط البريد الإلكتروني */}
          <a
            href="mailto:your@email.com"
            className="hover:text-green-400 transition"
          >
            <Mail size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
}
