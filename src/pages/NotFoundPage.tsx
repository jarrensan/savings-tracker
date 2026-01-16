import React from 'react'
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col gap-2">
        404 Not Found

        <Link to="/">Home from Link</Link>
        <a href="/">Home from a</a>
    </div>
  )
}

export default NotFoundPage