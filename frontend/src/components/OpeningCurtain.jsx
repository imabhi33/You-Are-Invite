import { motion } from "framer-motion";

export default function OpeningCurtain({ onOpen }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#230b0b]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <p className="text-xs tracking-[0.45em] text-wedding-gold/70">PERSONALIZED INVITATION</p>
        <h2 className="font-script text-7xl text-wedding-gold">Open Studio</h2>
        <button className="btn mt-4" onClick={onOpen}>Begin</button>
      </motion.div>
    </div>
  );
}