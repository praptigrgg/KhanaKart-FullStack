import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../api/client"

export default function PaymentQr() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusText, setStatusText] = useState("Waiting for payment...")

  useEffect(() => {
    let intervalId

    async function fetchOrder() {
      try {
        const res = await api.get(`/orders/${id}`)
        setOrder(res.data)
        if (res.data.status === "paid") {
          setStatusText("Payment complete ✅")
          clearInterval(intervalId)
        } else {
          setStatusText("Processing payment...")
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    // Start polling every 5 seconds
    intervalId = setInterval(fetchOrder, 5000)

    // Cleanup
    return () => clearInterval(intervalId)
  }, [id])

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>

  return (
    <div className="card" style={{ maxWidth: 400, margin: "20px auto", textAlign: "center" }}>
      <h2>Pay with QR</h2>
      <p>Order #{order?.id}</p>

      <img
        src="/qr.png"
        alt="QR Code"
        style={{ width: 250, height: 250, margin: "20px auto" }}
      />

      <p>{statusText}</p>

      <div style={{ marginTop: 20 }}>
        <button className="btn danger" onClick={() => navigate("/orders")}>
          Cancel
        </button>
      </div>
    </div>
  )
}
