import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function LoadingBoard() {
  return (
    <div className="w-full max-auto py-24 text-center">
      <div className="relative w-32 h-32 mx-auto mb-12">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[0.5px] border-primary/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute inset-6 border-[0.5px] border-primary/10 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-primary/40"
          >
            <Sparkles className="w-8 h-8 stroke-[1px]" />
          </motion.div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-display text-2xl font-light text-primary/80 mb-3 tracking-wide">
          Consulting the Ancestors
        </h3>
        <p className="text-muted-foreground/60 max-w-sm mx-auto font-light italic text-sm">
          "Patience is the companion of wisdom."
        </p>
      </motion.div>
    </div>
  );
}
