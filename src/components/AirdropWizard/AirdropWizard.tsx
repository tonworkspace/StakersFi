import React, { useState, useEffect } from 'react';
import { getUserSBTBalance } from '@/lib/tokenSystem';

interface AirdropWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: AirdropFormData) => Promise<void>;
  userAddress: string;
  hasAlreadyRegistered?: boolean;
}

interface AirdropFormData {
  email: string;
  telegram: string;
  twitter: string;
  walletAddress: string;
  stknAmount: string;
  socialConnections: {
    telegram: boolean;
    twitter: boolean;
    telegramChannel: boolean;
  };
}

interface FormErrors {
  email?: string;
  telegram?: string;
  twitter?: string;
  walletAddress?: string;
  stknAmount?: string;
  socialConnections?: string;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Welcome! 🎉",
    description: "Join our community and get ready for exclusive airdrops",
    icon: "🌟"
  },
  {
    id: 2,
    title: "Connect Socials",
    description: "Follow us on social media to stay updated",
    icon: "📱"
  },
  {
    id: 3,
    title: "Your Details",
    description: "Provide your contact and token information",
    icon: "📝"
  },
  {
    id: 4,
    title: "Almost Done!",
    description: "Review and submit your application",
    icon: "✅"
  },
  {
    id: 5,
    title: "Processing...",
    description: "Validating and saving your information",
    icon: "⏳"
  },
  {
    id: 6,
    title: "Already Registered!",
    description: "Your airdrop registration is complete",
    icon: "🎉"
  }
];

const SOCIAL_LINKS = {
  telegram: "https://t.me/Tonstak3it",
  twitter: "https://x.com/tonstakeit",
  telegramChannel: "https://t.me/tonstakeit"
};

// Conversion rate: 1 STK = 100,000 STKN
const STK_CONVERSION_RATE = 100000;

