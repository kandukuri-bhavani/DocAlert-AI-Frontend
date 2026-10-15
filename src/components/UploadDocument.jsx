
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadDocument.css";

const API_URL = "http://localhost:8081/api/documents/upload";

const FIELD_GROUPS = [
  {
    title: "Document information",
    fields: [
      ["title", "Document title", "text"],
      ["documentType", "Document type", "text"],
      ["category", "Category", "text"],
      ["subCategory", "Subcategory", "text"],
      ["detectedLanguage", "Detected language", "text"],
    ],
  },
  {
    title: "Holder and issuer",
    fields: [
      ["holderName", "Holder / owner name", "text"],
      ["documentNumber", "Document number", "text"],
      ["issuingOrganization", "Issuing organization", "text"],
    ],
  },
  {
    title: "Important dates",
    fields: [
      ["issueDate", "Issue date", "date"],
      ["startDate", "Start date", "date"],
      ["expiryDate", "Expiry date", "date"],
      ["renewalDate", "Renewal date", "date"],
      ["paymentDate", "Payment date", "date"],
      ["dueDate", "Due date", "date"],
      ["maturityDate", "Maturity date", "date"],
    ],
  },
  {
    title: "Financial information",
    fields: [
      ["amount", "Amount", "number"],
      ["paymentAmount", "Payment amount", "number"],
      ["maturityAmount", "Maturity amount", "number"],
      ["currency", "Currency", "text"],
      ["frequency", "Payment frequency", "text"],
      ["interestRate", "Interest rate", "text"],
      ["tenure", "Tenure", "text"],
    ],
  },
];

function safeValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

function formatDate(value) {
  if (!value) return "Not detected";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));

  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

function formatAmount(value, currency) {
  if (value === null || value === undefined || value === "") {
    return "Not detected";
  }

  const number = Number(value);
  const formatted = Number.isFinite(number)
    ? number.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : String(value);

  return currency ? `${currency} ${formatted}` : formatted;
}

