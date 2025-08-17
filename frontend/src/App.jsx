import { useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://localhost:8000";

function App() {
  const [text, setText] = useState("");
  const [inputLanguage, setInputLanguage] = useState("English");
  const [outputLanguage, setOutputLanguage] = useState("Malay");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const languages = [
    "English",
    "Malay",
    "Chinese",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Portuguese",
    "Russian",
    "Thai",
    "Vietnamese",
    "Indonesian",
  ];

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to translate");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/translate`, {
        text: text,
        input_language: inputLanguage,
        output_language: outputLanguage,
      });

      setTranslatedText(response.data.translated_text);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Translation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      setText(response.data.test_input);
      setTranslatedText(response.data.test_output);
      setInputLanguage("English");
      setOutputLanguage("Malay");
    } catch (err) {
      setError("Test failed. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setInputLanguage(outputLanguage);
    setOutputLanguage(inputLanguage);
    setText(translatedText);
    setTranslatedText(text);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🌐 Text Translation App</h1>
          <p>Powered by Google Gemini AI</p>
        </header>

        <div className="translation-container">
          {/* Language Selection */}
          <div className="language-selector">
            <div className="language-group">
              <label>From:</label>
              <select
                value={inputLanguage}
                onChange={(e) => setInputLanguage(e.target.value)}
                className="language-select"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={swapLanguages}
              className="swap-button"
              title="Swap languages"
            >
              ⇄
            </button>

            <div className="language-group">
              <label>To:</label>
              <select
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
                className="language-select"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Input and Output */}
          <div className="text-container">
            <div className="input-section">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to translate..."
                className="text-input"
                rows="6"
              />
              <div className="char-count">{text.length} characters</div>
            </div>

            <div className="output-section">
              <textarea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
                className="text-output"
                rows="6"
              />
              {translatedText && (
                <button
                  onClick={() => navigator.clipboard.writeText(translatedText)}
                  className="copy-button"
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="button-container">
            <button
              onClick={handleTranslate}
              disabled={loading || !text.trim()}
              className="translate-button"
            >
              {loading ? "🔄 Translating..." : "🚀 Translate"}
            </button>

            <button
              onClick={handleTest}
              disabled={loading}
              className="test-button"
            >
              🧪 Test API
            </button>

            <button
              onClick={() => {
                setText("");
                setTranslatedText("");
                setError("");
              }}
              className="clear-button"
            >
              🗑️ Clear
            </button>
          </div>

          {/* Error Display */}
          {error && <div className="error-message">❌ {error}</div>}
        </div>

        {/* API Status */}
        <div className="api-status">
          <p>
            API Status: <span className="status-indicator">🟢 Ready</span>
          </p>
          <p>
            API URL: <code>{API_BASE_URL}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
