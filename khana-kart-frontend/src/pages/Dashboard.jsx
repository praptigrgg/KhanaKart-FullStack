import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { role, name } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)) // yyyy-mm-dd

console.log('AuthContext in Dashboard:', { role, name });

  useEffect(() => {
    setLoading(true)
    api.get('/dashboard', { params: { date } })
      .then(res => {
        console.log('API Dashboard data:', res.data)  // <-- Correct place for logging API response
        setData(res.data)
      })
      .catch(err => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false))
  }, [date])
  
  if (loading) return <p style={{ textAlign: 'center', marginTop: 20 }}>Loading dashboard...</p>
  if (error) return <p style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{error}</p>

  // Prepare chart data for top items (admin)
  const chartData = data?.top_items?.map(item => ({
    name: item.name,
    orders: item.orders_count,
  })) || []

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{color:'#000000ff', borderBottom: '1px solid #886b56ff', paddingBottom: 10, textTransform: 'capitalize', marginBottom: 20 }}>
        Dashboard ({role})
      </h1>

      {role === 'admin' && (
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="date-picker" style={{ color:'#373737ff',fontWeight: 'bold', marginRight: 10 }}>
            Select Date:
          </label>
          <input
            id="date-picker"
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setDate(e.target.value)}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #765741ff' }}
          />
        </div>
      )}

      {data && (
        <>
          {role === 'admin' && (
            <>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 30 }}>
                {[{
                  label: 'Total Orders',
                  value: data.total_orders,
                }, {
                  label: 'Total Revenue (Rs.)',
                  value: data.total_revenue.toFixed(2),
                }, {
                  label: 'Pending Orders',
                  value: data.pending_orders,
                }, {
                  label: 'Total Users',
                  value: data.total_users,
                },
                {
                  label: 'Monthly Orders',
                  value: data.monthly_orders,
                },
                {
                  label: 'Monthly Revenue (Rs.)',
                  value: data.monthly_revenue.toFixed(2),
                },
                {
                  label: 'New Users This Month',
                  value: data.monthly_users,
                }].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      flex: '1 1 250px',
                      backgroundColor: '#a9734c',
                      color: '#ffffff',
                      padding: 20,
                      borderRadius: 8,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      textAlign: 'center',
                    }}
                  >
                    <h3 style={{ margin: 0 }}>{label}</h3>
                    <p style={{ fontSize: 24, margin: '8px 0 0', fontWeight: 'bold' }}>{value}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 40 }}>
                <h3>Top Menu Items by Orders</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} tickFormatter={(value) => Math.floor(value)} />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="#dbb294ff" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No data available for top items.</p>
                )}
              </div>

              <div>
                <h3>Recent Users</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>S.N.</th>
                      <th style={tableHeaderStyle}>Name</th>
                      <th style={tableHeaderStyle}>Email</th>
                      <th style={tableHeaderStyle}>Role</th>
                      <th style={tableHeaderStyle}>Joined On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users
                      .slice()
                      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                      .map((user, index) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={tableCellStyle}>{index + 1}</td>
                          <td style={tableCellStyle}>{user.name}</td>
                          <td style={tableCellStyle}>{user.email}</td>
                          <td style={tableCellStyle}>{user.role}</td>
                          <td style={tableCellStyle}>{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {role === 'waiter' && (
            <div style={cardStyle}>
              <h3>Orders Today</h3>
              <p style={statValueStyle}>{data.orders_today}</p>
              <h3>Pending Orders</h3>
              <p style={statValueStyle}>{data.pending_orders}</p>
              <h3>Recent Pending Orders</h3>
              <ul style={listStyle}>
                {data.recent_pending_orders.map((order, index) => (
                  <li key={order.id} style={listItemStyle}>
                    Order #{order.id} - {new Date(order.created_at).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {role === 'kitchen' && (
            <div style={cardStyle}>
              <h3>In Preparation</h3>
              <p style={statValueStyle}>{data.in_preparation}</p>
              <h3>Ready to Serve</h3>
              <p style={statValueStyle}>{data.ready_to_serve}</p>
              <h3>Served Today</h3>
              <p style={statValueStyle}>{data.served_today}</p>
              <h3>Recent Orders</h3>
              <ul style={listStyle}>
                {data.recent_orders.map((order, index) => (
                  <li key={order.id} style={listItemStyle}>
                    Order #{order.id} - Status: {order.status} - {new Date(order.updated_at).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const tableHeaderStyle = {
  borderBottom: '2px solid #ccc',
  textAlign: 'left',
  padding: '8px 12px',
  backgroundColor: '#a9734c',
  color:'#ffffffff',
}

const tableCellStyle = {
  padding: '8px 12px',
}

const cardStyle = {
  backgroundColor: '#6d4e39',
  color:'#ffff',
  padding: 20,
  borderRadius: 8,
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  maxWidth: 400,
  margin: 'auto',
  textAlign: 'center',
}

const statValueStyle = {
  fontSize: 36,
  fontWeight: 'bold',
  margin: '10px 0 20px',
  color: '#ffffffff',
}

const listStyle = {
  paddingLeft: '20px',
  listStyleType: 'none',
  fontSize: '14px',
}

const listItemStyle = {
  padding: '8px 0',
  borderBottom: '1px solid #ddd',
}
