import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Heart,
  Loader2,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import type { Donor } from "../types";
import {
  useAcceptInvitation,
  useCreateGuestCheckout,
  useGuestPayment,
  useInvitationPreview,
  usePayment,
} from "../api/hooks";
import { userToDonor } from "../api/adapters";
import { ApiError } from "../api/client";
import { PENDING_CHECKOUT_KEY } from "../paymentState";
import Confetti from "react-confetti";

type PendingCheckout = {
  paymentRequestId: string;
  guestCheckoutId?: string;
  verificationToken?: string;
  guestInput?: { name: string; email: string; amount: number; currency: "usd"; ministryTrackId: string; idempotencyKey: string; type: "one-time" };
};
type Payment = {
  status?: string;
  type?: string;
  amount?: number;
  currency?: string;
  failureReason?: string | null;
  guest?: { name?: string; email?: string };
  track?: { name?: string } | null;
  receipt?: { available?: boolean; url?: string | null };
};
const viewPayment = (value: unknown): Payment | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return (
    record.payment && typeof record.payment === "object"
      ? record.payment
      : record
  ) as Payment;
};
const message = (error: unknown) =>
  error instanceof ApiError
    ? (Array.isArray(error.details) ? error.details[0]?.message : undefined) ||
      error.message
    : error instanceof Error
      ? error.message
      : "The request could not be completed.";

export function AcceptInvitePage({
  onAccepted,
  onSignIn,
}: {
  onAccepted: (user: Donor) => void;
  onSignIn: () => void;
}) {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const preview = useInvitationPreview(token, !!token);
  const accept = useAcceptInvitation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmation: "",
  });
  const [error, setError] = useState("");
  useEffect(() => {
    if (preview.data?.invitation)
      setForm((v) => ({
        ...v,
        firstName: preview.data!.invitation.invitedFirstName,
        lastName: preview.data!.invitation.invitedLastName,
      }));
  }, [preview.data]);
  const invitation = preview.data?.invitation;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!invitation) return;
    if (!form.firstName.trim() || !form.lastName.trim())
      return setError("First and last name are required.");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(form.password))
      return setError(
        "Use 8–128 characters with uppercase, lowercase, and a number.",
      );
    if (form.password !== form.confirmation)
      return setError("The passwords do not match.");
    try {
      setError("");
      const result = await accept.mutateAsync({
        token,
        invitedFirstName: invitation.invitedFirstName,
        invitedLastName: invitation.invitedLastName,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
      });
      onAccepted(userToDonor(result.user));
    } catch (cause) {
      setError(message(cause));
    }
  };
  return (
    <Frame>
      <div className="grid overflow-hidden rounded-[32px] border bg-editorial-card shadow-xl lg:grid-cols-[.85fr_1.15fr]">
        <aside className="bg-editorial-charcoal p-8 text-editorial-cream md:p-12">
          <Heart className="h-10 w-10 text-rose-400" />
          <p className="mt-8 text-[9px] font-bold uppercase tracking-[.25em] text-editorial-cream/45">
            Invitation access
          </p>
          <h1 className="mt-3 font-serif text-4xl">
            Welcome to Better Life Friends
          </h1>
        </aside>
        <main className="p-8 md:p-12">
          <div className="flex gap-2 text-emerald-700">
            <LockKeyhole className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Secure account setup
            </span>
          </div>
          {!token ? (
            <InvalidInvite
              message="This invitation link is missing its token."
              onSignIn={onSignIn}
            />
          ) : preview.isLoading ? (
            <Loading label="Loading invitation…" />
          ) : preview.error || !invitation ? (
            <InvalidInvite
              message={message(preview.error)}
              onSignIn={onSignIn}
            />
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  value={form.firstName}
                  onChange={(firstName) =>
                    setForm((v) => ({ ...v, firstName }))
                  }
                />
                <Field
                  label="Last name"
                  value={form.lastName}
                  onChange={(lastName) => setForm((v) => ({ ...v, lastName }))}
                />
              </div>
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(password) => setForm((v) => ({ ...v, password }))}
              />
              <Field
                label="Confirm password"
                type="password"
                value={form.confirmation}
                onChange={(confirmation) =>
                  setForm((v) => ({ ...v, confirmation }))
                }
              />
              {error && (
                <p role="alert" className="text-xs text-rose-700">
                  {error}
                </p>
              )}
              <button
                disabled={accept.isPending}
                className="w-full rounded-full bg-editorial-charcoal py-3 text-xs font-bold uppercase tracking-widest text-editorial-cream disabled:opacity-40"
              >
                {accept.isPending ? "Activating…" : "Accept invitation"}
              </button>
            </form>
          )}
        </main>
      </div>
    </Frame>
  );
}

