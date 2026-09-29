const humanizeDisease = (value) => {
  if (!value) return ''

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const formatProbability = (value) => {
  const percentage = Number(value) * 100
  return `${percentage.toFixed(2)}%`
}

const getRiskLevel = (value) => {
  const probability = Number(value)

  if (probability >= 0.5) return 'High'
  if (probability >= 0.2) return 'Moderate'
  if (probability >= 0.05) return 'Low'
  return 'Very Low'
}

const getRiskClass = (value) => {
  const probability = Number(value)

  if (probability >= 0.5) return 'risk-high'
  if (probability >= 0.2) return 'risk-moderate'
  if (probability >= 0.05) return 'risk-low'

  return 'risk-very-low'
}

export default function ResultsPage({ result, onNewPrediction }) {
  const highestRisk = result?.highest_risk || {}
  const top5 = result?.top5 || []
  const predictions = result?.predictions || {}
  const rareAlerts = result?.rare_alerts || []

  const shapFeatures =
    result?.shap?.features ||
    result?.shap?.top_features ||
    []

  const counterfactual = result?.counterfactual

  return (
    <main className="results-page">

      {/* Results Hero */}
      <section className="results-hero">
        <div>
          <div className="result-badge">
            <span className="status-dot" />
            PREDICTION COMPLETE
          </div>

          <h1>Multi-Disease Risk Assessment</h1>

          <p>
            AI-generated risk estimates based on the information provided
            through the LASI research prototype.
          </p>
        </div>

        <button
          className="new-prediction-button"
          onClick={onNewPrediction}
        >
          <span>＋</span>
          New Prediction
        </button>
      </section>

      {/* Highest Risk */}
      <section className="highest-risk-panel">
        <div className="highest-risk-left">
          <div className="highest-risk-icon">
            🧠
          </div>

          <div>
            <span className="panel-overline">
              HIGHEST PREDICTED RISK
            </span>

            <h2>
              {highestRisk.disease
                ? humanizeDisease(highestRisk.disease)
                : 'No result'}
            </h2>

            <div className="risk-status-row">
              <span
                className={`risk-pill ${getRiskClass(
                  highestRisk.probability
                )}`}
              >
                {getRiskLevel(highestRisk.probability)} model estimate
              </span>

              <span className="research-tag">
                Model-based estimate
              </span>
            </div>
          </div>
        </div>

        <div className="highest-risk-score">
          <strong>
            {highestRisk.disease
              ? formatProbability(highestRisk.probability)
              : '--'}
          </strong>

          <span>Predicted Probability</span>
        </div>
      </section>

      {/* Top 5 */}
      <section className="result-panel">
        <div className="result-panel-heading">
          <div>
            <span className="panel-overline">RISK RANKING</span>
            <h2>Top 5 Predicted Risks</h2>
          </div>

          <span className="small-badge">TOP 5</span>
        </div>

        <div className="top-risk-list">
          {top5.length > 0 ? (
            top5.map((item, index) => (
              <div
                key={item.disease}
                className="top-risk-item"
              >
                <div className="rank-number">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="top-risk-main">
                  <div className="top-risk-label">
                    <span>
                      {humanizeDisease(item.disease)}
                    </span>

                    <strong>
                      {formatProbability(item.probability)}
                    </strong>
                  </div>

                  <div className="modern-progress">
                    <span
                      style={{
                        width: `${Math.min(
                          Number(item.probability) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <span
                  className={`mini-risk-label ${getRiskClass(
                    item.probability
                  )}`}
                >
                  {getRiskLevel(item.probability)}
                </span>
              </div>
            ))
          ) : (
            <p className="empty-state">
              No top disease risks were returned.
            </p>
          )}
        </div>
      </section>

      {/* All diseases */}
      <section className="result-panel">
        <div className="result-panel-heading">
          <div>
            <span className="panel-overline">
              COMPLETE OUTPUT
            </span>

            <h2>All 15 Disease Predictions</h2>
          </div>

          <span className="small-badge">
            {Object.keys(predictions).length} OUTCOMES
          </span>
        </div>

        <div className="prediction-grid-modern">
          {Object.entries(predictions).length > 0 ? (
            Object.entries(predictions)
              .sort(([, a], [, b]) => Number(b) - Number(a))
              .map(([disease, probability], index) => (
                <div
                  key={disease}
                  className={`prediction-card-modern ${
                    index < 5 ? 'prediction-highlight' : ''
                  }`}
                >
                  <div className="prediction-card-top">
                    <span className="prediction-rank">
                      #{index + 1}
                    </span>

                    <span
                      className={`prediction-dot ${getRiskClass(
                        probability
                      )}`}
                    />
                  </div>

                  <h3>{humanizeDisease(disease)}</h3>

                  <strong>
                    {formatProbability(probability)}
                  </strong>

                  <div className="prediction-mini-bar">
                    <span
                      style={{
                        width: `${Math.min(
                          Number(probability) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <small>
                    {getRiskLevel(probability)} model estimate
                  </small>
                </div>
              ))
          ) : (
            <p className="empty-state">
              No disease predictions were returned.
            </p>
          )}
        </div>
      </section>

      {/* Rare alerts */}
      <section className="alert-panel">
        <div className="alert-panel-heading">
          <div className="alert-symbol">⚠</div>

          <div>
            <span className="panel-overline">
              LOW-FREQUENCY DISEASE MONITORING
            </span>

            <h2>Rare / Low-Frequency Model Alerts</h2>
          </div>
        </div>

        {rareAlerts.length > 0 ? (
          <div className="alert-list-modern">
            {rareAlerts.map((alert) => (
              <div
                key={alert.disease}
                className="alert-card"
              >
                <div>
                  <span className="alert-card-label">
                    Elevated model estimate
                  </span>

                  <strong>
                    {humanizeDisease(alert.disease)}
                  </strong>
                </div>

                <span className="alert-percentage">
                  {formatProbability(alert.probability)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-alert-box">
            <span>✓</span>
            No low-frequency disease alerts were triggered.
          </div>
        )}

        <p className="fine-print">
          These alerts are model-based research outputs and are not
          clinical diagnoses.
        </p>
      </section>

      {/* Explainability */}
      <section className="explain-grid">

        {/* SHAP */}
        <div className="result-panel explanation-card">
          <div className="explanation-heading">
            <div className="explanation-icon blue-icon">
              🔍
            </div>

            <div>
              <span className="panel-overline">
                EXPLAINABLE AI
              </span>

              <h2>Why Did the Model Predict This?</h2>
            </div>
          </div>

          {result?.shap ? (
            <>
              <div className="explained-disease">
                <span>Explained disease</span>
                <strong>
                  {humanizeDisease(
                    result.shap.disease || 'Prediction'
                  )}
                </strong>
              </div>

            <div className="shap-list">
  {shapFeatures.slice(0, 5).map((feature, index) => {
    const contribution = Number(
      feature.contribution ??
      feature.shap_value ??
      feature.shap_value_raw ??
      feature.value ??
      0
    )

    const isPositive = contribution > 0
    const isNegative = contribution < 0

    return (
      <div
        className={`shap-item ${
          isPositive
            ? 'shap-item-positive'
            : isNegative
              ? 'shap-item-negative'
              : ''
        }`}
        key={
          feature.feature ||
          feature.label ||
          index
        }
      >
        <div className="shap-rank">
          {index + 1}
        </div>

        <div className="shap-content">
          <strong>
            {feature.label ||
              feature.feature ||
              'Feature'}
          </strong>

          <span>
            {isPositive
              ? '↑ Pushes prediction higher'
              : isNegative
                ? '↓ Pushes prediction lower'
                : 'No strong directional contribution'}
          </span>
        </div>

        <div
          className={`shap-value ${
            isPositive
              ? 'shap-value-positive'
              : isNegative
                ? 'shap-value-negative'
                : ''
          }`}
        >
          {contribution > 0 ? '+' : ''}
          {contribution.toFixed(3)}
        </div>
      </div>
    )
  })}
</div>

              <p className="explanation-note">
                SHAP identifies features that contribute to the
                model prediction. A contribution indicates model
                influence, not causation.
              </p>
            </>
          ) : (
            <p className="empty-state">
              SHAP explanation is not available.
            </p>
          )}
        </div>

        {/* Counterfactual */}
        <div className="result-panel explanation-card">
          <div className="explanation-heading">
            <div className="explanation-icon green-icon">
              ↻
            </div>

            <div>
              <span className="panel-overline">
                WHAT-IF ANALYSIS
              </span>

              <h2>Counterfactual Explanation</h2>
            </div>
          </div>

          {counterfactual ? (
            <>
              <div className="explained-disease">
                <span>Analyzed disease</span>
                <strong>
                  {humanizeDisease(
                    counterfactual.disease
                  )}
                </strong>
              </div>

              <div className="counterfactual-result">
                <div className="cf-number">
                  <span>Original</span>
                  <strong>
                    {formatProbability(
                      counterfactual.original_probability
                    )}
                  </strong>
                </div>

                <div className="cf-arrow">→</div>

                <div className="cf-number">
                  <span>What-if</span>
                  <strong className="cf-new">
                    {formatProbability(
                      counterfactual.new_probability
                    )}
                  </strong>
                </div>
              </div>

              <div className="reduction-box">
                <span>Model probability reduction</span>
                <strong>
                  {formatProbability(
                    counterfactual.reduction
                  )}
                </strong>
              </div>

              {counterfactual.changes?.length > 0 && (
                <div className="changes-section">
                  <span className="changes-title">
                    Tested changes
                  </span>

                  <ul>
                    {counterfactual.changes.map(
                      (change, index) => (
                        <li key={`${change}-${index}`}>
                          <span>✓</span>
                          {change}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              <p className="explanation-note">
                This is a constrained model-based what-if
                analysis and does not establish a causal or
                medical relationship.
              </p>
            </>
          ) : (
            <p className="empty-state">
              Counterfactual explanation is not available.
            </p>
          )}
        </div>
      </section>

      {/* Bottom disclaimer */}
      <section className="results-disclaimer">
        <div className="disclaimer-icon">ⓘ</div>

        <div>
          <strong>Research Prototype Notice</strong>

          <p>
            The displayed probabilities are machine-learning
            model estimates generated from the provided inputs.
            They are intended for research and demonstration
            purposes and should not be interpreted as medical
            diagnoses or clinical recommendations.
          </p>
        </div>
      </section>

    </main>
  )
}