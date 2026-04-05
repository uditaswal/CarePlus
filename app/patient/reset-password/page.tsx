import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

const ResetPasswordPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const userId = typeof searchParams.userId === "string" ? searchParams.userId : "";
  const secret = typeof searchParams.secret === "string" ? searchParams.secret : "";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5f3ff,_#f8fafc_45%,_#e2e8f0_100%)] px-4 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-700">
            CarePlus Security
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-slate-900">
            Set a new password.
          </h1>
          <p className="text-lg text-slate-600">
            Choose a new password to continue using your CarePlus portal
            securely.
          </p>
        </section>

        {userId && secret ? (
          <ResetPasswordForm userId={userId} secret={secret} />
        ) : (
          <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">
              Reset link is missing details
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Please open the full password reset link from your email, or
              request a new one.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ResetPasswordPage;