export function PaymentResultPage({
  outcome,
  onContinue,
  onTryAgain,
}: {
  outcome: "success" | "failure";
  onContinue: () => void | Promise<void>;
  onTryAgain: () => void | Promise<void>;
}) {
  const params = new URLSearchParams(window.location.search);
  const stored = pendingCheckout();
  const initialPaymentRequestId =
    params.get("payment_request_id") ||
    params.get("paymentRequestId") ||
    stored?.paymentRequestId ||
    "";
  const initialGuestCheckoutId =
    params.get("guest_checkout_id") ||
    params.get("guestCheckoutId") ||
    stored?.guestCheckoutId ||
    "";
  const [guestSession, setGuestSession] = useState(() => ({ checkoutId: initialGuestCheckoutId, paymentRequestId: initialPaymentRequestId, token: stored?.verificationToken || "" }));
  const paymentRequestId = guestSession.checkoutId ? guestSession.paymentRequestId : initialPaymentRequestId;
  const guestCheckoutId = guestSession.checkoutId;
  const isGuest = !!guestCheckoutId;
  const token = guestSession.token;
  const member = usePayment(
    paymentRequestId,
    outcome === "success" && !!paymentRequestId && !isGuest,
  );
  const guest = useGuestPayment(guestCheckoutId, token, isGuest && !!token);
  const renewGuestToken = useCreateGuestCheckout();
  const renewalStarted = useRef(false);
  const query = isGuest ? guest : member;
  const payment = viewPayment(query.data);
  const [copied, setCopied] = useState(false);
  const [receiptOpened, setReceiptOpened] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const receiptReady = !!payment?.receipt?.available && !!payment.receipt.url;
  const tokenExpired = guest.error instanceof ApiError && guest.error.status === 401;
  useEffect(() => {
    if (!isGuest || !tokenExpired || !stored?.guestInput || renewalStarted.current) return;
    renewalStarted.current = true;
    void renewGuestToken.mutateAsync(stored.guestInput).then(result => {
      const renewed = { ...stored, paymentRequestId: result.paymentRequestId, guestCheckoutId: result.guestCheckoutId, verificationToken: result.verificationToken };
      sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(renewed));
      setGuestSession({ checkoutId: result.guestCheckoutId, paymentRequestId: result.paymentRequestId, token: result.verificationToken });
    });
  }, [isGuest, renewGuestToken, stored, tokenExpired]);
  useEffect(() => {
    if (!isGuest || !receiptReady || receiptOpened) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [isGuest, receiptReady, receiptOpened]);
  const copy = async () => {
    if (!paymentRequestId) return;
    try {
      await navigator.clipboard.writeText(paymentRequestId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard unavailable. */
    }
  };
  if (!isGuest)
    return (
      <MemberResult
        outcome={outcome}
        payment={payment}
        paymentRequestId={paymentRequestId}
        onContinue={onContinue}
        onTryAgain={onTryAgain}
      />
    );
  if (!token)
    return (
      <Frame>
        <ResultCard>
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-600" />
          <h1 className="mt-5 font-serif text-3xl">
            Payment details unavailable
          </h1>
          <p className="mt-3 text-sm text-editorial-charcoal/60">
            This confirmation session has expired or was opened in a different
            browser. Check your email for Stripe’s receipt.
          </p>
          <PaymentId value={paymentRequestId} copied={copied} onCopy={copy} />
        </ResultCard>
      </Frame>
    );
  if (tokenExpired && !stored?.guestInput)
    return <Frame><ResultCard><AlertTriangle className="mx-auto h-12 w-12 text-amber-600" /><h1 className="mt-5 font-serif text-3xl">Confirmation link expired</h1><p className="mt-3 text-sm text-editorial-charcoal/60">We could not renew this guest confirmation because its original checkout details are unavailable. Check your email for Stripe’s receipt or contact support with the payment ID below.</p><PaymentId value={paymentRequestId} copied={copied} onCopy={copy} /></ResultCard></Frame>;
  const status = payment?.status || "pending";
  if (query.isLoading || status === "pending")
    return (
      <Frame>
        <ResultCard>
          <Loading label={tokenExpired ? "Renewing your confirmation…" : "Confirming your donation…"} />
          <p className="text-sm text-editorial-charcoal/60">
            Stripe is processing your return. This page will update
            automatically.
          </p>
          <PaymentId value={paymentRequestId} copied={copied} onCopy={copy} />
        </ResultCard>
      </Frame>
    );
  if (status === "failed" || status === "expired")
    return (
      <Frame>
        <ResultCard>
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-600" />
          <h1 className="mt-5 font-serif text-3xl">
            {status === "expired"
              ? "Checkout expired"
              : "Payment was not completed"}
          </h1>
          <p className="mt-3 text-sm text-editorial-charcoal/60">
            {payment?.failureReason ||
              "No donation was confirmed. You can start a new donation when ready."}
          </p>
          <PaymentId value={paymentRequestId} copied={copied} onCopy={copy} />
          <button
            onClick={() => void onTryAgain()}
            className="mt-7 rounded-full bg-editorial-charcoal px-6 py-3 text-xs font-bold uppercase tracking-widest text-editorial-cream"
          >
            <RefreshCw className="mr-2 inline h-4 w-4" />
            Try again
          </button>
        </ResultCard>
      </Frame>
    );
  return (
    <Frame>
      <ResultCard>
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" />
        <p className="mt-5 text-[9px] font-bold uppercase tracking-[.25em] text-emerald-700">
          Donation confirmed
        </p>
        <h1 className="mt-3 font-serif text-3xl">
          Thank you for your generosity
        </h1>
        <p className="mt-3 text-sm text-editorial-charcoal/60">
          {payment?.track?.name
            ? "Your gift to " + payment.track.name + " was received."
            : "Your gift was received."}
        </p>
        <Details payment={payment} />
        <PaymentId value={paymentRequestId} copied={copied} onCopy={copy} />
        <GuestReceiptActions
          receiptUrl={receiptReady ? payment!.receipt!.url! : null}
          receiptOpened={receiptOpened}
          showLeaveWarning={showLeaveWarning}
          onReceiptOpened={() => setReceiptOpened(true)}
          onRequestLeave={() => { if (receiptOpened) { sessionStorage.removeItem(PENDING_CHECKOUT_KEY); void onContinue(); } else setShowLeaveWarning(true); }}
          onCancelLeave={() => setShowLeaveWarning(false)}
          onConfirmLeave={() => { setShowLeaveWarning(false); sessionStorage.removeItem(PENDING_CHECKOUT_KEY); void onContinue(); }}
        />
      </ResultCard>
    </Frame>
  );
}

function Details({ payment }: { payment: Payment | null }) {
  return (
    <>
      {payment?.status === "completed" && <GentleConfetti />}
      <dl className="mt-6 grid gap-3 rounded-2xl bg-editorial-charcoal/5 p-4 text-left text-xs sm:grid-cols-2">
        <Detail
          label="Donation amount"
          value={
            typeof payment?.amount === "number"
              ? "$" +
                payment.amount.toLocaleString() +
                " " +
                (payment.currency?.toUpperCase() || "USD")
              : "—"
          }
        />
        <Detail label="Ministry track" value={payment?.track?.name || "—"} />
        <Detail label="Gift type" value={payment?.type || "One-time"} />
        <Detail
          label="Payment status"
          value={payment?.status || "Completed"}
          confirmed={payment?.status === "completed"}
        />
        {payment?.guest?.name && (
          <Detail label="Donor" value={payment.guest.name} />
        )}
        {payment?.guest?.email && (
          <Detail label="Receipt email" value={payment.guest.email} />
        )}
      </dl>
    </>
  );
}
function Detail({
  label,
  value,
  confirmed = false,
}: {
  label: string;
  value: string;
  confirmed?: boolean;
}) {
  return (
    <div>
      <dt className="text-editorial-charcoal/45">{label}</dt>
      <dd className="mt-1 flex items-center gap-1.5 font-bold">
        {value}
        {confirmed && (
          <Check className="h-4 w-4 text-emerald-700" aria-label="Completed" />
        )}
      </dd>
    </div>
  );
}
function GuestReceiptActions({ receiptUrl, receiptOpened, showLeaveWarning, onReceiptOpened, onRequestLeave, onCancelLeave, onConfirmLeave }: { receiptUrl: string | null; receiptOpened: boolean; showLeaveWarning: boolean; onReceiptOpened: () => void; onRequestLeave: () => void; onCancelLeave: () => void; onConfirmLeave: () => void }) {
  return <><div className="mt-7 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-left"><p className="text-xs font-bold text-editorial-charcoal">Save your receipt</p><p className="mt-1 text-[11px] leading-relaxed text-editorial-charcoal/60">Guest donations are not available in a member giving history. Open and save your Stripe receipt before leaving this page; otherwise, you will need to contact support to recover it.</p></div><div className="mt-5 flex flex-wrap justify-center gap-3">{receiptUrl ? <a href={receiptUrl} target="_blank" rel="noreferrer" onClick={onReceiptOpened} className="inline-flex items-center gap-2 rounded-full bg-editorial-charcoal px-6 py-3 text-xs font-bold uppercase tracking-widest text-editorial-cream"><ExternalLink className="h-4 w-4" />View receipt</a> : <span className="rounded-full border border-editorial-charcoal/15 px-5 py-3 text-xs text-editorial-charcoal/55">Receipt is still being prepared</span>}<button type="button" onClick={onRequestLeave} className="rounded-full border border-editorial-charcoal/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-editorial-charcoal">Back to homepage</button></div>{showLeaveWarning && <div role="dialog" aria-modal="true" aria-labelledby="receipt-warning-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"><div className="w-full max-w-md rounded-3xl bg-editorial-card p-6 text-left shadow-2xl"><AlertTriangle className="h-8 w-8 text-amber-600" /><h2 id="receipt-warning-title" className="mt-4 font-serif text-2xl">Save your receipt first</h2><p className="mt-3 text-sm leading-relaxed text-editorial-charcoal/65">This guest donation cannot be retrieved from an account later. Please open and save your Stripe receipt before continuing.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={onConfirmLeave} className="rounded-full border border-editorial-charcoal/20 px-4 py-2.5 text-xs font-bold text-editorial-charcoal">Leave without receipt</button><button type="button" onClick={onCancelLeave} autoFocus className="rounded-full bg-editorial-charcoal px-4 py-2.5 text-xs font-bold text-editorial-cream">Keep viewing receipt</button></div></div></div>}</>;
}
function GentleConfetti() {
  const measure = () => ({
    width: window.innerWidth,
    height: Math.max(window.innerHeight, document.documentElement.scrollHeight),
  });
  const [viewport, setViewport] = useState(measure);
  useEffect(() => {
    const update = () => setViewport(measure());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return (
    <Confetti
      aria-hidden
      width={viewport.width}
      height={viewport.height}
      numberOfPieces={42}
      recycle={false}
      gravity={0.08}
      initialVelocityY={9}
      colors={["#34d399", "#fcd34d", "#fda4af", "#7dd3fc", "#d6d3d1"]}
      className="pointer-events-none absolute inset-x-0 top-0 z-50"
    />
  );
}
function PaymentId({
  value,
  copied,
  onCopy,
}: {
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-editorial-charcoal/10 px-4 py-3 text-left">
      <p className="text-[10px] font-bold uppercase tracking-widest text-editorial-charcoal/45">
        Payment ID
      </p>
      <div className="mt-1 flex items-center gap-3">
        <code className="min-w-0 flex-1 truncate text-xs text-editorial-charcoal/75">
          {value || "Unavailable"}
        </code>
        <button
          type="button"
          onClick={onCopy}
          disabled={!value}
          aria-label="Copy payment ID"
          title="Copy payment ID"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-editorial-charcoal/20 disabled:opacity-50"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-700" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
function MemberResult({
  outcome,
  payment,
  paymentRequestId,
  onContinue,
  onTryAgain,
}: {
  outcome: "success" | "failure";
  payment: Payment | null;
  paymentRequestId: string;
  onContinue: () => void | Promise<void>;
  onTryAgain: () => void | Promise<void>;
}) {
  return (
    <Frame>
      <ResultCard>
        {outcome === "success" ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" />
            <h1 className="mt-5 font-serif text-3xl">
              Thank you for your generosity
            </h1>
            <Details payment={payment} />
            <button
              onClick={() => void onContinue()}
              className="mt-7 rounded-full bg-editorial-charcoal px-6 py-3 text-xs font-bold text-editorial-cream"
            >
              Continue to dashboard{" "}
              <ArrowRight className="ml-2 inline h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <AlertTriangle className="mx-auto h-12 w-12 text-rose-600" />
            <h1 className="mt-5 font-serif text-3xl">
              Your payment was not completed
            </h1>
            <button
              onClick={() => void onTryAgain()}
              className="mt-7 rounded-full bg-editorial-charcoal px-6 py-3 text-xs font-bold text-editorial-cream"
            >
              Try again
            </button>
          </>
        )}
        <p className="mt-5 text-[10px] text-editorial-charcoal/45">
          Payment request: <span className="font-mono">{paymentRequestId}</span>
        </p>
      </ResultCard>
    </Frame>
  );
}
function ResultCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl rounded-[32px] border border-editorial-charcoal/10 bg-editorial-card p-8 text-center shadow-xl md:p-12">
      {children}
    </main>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-xs font-bold">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border bg-transparent p-3 font-normal"
      />
    </label>
  );
}
function Loading({ label }: { label: string }) {
  return (
    <div className="py-10">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-700" />
      <p className="mt-4 text-sm font-bold">{label}</p>
    </div>
  );
}
function InvalidInvite({
  message,
  onSignIn,
}: {
  message: string;
  onSignIn: () => void;
}) {
  return (
    <div className="py-14 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" />
      <h2 className="mt-4 font-serif text-2xl">Invitation unavailable</h2>
      <p role="alert" className="mt-3 text-sm text-editorial-charcoal/60">
        {message}
      </p>
      <button
        onClick={onSignIn}
        className="mt-6 rounded-full border px-5 py-2.5 text-xs font-bold"
      >
        Go to sign in
      </button>
    </div>
  );
}
function pendingCheckout(): PendingCheckout | null {
  try {
    const raw =
      sessionStorage.getItem(PENDING_CHECKOUT_KEY) ||
      localStorage.getItem(PENDING_CHECKOUT_KEY);
    return raw ? (JSON.parse(raw) as PendingCheckout) : null;
  } catch {
    return null;
  }
}
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-editorial-cream px-4 py-10 text-editorial-charcoal sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-6xl text-center">
        <p className="font-serif text-2xl italic">Better Life Friends</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-[.2em] text-editorial-charcoal/45">
          Ministry Partner Portal
        </p>
      </div>
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}
