import React from 'react'

const Header: React.FC = () => {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '2rem 0',
      textAlign: 'center',
      marginBottom: '2rem'
    }}>
      <div className="container">
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          EscapeScout
        </h1>
        <p style={{
          fontSize: '1.2rem',
          opacity: 0.9
        }}>
          Discover amazing weekend destinations from Chicago
        </p>
      </div>
    </header>
  )
}

export default Header