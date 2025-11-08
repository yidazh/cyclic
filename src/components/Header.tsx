import { Link } from "@tanstack/react-router";

/**
 * Header Component
 * Navigation bar for the app
 */
export function Header() {
	return (
		<header className="bg-white dark:bg-gray-800 shadow">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Cyclic
					</h1>

					<nav className="flex gap-4">
						<Link
							to="/"
							className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
							activeProps={{
								className: "bg-gray-100 dark:bg-gray-700",
							}}
						>
							Current
						</Link>
						<Link
							to="/history"
							className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
							activeProps={{
								className: "bg-gray-100 dark:bg-gray-700",
							}}
						>
							History
						</Link>
						<Link
							to="/analytics"
							className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
							activeProps={{
								className: "bg-gray-100 dark:bg-gray-700",
							}}
						>
							Analytics
						</Link>
						<Link
							to="/timeline"
							className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
							activeProps={{
								className: "bg-gray-100 dark:bg-gray-700",
							}}
						>
							Timeline
						</Link>
						<Link
							to="/settings"
							className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
							activeProps={{
								className: "bg-gray-100 dark:bg-gray-700",
							}}
						>
							Settings
						</Link>
					</nav>
				</div>
			</div>
		</header>
	);
}
