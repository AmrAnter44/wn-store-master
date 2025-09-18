"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 30
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const formVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const inputVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  idle: {
    scale: 1
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.98
  },
  loading: {
    scale: 1,
    opacity: 0.8
  }
};

const errorVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex justify-center items-center h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-80 flex flex-col gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          className="text-xl font-bold text-center"
          variants={formVariants}
        >
          Admin Login
        </motion.h2>

        <motion.input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          required
          variants={inputVariants}
          whileFocus={{
            scale: 1.01,
            borderColor: "#8b5cf6",
            transition: { duration: 0.2 }
          }}
          disabled={loading}
        />

        <motion.input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
          required
          variants={inputVariants}
          whileFocus={{
            scale: 1.01,
            borderColor: "#8b5cf6",
            transition: { duration: 0.2 }
          }}
          disabled={loading}
        />

        <motion.button 
          type="submit"
          className="bg text-white py-2 rounded hover:bg-purple-700"
          variants={buttonVariants}
          initial="idle"
          animate={loading ? "loading" : "idle"}
          whileHover={!loading ? "hover" : {}}
          whileTap={!loading ? "tap" : {}}
          disabled={loading}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={loading ? "loading" : "login"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? "Logging in..." : "Login"}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {error && (
            <motion.p 
              className="text-red-500 text-center"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>
    </motion.div>
  );
}