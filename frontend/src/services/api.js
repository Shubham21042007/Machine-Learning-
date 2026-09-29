const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function predictDisease(data) {
  const url = `${API_BASE.replace(/\/$/, '')}/predict`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      let message = 'The prediction request could not be completed.'

      try {
        const errorBody = await response.json()
        message =
          errorBody.detail?.[0]?.msg ||
          errorBody.detail ||
          errorBody.message ||
          message
      } catch {
        // Ignore JSON parsing errors and keep a friendly message.
      }

      throw new Error(message)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Prediction server is not running. Please start the FastAPI backend.')
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Prediction server is not running. Please start the FastAPI backend.')
  }
}
