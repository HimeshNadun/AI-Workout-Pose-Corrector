export default function Footer() {
  return (
      <footer className="mt-16 py-8 text-center text-sm text-gray-400 bg-transparent backdrop-blur-sm border-t border-white/5">
      <p>AI Fitness Trainer © {new Date().getFullYear()}</p>
      <p className="mt-2">Stay consistent. Train smart. Track progress.</p>
    </footer>
  );
}

