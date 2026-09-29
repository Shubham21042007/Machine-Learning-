import { useMemo, useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import {
  defaultPatientData,
  educationOptions,
  frequencyOptions,
  healthOptions,
  maritalStatusOptions,
  occupationOptions,
  residenceOptions,
  sexOptions,
  sleepOptions,
  sportsOptions,
  yesNoBinaryOptions,
  yesNoOptions,
} from './data/formOptions'
import { predictDisease } from './services/api'

const pageTitles = {
  home: 'Home',
  form: 'Input Form',
  results: 'Results',
}

const initialForm = { ...defaultPatientData }

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const headerLabel = useMemo(() => pageTitles[currentPage] || 'Home', [currentPage])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? '' : Number(value),
    }))
  }

  const validateForm = () => {
    const required = Object.keys(defaultPatientData)

    for (const field of required) {
      if (formData[field] === '' || formData[field] === null || formData[field] === undefined) {
        return `${field} is required.`
      }

      const numericValue = Number(formData[field])
      if (Number.isNaN(numericValue)) {
        return `${field} must be a valid number.`
      }
    }

    return ''
  }

  const handlePredict = async () => {
    const validationMessage = validateForm()

    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await predictDisease({ ...formData })
      setResult(response)
      setCurrentPage('results')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while predicting.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData(initialForm)
    setError('')
    setResult(null)
    setCurrentPage('home')
  }

  const renderField = ({ label, field, type = 'number', options = null, min, max, step }) => (
    <label key={field} className="form-field">
      <span>{label}</span>
      {options ? (
        <select value={formData[field]} onChange={(event) => handleChange(field, event.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={formData[field]}
          min={min}
          max={max}
          step={step}
          onChange={(event) => handleChange(field, event.target.value)}
        />
      )}
    </label>
  )

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">LASI</div>
          <div>
            <div className="brand-title">Multi-Disease Risk Prediction</div>
            <div className="brand-subtitle">AI + Healthcare Research Dashboard</div>
          </div>
        </div>

        <nav className="nav">
          <button className={currentPage === 'home' ? 'nav-button active' : 'nav-button'} onClick={() => setCurrentPage('home')}>
            Home
          </button>
          <button className={currentPage === 'form' ? 'nav-button active' : 'nav-button'} onClick={() => setCurrentPage('form')}>
            Input Form
          </button>
          <button className={currentPage === 'results' ? 'nav-button active' : 'nav-button'} onClick={() => setCurrentPage('results')}>
            Results
          </button>
        </nav>
      </header>

      <main className="content-area">
        {currentPage === 'home' && <HomePage onStartPrediction={() => setCurrentPage('form')} />}

        {currentPage === 'form' && (
          <div className="page-shell">
            <div className="page-header">
              <div>
                <span className="eyebrow">Patient Information</span>
                <h2>{headerLabel}</h2>
              </div>
            </div>

            <div className="error-banner" style={{ display: error ? 'block' : 'none' }}>{error}</div>

            <form className="prediction-form" onSubmit={(event) => event.preventDefault()}>
              <section className="form-section">
                <h3>1. Basic Information</h3>
                <div className="field-grid">
                  {renderField({ label: 'Residence', field: 'residence', options: residenceOptions })}
                  <label className="form-field">
                    <span>Age</span>
                    <input
                      type="number"
                      value={formData.dm005}
                      min={0}
                      onChange={(event) => handleChange('dm005', event.target.value)}
                    />
                  </label>
                  {renderField({ label: 'Education', field: 'dm008', options: educationOptions })}
                  {renderField({ label: 'Marital Status', field: 'dm021', options: maritalStatusOptions })}
                  {renderField({ label: 'Sex', field: 'dm003', options: sexOptions })}
                  {renderField({ label: 'Main Occupation', field: 'we027_main', options: occupationOptions })}
                </div>
              </section>

              <section className="form-section">
                <h3>2. Lifestyle</h3>
                <div className="field-grid">
                  {renderField({ label: 'Tobacco Use', field: 'hb001', options: yesNoOptions })}
                  {renderField({ label: 'Alcohol Use', field: 'hb101', options: yesNoOptions })}
                  {renderField({ label: 'Vigorous Physical Activity', field: 'hb211', options: frequencyOptions })}
                  {renderField({ label: 'Moderate Physical Activity', field: 'hb213', options: frequencyOptions })}
                  {renderField({ label: 'Outdoor Games / Sports / Exercise / Yoga', field: 'fs507', options: sportsOptions })}
                </div>
              </section>

              <section className="form-section">
                <h3>3. Blood Pressure and Physical Measurements</h3>
                <div className="field-grid">
                  {renderField({ label: 'Systolic Blood Pressure (mmHg)', field: 'bm017', type: 'number', min: 0 })}
                  {renderField({ label: 'Diastolic Blood Pressure (mmHg)', field: 'bm018', type: 'number', min: 0 })}
                  {renderField({ label: 'Pulse Rate (beats/min)', field: 'bm019', type: 'number', min: 0 })}
                  {renderField({ label: 'Grip Strength Left', field: 'bm028', type: 'number', min: 0 })}
                  {renderField({ label: 'Grip Strength Right', field: 'bm029', type: 'number', min: 0 })}
                  {renderField({ label: 'Grip Strength Left (2)', field: 'bm030', type: 'number', min: 0 })}
                  {renderField({ label: 'Grip Strength Right (2)', field: 'bm031', type: 'number', min: 0 })}
                  {renderField({ label: 'Timed Walk 1', field: 'bm056', type: 'number', min: 0 })}
                  {renderField({ label: 'Timed Walk 2', field: 'bm057', type: 'number', min: 0 })}
                  {renderField({ label: 'Distance Vision Left', field: 'bm061', type: 'number', min: 0 })}
                  {renderField({ label: 'Distance Vision Right', field: 'bm062', type: 'number', min: 0 })}
                  {renderField({ label: 'Near Vision Left', field: 'bm063', type: 'number', min: 0 })}
                  {renderField({ label: 'Near Vision Right', field: 'bm064', type: 'number', min: 0 })}
                  {renderField({ label: 'Height (cm)', field: 'bm067', type: 'number', min: 0 })}
                  {renderField({ label: 'Weight (kg)', field: 'bm071', type: 'number', min: 0 })}
                  {renderField({ label: 'Waist Circumference (cm)', field: 'bm076', type: 'number', min: 0 })}
                  {renderField({ label: 'Hip Circumference (cm)', field: 'bm079', type: 'number', min: 0 })}
                </div>
              </section>

              <section className="form-section">
                <h3>4. Health Questions</h3>
                <div className="field-grid">
                  {renderField({ label: 'Overall Health', field: 'ht001_a', options: healthOptions })}
                  {renderField({ label: 'Chest Pain or Discomfort', field: 'ht212', options: yesNoOptions })}
                  {renderField({ label: 'Sleep Question 1', field: 'ht219', options: sleepOptions })}
                  {renderField({ label: 'Sleep Question 2', field: 'ht220', options: sleepOptions })}
                  {renderField({ label: 'Sleep Question 3', field: 'ht221', options: sleepOptions })}
                  {renderField({ label: 'Sleep Question 4', field: 'ht222', options: sleepOptions })}
                  {renderField({ label: 'Often Troubled by Pain', field: 'ht225', options: yesNoOptions })}
                </div>
              </section>

              <section className="form-section">
                <h3>5. Persistent / Troublesome Symptoms</h3>
                <div className="field-grid">
                  {renderField({ label: 'Pain / Stiffness in Joints', field: 'ht229s1', options: yesNoBinaryOptions })}
                  {renderField({ label: 'Persistent Swelling in Feet / Ankles', field: 'ht229s2', options: yesNoBinaryOptions })}
                  {renderField({ label: 'Shortness of Breath While Awake', field: 'ht229s3', options: yesNoBinaryOptions })}
                  {renderField({ label: 'Persistent Dizziness / Light-headedness', field: 'ht229s4', options: yesNoBinaryOptions })}
                  {renderField({ label: 'Back Pain / Problem', field: 'ht229s5', options: yesNoBinaryOptions })}
                  {renderField({ label: 'Persistent Headaches', field: 'ht229s6', options: yesNoBinaryOptions })}
                  {renderField({ label: 'Severe Fatigue / Exhaustion', field: 'ht229s7', options: yesNoBinaryOptions })}
                  {renderField({ label: 'Wheezing / Whistling From Chest', field: 'ht229s8', options: yesNoBinaryOptions })}
                  {renderField({ label: 'Cough With or Without Phlegm', field: 'ht229s9', options: yesNoBinaryOptions })}
                </div>
              </section>

              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={() => setCurrentPage('home')}>
                  Back Home
                </button>
                <button type="button" className="primary-button" onClick={handlePredict} disabled={loading}>
                  {loading ? 'Predicting...' : 'Predict Disease Risks'}
                </button>
              </div>
            </form>
          </div>
        )}

        {currentPage === 'results' && <ResultsPage result={result} onNewPrediction={handleReset} />}
      </main>
    </div>
  )
}

export default App
