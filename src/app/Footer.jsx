"use client";

import { Facebook, Instagram, Mail } from "lucide-react"; 
import { motion } from "framer-motion";

const iconVariants = {
  hover: {
    scale: 1.2,
    rotate: 10,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.9
  }
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function Footer() {
  return (
    <motion.footer 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-white p-6 w-full bg"
      style={{

        minHeight: "80px"
      }}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        
        <motion.div 
          variants={itemVariants}
          className="text-lg font-semibold mb-4 md:mb-0 text-white"
        >
          © {new Date().getFullYear()} Wn store
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex space-x-6"
        >
          <motion.a
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            href="https://facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            <Facebook size={22} />
          </motion.a>

          <motion.a
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            href="https://www.instagram.com/wn_store_eg_2025/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-pink-500 transition-colors duration-200"
          >
            <Instagram size={22} />
          </motion.a>

          <motion.a
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            href="mailto:your@email.com"
            className="text-gray-700 hover:text-green-500 transition-colors duration-200"
          >
            <Mail size={22} />
          </motion.a>
        </motion.div>
      </div>
            <p className="text-center ">
        Direct by{" "}
        <a href="https://tamyaz.online/" className="text-black bg">
          Tamyaz
        </a>
      </p>
    </motion.footer>
  );
}