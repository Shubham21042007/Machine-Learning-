const workflowSteps = [
  {
    number: '01',
    title: 'Enter Information',
    description: 'Demographic, lifestyle and health details',
    icon: '👤',
  },
  {
    number: '02',
    title: 'AI Model Analysis',
    description: 'Disease-specific ML models analyze the input',
    icon: '🧠',
  },
  {
    number: '03',
    title: 'View Disease Risks',
    description: '15 disease risk estimates are generated',
    icon: '📊',
  },
  {
    number: '04',
    title: 'Understand Results',
    description: 'SHAP and what-if explanations',
    icon: '💡',
  },
]

const features = [
  {
    icon: '🩺',
    title: '15 Diseases',
    text: 'Multi-disease risk estimation from LASI Wave 1 data.',
  },
  {
    icon: '🤖',
    title: 'Multiple ML Models',
    text: 'Logistic Regression, XGBoost and Focal Neural Network.',
  },
  {
    icon: '🔍',
    title: 'Explainable AI',
    text: 'Understand which features contribute to predictions.',
  },
  {
    icon: '⚠️',
    title: 'Low-Frequency Alerts',
    text: 'Separate alerts for selected low-frequency diseases.',
  },
]

export default function HomePage({ onStartPrediction }) {
  return (
    <main className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="status-dot" />
            LASI WAVE 1 · MACHINE LEARNING RESEARCH
          </div>

          <h1>
            Multi-Disease
            <span> Risk Prediction</span>
          </h1>

          <p className="hero-description">
            An explainable AI-based system for estimating multiple disease
            risks using demographic, lifestyle, symptom and physiological
            information from LASI Wave 1.
          </p>

          <div className="hero-buttons">
            <button
              className="hero-primary-button"
              onClick={onStartPrediction}
            >
              Start Risk Assessment
              <span className="button-arrow">→</span>
            </button>

            <div className="hero-research-note">
              <span>✦</span>
              Research Prototype
            </div>
          </div>

          <p className="hero-disclaimer">
            Model outputs are research-based risk estimates and are not
            medical diagnoses.
          </p>
        </div>

        {/* Floating visual */}
        <div className="hero-visual">
          <div className="ai-orbit orbit-one" />
          <div className="ai-orbit orbit-two" />

          <div className="ai-core">
            <div className="ai-core-icon">🧠</div>
            <strong>AI</strong>
            <span>Risk Analysis</span>
          </div>

          <div className="floating-card floating-card-top">
            <span className="floating-icon">📈</span>
            <div>
              <strong>15</strong>
              <small>Diseases</small>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <span className="floating-icon">🔍</span>
            <div>
              <strong>XAI</strong>
              <small>Explainable</small>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-strip">
        <div className="stat-item">
          <strong>15</strong>
          <span>Disease Outcomes</span>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <strong>3</strong>
          <span>Model Families</span>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <strong>113</strong>
          <span>Processed Features</span>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <strong>XAI</strong>
          <span>SHAP + Counterfactuals</span>
        </div>
      </section>

      {/* Features */}
      <section className="home-section">
        <div className="section-heading">
          <span className="section-label">SYSTEM CAPABILITIES</span>
          <h2>One system. Multiple perspectives.</h2>
          <p>
            The system combines prediction, risk ranking, low-frequency
            alerts and explainability into one research prototype.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="home-section workflow-section">
        <div className="section-heading">
          <span className="section-label">HOW IT WORKS</span>
          <h2>From health information to explanation</h2>
        </div>

        <div className="workflow-modern">
          {workflowSteps.map((step, index) => (
            <div className="workflow-modern-item" key={step.number}>
              <div className="workflow-icon">
                {step.icon}
              </div>

              <div className="workflow-number-modern">
                {step.number}
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

              {index < workflowSteps.length - 1 && (
                <div className="workflow-connector">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div>
          <span className="section-label">READY TO EXPLORE?</span>
          <h2>Run a multi-disease risk assessment</h2>
          <p>
            Enter the required information and explore the model's predictions
            and explanations.
          </p>
        </div>

        <button
          className="hero-primary-button"
          onClick={onStartPrediction}
        >
          Begin Assessment
          <span className="button-arrow">→</span>
        </button>
      </section>

      <footer className="home-footer">
        <div>
          <strong>LASI Multi-Disease Risk Prediction</strong>
          <span>Healthcare Research Dashboard</span>
        </div>

        <p>
          Machine-learning research prototype · Not for clinical diagnosis
        </p>
      </footer>
    </main>
  )
}