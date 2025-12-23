import { motion } from "framer-motion";

export default function FeedbackCard({ feedback }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 bg-blue-700 p-4 rounded-xl text-center shadow-lg"
    >
      <p className="text-xl font-semibold">{feedback}</p>
    </motion.div>
  );
}
