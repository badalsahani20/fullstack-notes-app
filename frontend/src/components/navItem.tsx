import { NavLink } from 'react-router-dom'
const NavItem = ({ to, icon: Icon, label }: { to: string, icon:any, label:string}) => (
  <NavLink
    to={to}
    className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
        ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}
        `}
        >
            <Icon size={18} />
            <span className='text-sm font-medium'>{label}</span>
  </NavLink>
)

export default NavItem;
