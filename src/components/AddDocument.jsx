import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddDocument() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    documentNumber: "",
    issueDate: "",
    expiryDate: "",
    amount: "",
    paymentDate: "",
    frequency: "",
    maturityDate: ""
  });

  const [message, setMessage] = useState("");

  // Handle normal input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    const value = e.target.value;

    setCategory(value);

    setFormData((previousData) => ({
      ...previousData,
      category: value,

      // Clear category-specific values when category changes
      documentNumber: "",
      issueDate: "",
      expiryDate: "",
      amount: "",
      paymentDate: "",
      frequency: "",
      maturityDate: ""
    }));
  };

  // Submit document
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const dataToSend = {
      title: formData.title,
      category: formData.category,
      documentNumber: formData.documentNumber || null,
      issueDate: formData.issueDate || null,
      expiryDate: formData.expiryDate || null,
      amount: formData.amount
        ? Number(formData.amount)
        : null,
      paymentDate: formData.paymentDate || null,
      frequency: formData.frequency || null,
      maturityDate: formData.maturityDate || null
    };

    try {
      const response = await fetch(
        "https://docalert-ai-backend.onrender.com/api/documents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dataToSend)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          typeof data === "string"
            ? data
            : "Unable to save document"
        );
        return;
      }

      setMessage("Document added successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      setMessage("Unable to connect to the server");
    }
  };

  return (
    <div className="add-document-page">

      <div className="add-document-card">

        <h1>Add Document</h1>

        <p className="subtitle">
          Add your important document or payment details
        </p>

        <form onSubmit={handleSubmit}>

          {/* DOCUMENT NAME */}

          <label>Document Name</label>

          <input
            type="text"
            name="title"
            placeholder="Example: HDFC Life Insurance"
            value={formData.title}
            onChange={handleChange}
            required
          />


          {/* CATEGORY */}

          <label>Category</label>

          <select
            value={category}
            onChange={handleCategoryChange}
            required
          >
            <option value="">
              Select Category
            </option>

            <option value="Insurance">
              Insurance
            </option>

            <option value="Fixed Deposit">
              Fixed Deposit
            </option>

            <option value="Recurring Payment">
              Recurring Payment
            </option>

            <option value="Driving Licence">
              Driving Licence
            </option>

            <option value="Vehicle">
              Vehicle
            </option>

            <option value="Bank Card">
              Bank Card
            </option>

            <option value="Education">
              Education
            </option>

            <option value="Health">
              Health
            </option>

            <option value="Government">
              Government
            </option>

            <option value="Other">
              Other
            </option>
          </select>


          {/* COMMON DOCUMENT NUMBER */}

          {category !== "Bank Card" && (
            <>
              <label>Document Number</label>

              <input
                type="text"
                name="documentNumber"
                placeholder="Enter document number"
                value={formData.documentNumber}
                onChange={handleChange}
              />
            </>
          )}


          {/* INSURANCE */}

          {category === "Insurance" && (
            <div className="category-fields">

              <h3>Insurance Details</h3>

              <label>Premium Amount</label>

              <input
                type="number"
                name="amount"
                placeholder="Example: 15000"
                min="0"
                value={formData.amount}
                onChange={handleChange}
              />

              <label>Premium Payment Date</label>

              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
              />

              <label>Policy Expiry Date</label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />

            </div>
          )}


          {/* FIXED DEPOSIT */}

          {category === "Fixed Deposit" && (
            <div className="category-fields">

              <h3>Fixed Deposit Details</h3>

              <label>Deposit Amount</label>

              <input
                type="number"
                name="amount"
                placeholder="Example: 100000"
                min="0"
                value={formData.amount}
                onChange={handleChange}
              />

              <label>Maturity Date</label>

              <input
                type="date"
                name="maturityDate"
                value={formData.maturityDate}
                onChange={handleChange}
              />

            </div>
          )}


          {/* RECURRING PAYMENT */}

          {category === "Recurring Payment" && (
            <div className="category-fields">

              <h3>Recurring Payment Details</h3>

              <label>Payment Amount</label>

              <input
                type="number"
                name="amount"
                placeholder="Example: 2500"
                min="0"
                value={formData.amount}
                onChange={handleChange}
              />

              <label>Next Payment Date</label>

              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
              />

              <label>Payment Frequency</label>

              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                <option value="">
                  Select Frequency
                </option>

                <option value="Monthly">
                  Monthly
                </option>

                <option value="Quarterly">
                  Quarterly
                </option>

                <option value="Half-Yearly">
                  Half-Yearly
                </option>

                <option value="Yearly">
                  Yearly
                </option>
              </select>

            </div>
          )}


          {/* DRIVING LICENCE */}

          {category === "Driving Licence" && (
            <div className="category-fields">

              <h3>Driving Licence Details</h3>

              <label>Issue Date</label>

              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
              />

              <label>Expiry Date</label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />

            </div>
          )}


          {/* VEHICLE */}

          {category === "Vehicle" && (
            <div className="category-fields">

              <h3>Vehicle Details</h3>

              <label>Registration Number</label>

              <input
                type="text"
                name="documentNumber"
                placeholder="Example: TS09AB1234"
                value={formData.documentNumber}
                onChange={handleChange}
              />

              <label>Insurance Expiry</label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />

            </div>
          )}


          {/* BANK CARD */}

          {category === "Bank Card" && (
            <div className="category-fields">

              <h3>Bank Card Details</h3>

              <label>Last 4 Digits</label>

              <input
                type="text"
                name="documentNumber"
                maxLength="4"
                pattern="[0-9]{4}"
                placeholder="Example: 4821"
                value={formData.documentNumber}
                onChange={handleChange}
              />

              <p>
                For security, do not enter the full card
                number, CVV, PIN or OTP.
              </p>

              <label>Card Expiry Date</label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />

            </div>
          )}


          {/* EDUCATION */}

          {category === "Education" && (
            <div className="category-fields">

              <h3>Education Document</h3>

              <label>Issue Date</label>

              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
              />

            </div>
          )}


          {/* HEALTH */}

          {category === "Health" && (
            <div className="category-fields">

              <h3>Health Document</h3>

              <label>Issue Date</label>

              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
              />

              <label>Expiry Date</label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />

            </div>
          )}


          {/* GOVERNMENT */}

          {category === "Government" && (
            <div className="category-fields">

              <h3>Government Document</h3>

              <label>Issue Date</label>

              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
              />

              <label>Expiry Date</label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />

            </div>
          )}


          {/* OTHER */}

          {category === "Other" && (
            <div className="category-fields">

              <h3>Document Details</h3>

              <label>Issue Date</label>

              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
              />

              <label>Expiry Date</label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />

            </div>
          )}


          {/* BUTTONS */}

          <button
            type="submit"
            className="save-button"
          >
            Save Document
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

        </form>


        {/* MESSAGE */}

        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default AddDocument;