export const AirdropWizard: React.FC<AirdropWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  userAddress,
  hasAlreadyRegistered = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AirdropFormData>({
    email: '',
    telegram: '',
    twitter: '',
    walletAddress: userAddress,
    stknAmount: '',
    socialConnections: {
      telegram: false,
      twitter: false,
      telegramChannel: false
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isLoadingSBT, setIsLoadingSBT] = useState(false);
  const [sbtBalance, setSbtBalance] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (hasAlreadyRegistered) {
        // Show already registered message
        setCurrentStep(6); // New step for already registered
      } else {
        setCurrentStep(1);
      }
      setFormData(prev => ({ ...prev, walletAddress: userAddress }));
      
      // Auto-fetch SBT balance when wizard opens
      if (userAddress) {
        fetchSBTBalance();
      }
    }
  }, [isOpen, userAddress, hasAlreadyRegistered]);

  // Handle escape key to close wizard
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        // Don't allow closing during processing or submission
        if (currentStep !== 5 && !isSubmitting && !isValidating) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentStep, isSubmitting, isValidating, onClose]);

  // Update wallet address when userAddress changes
  useEffect(() => {
    if (userAddress) {
      setFormData(prev => ({ ...prev, walletAddress: userAddress }));
    }
  }, [userAddress]);

  // Function to fetch SBT balance from blockchain
  const fetchSBTBalance = async () => {
    if (!userAddress) return;
    
    setIsLoadingSBT(true);
    try {
      const balance = await getUserSBTBalance(userAddress);
      setSbtBalance(balance);
      
      // Auto-fill the STKN amount field with the SBT balance
      if (balance > 0) {
        setFormData(prev => ({ ...prev, stknAmount: balance.toString() }));
      }
      
      console.log(`Auto-fetched SBT balance: ${balance}`);
    } catch (error) {
      console.error('Error fetching SBT balance:', error);
      setSbtBalance(0);
    } finally {
      setIsLoadingSBT(false);
    }
  };

  // Calculate STK from STKN
  const calculateSTK = (stknAmount: string): string => {
    if (!stknAmount || isNaN(Number(stknAmount))) return '0';
    const stkn = parseFloat(stknAmount);
    const stk = stkn / STK_CONVERSION_RATE;
    return stk.toFixed(6);
  };

  const updateFormData = (field: keyof AirdropFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updateSocialConnection = (platform: keyof typeof formData.socialConnections, connected: boolean) => {
    setFormData(prev => ({
      ...prev,
      socialConnections: {
        ...prev.socialConnections,
        [platform]: connected
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 2:
        // Validate social connections
        const connectedCount = Object.values(formData.socialConnections).filter(Boolean).length;
        if (connectedCount < 2) {
          newErrors.socialConnections = 'Please connect to at least 2 social platforms';
        }
        break;
      case 3:
        // Validate contact information
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.telegram) newErrors.telegram = 'Telegram username is required';
        if (!formData.twitter) newErrors.twitter = 'Twitter username is required';
        if (!formData.stknAmount) newErrors.stknAmount = 'STKN amount is required';
        else if (isNaN(Number(formData.stknAmount)) || Number(formData.stknAmount) < 0) {
          newErrors.stknAmount = 'Please enter a valid STKN amount';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setIsValidating(true);
    setValidationMessage('Validating your information...');
    
    // Move to validation step
    setCurrentStep(5);
    
    try {
      // Simulate validation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setValidationMessage('Saving your progress...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setValidationMessage('Registration successful!');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the completion handler
      await onComplete(formData);
      
      // Don't automatically close - let user close manually
      setIsValidating(false);
      
    } catch (error) {
      console.error('Error submitting airdrop form:', error);
      setValidationMessage('Registration failed. Please try again.');
      setTimeout(() => {
        setIsValidating(false);
        setValidationMessage('');
        setCurrentStep(4); // Go back to review step
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSocialLink = (platform: keyof typeof SOCIAL_LINKS) => {
    window.open(SOCIAL_LINKS[platform], '_blank');
    // Mark as connected after a short delay (simulating user action)
    setTimeout(() => {
      updateSocialConnection(platform, true);
    }, 1000);
  };

  const renderAlreadyRegisteredStep = () => {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto text-3xl">
          ✅
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Already Registered! 🎉
          </h3>
          <p className="text-white/70 text-lg leading-relaxed">
            You've already completed your airdrop registration. Your information is safely stored and you'll be notified about upcoming airdrops and community updates.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Registration Complete!</span>
          </div>
          <p className="text-green-400/70 text-sm mt-2">
            You're all set for future airdrops and community rewards.
          </p>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto text-3xl">
              🎉
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Welcome to TON Fortune Stakers!
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Congratulations on minting your NFT! You're now part of our exclusive community. 
                Complete this quick setup to receive future airdrops and stay connected with our community.
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">NFT Successfully Minted!</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Socials</h3>
              <p className="text-white/70">Follow us to stay updated with the latest news and airdrops</p>
            </div>
            
            <div className="space-y-4">
              {Object.entries(SOCIAL_LINKS).map(([platform]) => (
                <div
                  key={platform}
                  className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                    formData.socialConnections[platform as keyof typeof formData.socialConnections]
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/5 border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5'
                  }`}
                  onClick={() => openSocialLink(platform as keyof typeof SOCIAL_LINKS)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        formData.socialConnections[platform as keyof typeof formData.socialConnections]
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {platform === 'telegram' && '📱'}
                        {platform === 'twitter' && '🐦'}
                        {platform === 'telegramChannel' && '📢'}
                      </div>
                      <div>
                        <h4 className="font-medium text-white capitalize">
                          {platform === 'telegramChannel' ? 'TON Stake It Channel' : platform}
                        </h4>
                        <p className="text-sm text-white/60">
                          {platform === 'telegram' && 'Join our Telegram community'}
                          {platform === 'twitter' && 'Follow us on Twitter'}
                          {platform === 'telegramChannel' && 'Join our official news channel'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {formData.socialConnections[platform as keyof typeof formData.socialConnections] ? (
                        <div className="flex items-center space-x-1 text-green-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-medium">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-white/40">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-sm">Connect</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.socialConnections && (
              <div className="text-red-400 text-sm text-center">
                {errors.socialConnections}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Your Contact Information</h3>
              <p className="text-white/70">We'll use this to notify you about airdrops and updates</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                    errors.email 
                      ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' 
                      : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Telegram Username *
                </label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => updateFormData('telegram', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                    errors.telegram 
                      ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' 
                      : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'
                  }`}
                  placeholder="@username"
                />
                {errors.telegram && (
                  <p className="text-red-400 text-sm mt-1">{errors.telegram}</p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Twitter Username *
                </label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => updateFormData('twitter', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                    errors.twitter 
                      ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' 
                      : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'
                  }`}
                  placeholder="@username"
                />
                {errors.twitter && (
                  <p className="text-red-400 text-sm mt-1">{errors.twitter}</p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Your Wallet Address
                </label>
                <input
                  type="text"
                  value={formData.walletAddress}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 cursor-not-allowed text-sm sm:text-base"
                  placeholder="EQ..."
                />
                <p className="text-white/40 text-xs mt-1">
                  This is the wallet address that minted the NFT (auto-filled)
                </p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Your SBT Balance
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.stknAmount}
                    onChange={(e) => updateFormData('stknAmount', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                      errors.stknAmount 
                        ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' 
                        : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.000001"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    {isLoadingSBT ? (
                      <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    ) : (
                      <button
                        type="button"
                        onClick={fetchSBTBalance}
                        className="text-blue-400 hover:text-blue-300 text-xs underline"
                        title="Refresh SBT balance from blockchain"
                      >
                        Refresh
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-white/40 text-xs">
                    {isLoadingSBT 
                      ? 'Loading SBT balance from blockchain...' 
                      : sbtBalance !== null 
                        ? `Auto-detected: ${sbtBalance} SBT NFTs` 
                        : 'Click "Refresh" to auto-detect your SBT balance'
                    }
                  </p>
                  {sbtBalance !== null && !isLoadingSBT && (
                    <div className="flex items-center space-x-1 text-green-400 text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Auto-detected</span>
                    </div>
                  )}
                </div>
                {errors.stknAmount && (
                  <p className="text-red-400 text-sm mt-1">{errors.stknAmount}</p>
                )}
              </div>

              {/* Conversion Display */}
              {formData.stknAmount && !isNaN(Number(formData.stknAmount)) && (
                <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="text-center">
                    <h4 className="text-blue-400 font-medium mb-3 text-sm sm:text-base">Conversion Preview</h4>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6">
                      <div className="text-center min-w-0 flex-1">
                        <p className="text-lg sm:text-2xl font-bold text-blue-400 break-all">
                          {Number(formData.stknAmount).toLocaleString()}
                        </p>
                        <p className="text-xs sm:text-sm text-white/60">STKN</p>
                      </div>
                      <div className="text-white/40 transform rotate-90 sm:rotate-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                      <div className="text-center min-w-0 flex-1">
                        <p className="text-lg sm:text-2xl font-bold text-green-400 break-all">
                          {calculateSTK(formData.stknAmount)}
                        </p>
                        <p className="text-xs sm:text-sm text-white/60">STK</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-white/40">
                        Rate: 1 STK = {STK_CONVERSION_RATE.toLocaleString()} STKN
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Review Your Information</h3>
              <p className="text-white/70">Please review your details before submitting</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Email:</span>
                <span className="text-white font-medium">{formData.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Telegram:</span>
                <span className="text-white font-medium">{formData.telegram}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Twitter:</span>
                <span className="text-white font-medium">{formData.twitter}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Wallet:</span>
                <span className="text-white font-medium text-sm">
                  {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">STKN Amount:</span>
                <span className="text-white font-medium">{formData.stknAmount} STKN</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Will Receive:</span>
                <span className="text-green-400 font-medium">{calculateSTK(formData.stknAmount)} STK</span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-400 text-sm font-medium mb-1">What happens next?</p>
                  <p className="text-blue-400/70 text-sm">
                    You'll receive notifications about upcoming airdrops, community updates, and exclusive rewards. 
                    Make sure to check your email and social media regularly!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return renderValidationStep();

      case 6:
        return renderAlreadyRegisteredStep();

      default:
        return null;
    }
  };

  const renderValidationStep = () => {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto text-3xl animate-pulse">
          {validationMessage.includes('successful') ? '✅' : '⏳'}
        </div>
        
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
            {validationMessage.includes('successful') ? 'Registration Complete!' : 'Processing...'}
          </h3>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed">
            {validationMessage}
          </p>
        </div>

        {!validationMessage.includes('successful') && (
          <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-blue-400 text-sm font-medium">Please wait...</span>
            </div>
          </div>
        )}

        {validationMessage.includes('successful') && (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">All information saved successfully!</span>
              </div>
              <p className="text-green-400/70 text-sm">
                You'll receive notifications about upcoming airdrops and community updates.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  // Handle backdrop click to close (but not during processing)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && currentStep !== 5 && !isSubmitting && !isValidating) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl bg-gradient-to-br from-[#1a1f3c]/95 to-[#0d1424]/95 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-sm sm:text-lg">🎁</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Airdrop Registration</h2>
                <p className="text-white/60 text-xs sm:text-sm">
                  {currentStep === 5 && (isSubmitting || isValidating) 
                    ? 'Processing...' 
                    : `Step ${currentStep} of ${STEPS.length}`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={currentStep === 5 || isSubmitting || isValidating}
              className={`transition-colors p-1 ${
                currentStep === 5 || isSubmitting || isValidating
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-white/60 hover:text-white'
              }`}
              title={
                currentStep === 5 || isSubmitting || isValidating
                  ? 'Cannot close during processing'
                  : 'Close wizard'
              }
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-2">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                    step.id <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/40'
                  }`}>
                    {step.id < currentStep ? '✓' : step.icon}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all ${
                      step.id < currentStep ? 'bg-blue-500' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-white/80 font-medium text-sm sm:text-base">{STEPS[currentStep - 1].title}</p>
              <p className="text-white/60 text-xs sm:text-sm">{STEPS[currentStep - 1].description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || isValidating || isSubmitting}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                currentStep === 1 || isValidating || isSubmitting
                  ? 'text-white/30 cursor-not-allowed'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Back
            </button>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {currentStep === 6 ? (
                // Already registered step - just show close button
                <button
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 text-sm sm:text-base"
                >
                  Close
                </button>
              ) : currentStep === 5 && validationMessage.includes('successful') ? (
                // Successful submission step - show close button
                <button
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 text-sm sm:text-base"
                >
                  Close
                </button>
              ) : currentStep < STEPS.length && currentStep !== 4 ? (
                <button
                  onClick={nextStep}
                  disabled={isValidating || isSubmitting}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 text-sm sm:text-base disabled:from-gray-600 disabled:to-gray-700"
                >
                  Next
                </button>
              ) : currentStep === 4 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isValidating}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center space-x-2 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Complete Registration</span>
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 