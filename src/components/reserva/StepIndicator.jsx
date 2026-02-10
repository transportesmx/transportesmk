import React, { useContext } from 'react';
import { AppContext } from '@/Context/AppContext';

const stepKeys = ['service', 'route', 'vehicle', 'details', 'payment'];

export default function StepIndicator({ pasoActual }) {
  const { traduccion } = useContext(AppContext);
  const t = traduccion?.reservar?.steps || {};

  return (
    <div className="w-full max-w-xl mx-auto mb-8 sm:mb-10">
      <div className="flex items-center">
        {stepKeys.map((key, index) => {
          const stepNum = index + 1;
          const isActive = pasoActual === stepNum;
          const isCompleted = pasoActual > stepNum;

          return (
            <React.Fragment key={key}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300
                    ${isCompleted
                      ? 'bg-blue-500 text-white'
                      : isActive
                        ? 'bg-white text-[#0a0a0f] shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                        : 'bg-white/[0.06] text-white/30'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`
                    text-[10px] sm:text-xs mt-1.5 font-medium transition-colors duration-300
                    ${isActive ? 'text-white' : isCompleted ? 'text-blue-400/70' : 'text-white/20'}
                  `}
                >
                  {t[key] || key}
                </span>
              </div>

              {index < stepKeys.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3 h-px mb-5 relative">
                  <div className="absolute inset-0 bg-white/[0.06]" />
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-500 ease-out"
                    style={{ width: pasoActual > stepNum ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
