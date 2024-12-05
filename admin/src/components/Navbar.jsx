import React from 'react'
import {assets} from '../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {

    const {aToken,setAToken} = useContext(AdminContext)

    const navigate = useNavigate();

    const logout = () => {
        navigate('/')
        aToken && setAToken('')
        aToken && localStorage.removeItem('aToken')
    }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-3 text-xs'>
        <img src={assets.admin_logo} alt="logo" className='w-36 sm:w-40 cursor-pointer' />
        <p className='px-2.5 py-0.5 rounded-full bg-primary text-white'>{ aToken ? "Admin" : "Doctor" }</p>
      </div>
      <button onClick={logout} className='bg-primary text-white text-sm px-8 py-2 rounded-lg cursor-pointer'>Logout</button>
    </div>
  )
}

export default Navbar
