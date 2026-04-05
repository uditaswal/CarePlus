import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_45%,_#e2e8f0_100%)] px-4 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            CarePlus Support
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-slate-900">
            Get back into your account.
          </h1>
          <p className="text-lg text-slate-600">
            We&apos;ll send a secure reset link so you can choose a new password
            and get back to your appointments and health records.
          </p>
        </section>

        <ForgotPasswordForm />
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
