import Link from 'next/link';

export default function Home() {
  return (
    <div className="px-4 py-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Restaurant Management</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <Link className="border rounded bg-white p-4 shadow-sm" href="/login">Login</Link>
        <Link className="border rounded bg-white p-4 shadow-sm" href="/super-admin">Super Admin</Link>
        <Link className="border rounded bg-white p-4 shadow-sm" href="/admin">Admin Dashboard</Link>
        <Link className="border rounded bg-white p-4 shadow-sm" href="/kitchen">Kitchen Panel</Link>
        <Link className="border rounded bg-white p-4 shadow-sm" href="/delivery">Delivery Panel</Link>
      </div>
    </div>
  );
}


