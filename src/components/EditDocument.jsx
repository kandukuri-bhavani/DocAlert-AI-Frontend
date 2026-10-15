import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditDocument() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("https://docalert-ai-backend.onrender.com/api/documents", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (response) => {

        if (!response.ok) {
          throw new Error("Unable to load documents");
        }

        return response.json();
      })
      .then((documents) => {

        const document = documents.find(
          (item) =>
            String(item.id) === String(id)
        );

        if (!document) {
          throw new Error("Document not found");
        }

        setFormData({
          title: document.title || "",
          category: document.category || "",
          documentNumber:
            document.documentNumber || "",
          issueDate:
            document.issueDate || "",
          expiryDate:
            document.expiryDate || "",
          amount:
            document.amount ?? "",
          paymentDate:
            document.paymentDate || "",
          frequency:
            document.frequency || "",
          maturityDate:
            document.maturityDate || ""
        });

        setLoading(false);

      })
      .catch(() => {

        setMessage("Unable to load document.");
        setLoading(false);

      });

  }, [id, navigate]);


  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };


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
      documentNumber:
        formData.documentNumber || null,
      issueDate:
        formData.issueDate || null,
      expiryDate:
        formData.expiryDate || null,
      amount:
        formData.amount
          ? Number(formData.amount)
          : null,
      paymentDate:
        formData.paymentDate || null,
      frequency:
        formData.frequency || null,
      maturityDate:
        formData.maturityDate || null
    };

    try {

      const response = await fetch(
        `https://docalert-ai-backend.onrender.com/api/documents/${id}`,
        {
          method: "PUT",

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
            : "Unable to update document."
        );

        return;
      }

      setMessage(
        "Document updated successfully!"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);

    } catch (error) {

      setMessage(
        "Unable to connect to server."
      );
    }
  };


  if (loading) {

    return (
      <div className="add-document-page">

        <div className="add-document-card">

          <p className="loading">
            Loading document...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="add-document-page">

      <div className="add-document-card">

        <h1>Edit Document</h1>

        <p className="subtitle">
          Update your document details
        </p>


        <form onSubmit={handleSubmit}>

          {/* NAME */}

          <label>
            Document Name
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />


          {/* CATEGORY */}

          <label>
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
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


          {/* DOCUMENT NUMBER */}

          <label>
            Document Number
          </label>

          <input
            type="text"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleChange}
            placeholder={
              formData.category === "Bank Card"
                ? "Last 4 digits only"
                : "Enter document number"
            }
            maxLength={
              formData.category === "Bank Card"
                ? 4
                : undefined
            }
          />


          {/* ISSUE DATE */}

          <label>
            Issue Date
          </label>

          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
          />


          {/* EXPIRY DATE */}

          <label>
            Expiry Date
          </label>

          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
          />


          {/* AMOUNT */}

          <label>
            Amount
          </label>

          <input
            type="number"
            name="amount"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Example: 15000"
          />


          {/* PAYMENT DATE */}

          <label>
            Payment Date
          </label>

          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
          />


          {/* FREQUENCY */}

          <label>
            Payment Frequency
          </label>

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


          {/* MATURITY DATE */}

          <label>
            Maturity Date
          </label>

          <input
            type="date"
            name="maturityDate"
            value={formData.maturityDate}
            onChange={handleChange}
          />


          {/* BUTTONS */}

          <button
            type="submit"
            className="save-button"
          >
            Update Document
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Cancel
          </button>

        </form>


        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default EditDocument;