function DetailField({ label, value }) {
  return (
    <div className="analysis-field">
      <label>{label}</label>
      <strong>
        {value === null || value === undefined || value === ""
          ? "Not detected"
          : String(value)}
      </strong>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="analysis-summary">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function DetailList({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="important-points">
      <h3>{title}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function UploadDocument() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(true);
  const [reviewed, setReviewed] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setMessage("");
    setResult(null);
    setDraft(null);
    setReviewed(false);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedExtensions = [
  ".pdf",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];
    const fileName = selectedFile.name.toLowerCase();

    if (!allowedExtensions.some((extension) => fileName.endsWith(extension))) {
      setFile(null);
      setMessage(
  "Please select a PDF, DOCX, JPG, JPEG, PNG or WEBP file."
);
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setMessage("File size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select a document first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Your session has expired. Please log in again.");
      navigate("/");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);
    setDraft(null);
    setReviewed(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseText = await response.text();
      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        setMessage(
          typeof data === "string"
            ? data
            : data.message ||
              data.error ||
              `Upload failed (HTTP ${response.status}).`
        );
        return;
      }

      const analysis = data.analysis || data;

      setResult(data);
      setDraft({
        ...analysis,
        importantPoints: Array.isArray(analysis.importantPoints)
          ? [...analysis.importantPoints]
          : [],
        suggestions: Array.isArray(analysis.suggestions)
          ? [...analysis.suggestions]
          : [],
      });
      setEditing(true);
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage(
        "Unable to connect to Spring Boot. Check that the backend is running on port 8081."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
    setReviewed(false);
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
    setDraft(null);
    setMessage("");
    setReviewed(false);
    setEditing(true);

    const input = document.getElementById("document-file-input");
    if (input) input.value = "";
  };

  const handleConfirmReview = (event) => {
    event.preventDefault();

    if (!draft) return;

    setReviewed(true);
    setEditing(false);
    setMessage(
      "Review confirmed for this page. Your corrections have not been saved permanently."
    );
  };

  const renderEditorField = ([field, label, type]) => (
    <div className="analysis-edit-field" key={field}>
      <label htmlFor={`review-${field}`}>{label}</label>
      <input
        id={`review-${field}`}
        type={type}
        value={safeValue(draft[field])}
        step={type === "number" ? "any" : undefined}
        onChange={(event) => {
          const value = event.target.value;

          updateField(
            field,
            type === "number" && value !== "" ? Number(value) : value
          );
        }}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );

  const analysis = draft || result?.analysis || result || {};

  return (
    <div className="upload-page">
      <div className="upload-container">
        <header className="upload-header">
          <button
            className="back-button"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <div className="upload-heading">
            <span>DOCALERT AI</span>
            <h1>Upload a Document</h1>
            <p>
              Upload an important document and let DocAlert AI find
              the information that matters.
            </p>
          </div>
        </header>

        {!result && (
          <div className="upload-card">
            <div className="upload-icon">◫</div>
            <h2>Select your document</h2>
            <p className="upload-description">
              Upload PDF, DOCX, JPG or PNG files up to 10 MB.
            </p>

            <form onSubmit={handleUpload}>
              <label className="file-select-box">
                <div className="file-select-content">
                  <div className="file-select-icon">↑</div>
                  <strong>{file ? file.name : "Choose a document"}</strong>
                  <span>
                    {file
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                      : "Click here to browse your files"}
                  </span>
                </div>

                <input
                  id="document-file-input"
                  type="file"
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                />
              </label>

              {file && (
                <div className="selected-file">
                  <div className="selected-file-info">
                    <div className="selected-file-icon">▤</div>
                    <div>
                      <strong>{file.name}</strong>
                      <span>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="remove-file"
                    onClick={resetUpload}
                  >
                    Remove
                  </button>
                </div>
              )}

              {message && (
                <div className="upload-error" role="alert">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="upload-submit-button"
                disabled={!file || loading}
              >
                {loading ? "Analyzing document..." : "Upload & Analyze"}
              </button>
            </form>

            <div className="upload-note">
              <strong>Privacy notice</strong>
              <span>
                This version sends document text to your local Ollama model
                for analysis. Your original upload is still handled by your
                DocAlert AI backend.
              </span>
            </div>
          </div>
        )}

        {result && draft && (
          <div className="analysis-card">
            <div className="success-header">
              <div className="success-icon">✓</div>
              <div>
                <span className="result-label">ANALYSIS COMPLETE</span>
                <h2>Review your document details</h2>
                <p>
                  Check the extracted information and correct any mistakes
                  before relying on dates or amounts.
                </p>
              </div>
            </div>

            <div className="verification-warning">
              <strong>Review required</strong>
              <p>
                AI extraction may contain errors. Compare the information
                with the original document. No reminder is created by this
                review.
              </p>
            </div>

            <div className="uploaded-file-summary">
              <span>Uploaded document</span>
              <strong>{result.fileName || file?.name || "Document"}</strong>
            </div>

            <div className="review-toolbar">
              <div>
                <h3>Verify & Edit Extracted Details</h3>
                <p>Edit any field that is missing or incorrect.</p>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setEditing((previous) => !previous)}
              >
                {editing ? "Hide editor" : "Edit details"}
              </button>
            </div>

            {editing && (
              <form className="analysis-edit-form" onSubmit={handleConfirmReview}>
                {FIELD_GROUPS.map((group) => (
                  <section className="analysis-summary" key={group.title}>
                    <h3>{group.title}</h3>
                    <div className="analysis-edit-grid">
                      {group.fields.map(renderEditorField)}
                    </div>
                  </section>
                ))}

                <section className="analysis-summary">
                  <h3>Document summary</h3>
                  <div className="analysis-edit-field">
                    <label htmlFor="review-summary">Summary</label>
                    <textarea
                      id="review-summary"
                      rows={4}
                      value={safeValue(draft.summary)}
                      onChange={(event) =>
                        updateField("summary", event.target.value)
                      }
                    />
                  </div>

                  <div className="analysis-edit-field">
                    <label htmlFor="review-explanation">
                      Detailed explanation
                    </label>
                    <textarea
                      id="review-explanation"
                      rows={5}
                      value={safeValue(draft.detailedExplanation)}
                      onChange={(event) =>
                        updateField("detailedExplanation", event.target.value)
                      }
                    />
                  </div>

                  <div className="analysis-edit-field">
                    <label htmlFor="review-points">
                      Important points (one per line)
                    </label>
                    <textarea
                      id="review-points"
                      rows={4}
                      value={(draft.importantPoints || []).join("\n")}
                      onChange={(event) =>
                        updateField(
                          "importantPoints",
                          event.target.value
                            .split("\n")
                            .map((item) => item.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </div>

                  <div className="analysis-edit-field">
                    <label htmlFor="review-suggestions">
                      Suggestions (one per line)
                    </label>
                    <textarea
                      id="review-suggestions"
                      rows={4}
                      value={(draft.suggestions || []).join("\n")}
                      onChange={(event) =>
                        updateField(
                          "suggestions",
                          event.target.value
                            .split("\n")
                            .map((item) => item.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </div>
                </section>

                <div className="review-notice">
                  Your edits currently apply to this page only. They are not
                  permanently saved to MySQL.
                </div>

                <div className="analysis-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      const original = result.analysis || result;
                      setDraft({
                        ...original,
                        importantPoints: Array.isArray(original.importantPoints)
                          ? [...original.importantPoints]
                          : [],
                        suggestions: Array.isArray(original.suggestions)
                          ? [...original.suggestions]
                          : [],
                      });
                      setReviewed(false);
                      setMessage("");
                    }}
                  >
                    Reset changes
                  </button>

                  <button type="submit" className="primary-button">
                    Confirm review
                  </button>
                </div>
              </form>
            )}

            {message && (
              <div className={reviewed ? "review-success" : "review-notice"}>
                {message}
              </div>
            )}

            {reviewed && !editing && (
              <div className="review-success">
                <strong>✓ Review confirmed</strong>
                <p>
                  Your corrected values are displayed below. They have not
                  been saved permanently.
                </p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditing(true)}
                >
                  Edit again
                </button>
              </div>
            )}

            <DetailSection title="Document Overview">
              <div className="analysis-grid">
                <DetailField label="Title" value={draft.title} />
                <DetailField label="Document Type" value={draft.documentType} />
                <DetailField label="Category" value={draft.category} />
                <DetailField label="Subcategory" value={draft.subCategory} />
                <DetailField label="Detected Language" value={draft.detectedLanguage} />
                <DetailField
                  label="Multilingual"
                  value={
                    typeof draft.multilingual === "boolean"
                      ? draft.multilingual ? "Yes" : "No"
                      : null
                  }
                />
              </div>
            </DetailSection>

            <DetailSection title="Holder & Issuer Information">
              <div className="analysis-grid">
                <DetailField label="Holder / Owner Name" value={draft.holderName} />
                <DetailField label="Document Number" value={draft.documentNumber} />
                <DetailField
                  label="Issuing Organization"
                  value={draft.issuingOrganization}
                />
              </div>
            </DetailSection>

            <DetailSection title="Important Dates">
              <div className="analysis-grid">
                <DetailField label="Issue Date" value={formatDate(draft.issueDate)} />
                <DetailField label="Start Date" value={formatDate(draft.startDate)} />
                <DetailField label="Expiry Date" value={formatDate(draft.expiryDate)} />
                <DetailField label="Renewal Date" value={formatDate(draft.renewalDate)} />
                <DetailField label="Payment Date" value={formatDate(draft.paymentDate)} />
                <DetailField label="Due Date" value={formatDate(draft.dueDate)} />
                <DetailField label="Maturity Date" value={formatDate(draft.maturityDate)} />
              </div>
            </DetailSection>

            <DetailSection title="Financial Information">
              <div className="analysis-grid">
                <DetailField
                  label="Amount"
                  value={formatAmount(draft.amount, draft.currency)}
                />
                <DetailField
                  label="Payment Amount"
                  value={formatAmount(draft.paymentAmount, draft.currency)}
                />
                <DetailField
                  label="Maturity Amount"
                  value={formatAmount(draft.maturityAmount, draft.currency)}
                />
                <DetailField label="Currency" value={draft.currency} />
                <DetailField label="Payment Frequency" value={draft.frequency} />
                <DetailField label="Interest Rate" value={draft.interestRate} />
                <DetailField label="Tenure" value={draft.tenure} />
              </div>
            </DetailSection>

            {draft.summary && (
              <DetailSection title="Document Summary">
                <p>{draft.summary}</p>
              </DetailSection>
            )}

            {draft.detailedExplanation && (
              <DetailSection title="Detailed Explanation">
                <p className="document-explanation">
                  {draft.detailedExplanation}
                </p>
              </DetailSection>
            )}

            <DetailList title="Important Points" items={draft.importantPoints} />
            <DetailList title="AI Suggestions" items={draft.suggestions} />

            <div className="confidence-box">
              <span>AI extraction confidence</span>
              <strong>
                {typeof draft.confidence === "number"
                  ? `${Math.round(Math.max(0, Math.min(1, draft.confidence)) * 100)}%`
                  : "Not available"}
              </strong>
            </div>

            <div className="verification-status">
              <div>
                <span>Review status</span>
                <strong>{reviewed ? "REVIEWED ON THIS PAGE" : "REVIEW REQUIRED"}</strong>
              </div>
              <div className="verification-badge">
                {reviewed ? "Reviewed" : "Review Required"}
              </div>
            </div>

            <div className="analysis-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetUpload}
              >
                Upload Another
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadDocument;
