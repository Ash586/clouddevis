'use client';

import { useEffect, useState } from 'react';

export function AnimatedPreview() {
  const [step, setStep] = useState(0);
  const steps = ['Saisie', 'Calcul', 'Export'];
  const highlights = ['items', 'tva', 'total'];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="animated-preview">
      <div className="ap-mock">
        <div className={`ap-bar ap-${highlights[step]}`}>
          <div className="ap-dots">
            <span className="ap-dot active"></span>
            <span className="ap-dot"></span>
            <span className="ap-dot"></span>
          </div>
          <div className="ap-progress-text">{steps[step]}</div>
        </div>
        <div className="ap-content">
          <div className="ap-line long w-3/4"></div>
          <div className="ap-line short w-1/2"></div>
          <div className="ap-line long w-2/3"></div>
          <div className="ap-total">
            <div className="ap-line highlight w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureAnimation() {
  return (
    <div className="feature-anim">
      <div className="fa-icon">📄</div>
      <div className="fa-steps">
        <div className="fa-step">1. Saisie</div>
        <div className="fa-arrow">→</div>
        <div className="fa-step">2. Calcul</div>
        <div className="fa-arrow">→</div>
        <div className="fa-step">3. PDF</div>
      </div>
    </div>
  );
}