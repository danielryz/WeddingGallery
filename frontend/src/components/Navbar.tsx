import React from 'react'
import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <nav>
      <NavLink to="/gallery">Gallery</NavLink>
      <NavLink to="/add">Add photos/videos</NavLink>
      <NavLink to="/chat">LiveChat</NavLink>
      <NavLink to="/menu">Menu</NavLink>
    </nav>
  )
}

export default Navbar
