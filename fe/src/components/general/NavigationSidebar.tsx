import { useState, type ReactNode } from 'react'
import { NavLink, type NavLinkRenderProps } from 'react-router-dom'
import {
	MdImageSearch,
	MdFavoriteBorder,
	MdOutlineAdminPanelSettings,
	MdOutlineBookmarkAdd,
	MdOutlineCalendarViewWeek,
	MdOutlineCalendarViewMonth
} from 'react-icons/md'
import { GiCalendarHalfYear } from "react-icons/gi"
import { TiTickOutline } from "react-icons/ti"
import { GrOverview } from 'react-icons/gr'
import Button from '@/components/general/UI/Button'
import AdminPanelContent from '@/components/general/AdminPanelContent'
import { RiCloseFill } from 'react-icons/ri'

function renderNavLink(icon: ReactNode, label: string) {
  return ({ isActive }: NavLinkRenderProps) => (
    <>
      <span className="text-white hover:text-sky-200">{icon}</span>
      <span className="text-white hover:text-sky-200">{label}</span>
      {isActive ? <TiTickOutline className="text-white hover:text-sky-200" /> : null}
    </>
  );
}

export default function NavigationSidebar() {
  const [isOpenPanel, setIsOpenPanel] = useState(false)

  const openPanel = () => {
    setIsOpenPanel(true);
  }

  return (
    <div className="relative flex h-full min-h-0 flex-shrink-0 items-center">
    <nav className="z-10 mr-4 flex h-[95vh] flex-shrink-0 flex-col rounded-r-xl bg-sky-600 px-6 py-8 text-sky-50 min-w-[230px]">
		  <h2 className="font-bold uppercase text-xl text-sky-200 flex items-center space-x-2 mb-4">
				<GrOverview />
				<span>Dashboard</span>
			</h2>
			<hr />
			<div className="flex flex-col mb-6 pl-6 gap-2 pt-4 text-lg text-white">
				<NavLink
					to="/week"
					className="flex items-center space-x-2"
					children={renderNavLink(
						<MdOutlineCalendarViewWeek className="text-white hover:text-sky-200" />,
						'Week',
					)}
				/>
				<NavLink
					to="/month"
					className="flex items-center space-x-2"
					children={renderNavLink(
						<MdOutlineCalendarViewMonth className="text-white hover:text-sky-200" />,
						'Month',
					)}
				/>
				<NavLink
					to="/year"
					className="flex items-center space-x-2"
					children={renderNavLink(
						<GiCalendarHalfYear className="text-white hover:text-sky-200" />,
						'Year',
					)}
				/>
			</div>
			<hr />
			<div className="flex flex-col mb-6 pl-6 gap-2 pt-4 text-lg text-white">
				<NavLink
					to="/search"
					className="flex items-center space-x-2"
					children={renderNavLink(
						<MdImageSearch className="text-white hover:text-sky-200" />,
						'Search',
					)}
				/>
				<NavLink
					to="/favorite"
					className="flex items-center space-x-2"
					children={renderNavLink(
						<MdFavoriteBorder className="text-white hover:text-sky-200" />,
						'Favorite',
					)}
				/>
				<NavLink
					to="/add"
					className="flex items-center space-x-2"
					children={renderNavLink(
						<MdOutlineBookmarkAdd className="text-white hover:text-sky-200" />,
						'Add Workout',
					)}
				/>
			</div>
			<hr />
			<div className="mt-auto flex justify-center mb-4">
				<Button
					onClick={openPanel}
					dark
				>
					<MdOutlineAdminPanelSettings className="text-white hover:text-sky-200" />&nbsp;
					<span className="text-white hover:text-sky-200">Admin Panel</span>
				</Button>
			</div>
    </nav>
    {isOpenPanel ? (
      <>
        <button
          type="button"
          aria-label="Close admin panel"
          className="fixed inset-0 z-20 bg-black/40"
          onClick={() => setIsOpenPanel(false)}
        />
        <aside
          className="fixed inset-y-0 right-0 z-30 flex w-1/5 min-w-0 flex-col border-l border-sky-200 bg-sky-50 text-sky-900 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-sky-200 px-4 py-3">
            <h3 className="text-lg font-semibold">Admin Panel</h3>
            <button
              type="button"
              className="rounded px-2 py-1 text-2xl leading-none text-sky-700 hover:bg-sky-200/60"
              aria-label="Close"
              onClick={() => setIsOpenPanel(false)}
            >
			  <RiCloseFill className="h-6 w-6" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <AdminPanelContent />
          </div>
        </aside>
      </>
    ) : null}
    </div>
  );
};
