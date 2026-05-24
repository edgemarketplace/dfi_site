import React from 'react'

function ErrorOverride({ statusCode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'screen', fontFamily: 'sans-serif' }}>
      <p>{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</p>
    </div>
  )
}

ErrorOverride.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorOverride
