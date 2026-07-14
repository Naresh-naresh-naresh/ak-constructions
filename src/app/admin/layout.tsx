import AdminTopBar from "@/app/admin/AdminTopBar";
import Providers from "@/app/admin/Providers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-stone-50">
        <AdminTopBar />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </div>
    </Providers>
  );
}
