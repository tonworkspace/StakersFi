import { FC, useState, useEffect } from 'react';
import { FaRocket, FaChartLine, FaUsers, FaGem } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingStep {
  icon: JSX.Element;
  title: string;
  description: string;
}

export const OnboardingScreen: FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);

  const steps: OnboardingStep[] = [
    {
      icon: <FaRocket className="w-8 h-8 text-blue-400" />,
      title: "Welcome to TON Mining",
      description: "Experience the future of decentralized mining with our high-performance platform. Start earning rewards with just a few clicks."
    },
    {
      icon: <FaChartLine className="w-8 h-8 text-green-400" />,
      title: "Smart Mining System",
      description: "Our advanced mining algorithm adapts to your hardware, optimizing for maximum efficiency. Track your hash rate, success rate, and earnings in real-time."
    },
    {
      icon: <FaUsers className="w-8 h-8 text-purple-400" />,
      title: "Multiple Ways to Earn",
      description: "Mine TON, stake your earnings, and participate in our referral program. With our tiered ROI system, your earnings grow as you stay longer."
    },
    {
      icon: <FaGem className="w-8 h-8 text-amber-400" />,
      title: "Premium Features",
      description: "Unlock exclusive features like multiple GPU support, power flow optimization, and enhanced mining efficiency. Upgrade your experience to maximize profits."
    }
  ];

  useEffect(() => {
    if (!user) return;

    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
    if (!hasSeenOnboarding && user.total_deposit === 0) {
      setShouldShow(true);
      // Mark onboarding as seen
      localStorage.setItem(`onboarding_${user.id}`, 'true');
    }

    // Show loading screen
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, [user]);

  useEffect(() => {
    if (loading) return;

    // Start steps rotation only after loading is complete
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
    }, 3000);

    return () => clearInterval(stepInterval);
  }, [loading, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setShouldShow(false);
  };

  if (!user || !shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0F]/95 backdrop-blur-sm">
      <div className="max-w-md w-full px-6">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-spin">
                <div 
                  className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-pulse" 
                  style={{ animationDelay: '-0.5s' }} 
                />
              </div>
            </div>
            <div className="mt-8 text-center">
              <h2 className="text-xl font-semibold text-white">
                {user?.total_deposit === 0 ? 'Welcome to TON Staking' : 'Welcome Back!'}
              </h2>
              <p className="mt-2 text-gray-400">
                {user?.total_deposit === 0 
                  ? 'Setting up your new account...'
                  : 'Loading your dashboard...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={handleSkip}
              className="absolute -top-12 right-0 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip
            </button>
            
            <div key={currentStep} className="text-center animate-fade-in">
              <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                {steps[currentStep].icon}
              </div>
              <h2 className="text-2xl font-bold text-white mt-6 mb-3">
                {steps[currentStep].title}
              </h2>
              <p className="text-base text-gray-300 mb-8">
                {steps[currentStep].description}
              </p>

              {/* Progress bar */}
              <div className="w-full h-1 bg-gray-800 rounded-full mb-8">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentStep === 0
                      ? 'opacity-0 pointer-events-none'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Previous
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    onClick={handleSkip}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Get Started
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 