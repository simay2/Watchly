import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-muted-foreground font-body">
          Page {currentStep} of {totalSteps}
        </span>
        <span className="text-2xl">
          {currentStep <= 3 ? "📖" : currentStep <= 6 ? "✏️" : currentStep <= 9 ? "⭐" : "🎬"}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-coral via-primary to-lavender rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i + 1 <= currentStep ? "bg-primary" : "bg-muted"
            }`}
            animate={i + 1 === currentStep ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
