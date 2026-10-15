"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { submitLead } from "@/actions/submitLead";
import { buttonClass, ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { bookKinds, booking } from "@/lib/content/booking";
import { site } from "@/lib/content/site";
import type { ActiveZip } from "@/lib/lead/areas";
import {
  fieldErrorsFrom,
  leadFormSchema,
  parseLeadForm,
  type LeadFormState,
  type LeadKind,
} from "@/lib/validation/lead";

type Errors = Record<string, string>;

const pickerKinds: readonly LeadKind[] = [
  "emergency",
  "repair",
  "estimate",
  "tune_up",
];

const inputClass =
  "w-full rounded-field border border-line bg-paper p-[14px] text-[16px] leading-6 text-ink placeholder:text-mute aria-invalid:border-heat aria-invalid:border-[1.5px]";
const labelClass = "block text-[13px] font-medium leading-[18px] text-ink";
const errorClass = "mt-1.5 text-[13px] leading-[18px] text-heat";

function subscribeToSearch(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getSearchSnapshot(): string {
  return window.location.search;
}

function getServerSearchSnapshot(): string {
  return "";
}

function parseKindParam(search: string): LeadKind | null {
  const params = new URLSearchParams(search);
  const raw = params.get("type") ?? params.get("kind");
  if (!raw) return null;
  const mapped = raw === "membership" ? "membership_enquiry" : raw;
  return mapped in bookKinds ? (mapped as LeadKind) : null;
}

function parseUtm(search: string) {
  const params = new URLSearchParams(search);
  return {
    source: params.get("utm_source") ?? "",
    medium: params.get("utm_medium") ?? "",
    campaign: params.get("utm_campaign") ?? "",
  };
}

function focusFirstError(errors: Errors): void {
  const key = Object.keys(errors)[0];
  if (!key) return;
  const element =
    document.getElementById(key) ??
    document.querySelector<HTMLElement>(`input[name="${key}"]`);
  element?.focus();
}

function a11yProps(id: string, error?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

function Field({
  htmlFor,
  label,
  optional,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  optional?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {optional ? (
          <span className="font-normal text-mute"> ({optional})</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function BookingForm({
  activeZips,
  defaultKind = "repair",
}: {
  activeZips: ActiveZip[];
  defaultKind?: LeadKind;
}) {
  const [state, formAction, isPending] = useActionState(submitLead, null);
  const search = useSyncExternalStore(
    subscribeToSearch,
    getSearchSnapshot,
    getServerSearchSnapshot,
  );
  const [kindOverride, setKindOverride] = useState<LeadKind | null>(null);
  const [zip, setZip] = useState("");
  const [clientErrors, setClientErrors] = useState<Errors | null>(null);
  const [dismissedState, setDismissedState] = useState<LeadFormState>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const kind = kindOverride ?? parseKindParam(search) ?? defaultKind;
  const utm = parseUtm(search);

  useEffect(() => {
    if (!turnstileKey) return;
    if (
      document.querySelector(
        'script[src*="challenges.cloudflare.com/turnstile"]',
      )
    ) {
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    document.head.appendChild(script);
  }, [turnstileKey]);

  useEffect(() => {
    if (state && !state.ok && state.code === "invalid" && state.fieldErrors) {
      focusFirstError(state.fieldErrors);
    }
  }, [state]);

  const serverErrors: Errors =
    state && !state.ok && state.code === "invalid"
      ? (state.fieldErrors ?? {})
      : {};
  const errors: Errors = clientErrors ?? (isPending ? {} : serverErrors);
  const errorCount = Object.keys(errors).length;
  const firstError = Object.values(errors)[0];

  const success =
    state?.ok && state.referenceCode && state !== dismissedState ? state : null;

  const copy = bookKinds[kind];
  const isEmergency = kind === "emergency";
  const zipIsFull = /^\d{5}$/.test(zip);
  const zipCity = activeZips.find((area) => area.zip === zip)?.city;
  const zipServed = zipIsFull && Boolean(zipCity);
  const zipOutside = zipIsFull && !zipServed;

  const handleSubmit = (formData: FormData) => {
    const parsed = leadFormSchema.safeParse(parseLeadForm(formData));
    if (!parsed.success) {
      const nextErrors = fieldErrorsFrom(parsed.error);
      setClientErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }
    setClientErrors(null);
    formAction(formData);
  };

  const reset = () => {
    setDismissedState(state);
    setKindOverride(null);
    setClientErrors(null);
    setZip("");
    formRef.current?.reset();
  };

  if (success) {
    return (
      <section
        aria-live="polite"
        className="mx-auto max-w-[720px] rounded-panel border border-line bg-paper p-6 sm:p-10"
      >
        <Eyebrow>
          {success.code === "duplicate"
            ? booking.success.duplicateEyebrow
            : booking.success.eyebrow}
        </Eyebrow>
        <h2 className="mt-2 font-display text-[30px] leading-[36px] font-semibold text-ink md:text-[36px] md:leading-[42px]">
          {success.code === "duplicate"
            ? booking.success.duplicateTitle
            : booking.success.title}
        </h2>
        {success.message ? (
          <p className="mt-3 max-w-[560px] text-[16px] leading-[24px] text-soft">
            {success.message}
          </p>
        ) : null}
        <p className="mt-5 inline-block rounded-field bg-sand px-4 py-3 text-[15px] leading-[22px] text-ink">
          Reference{" "}
          <span className="font-semibold">{success.referenceCode}</span>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={site.phoneHref} variant="primary">
            Call {site.phoneDisplay}
          </ButtonLink>
          <button
            type="button"
            onClick={reset}
            className={buttonClass("ghost")}
          >
            {booking.success.again}
          </button>
        </div>
      </section>
    );
  }

  const zipSub = zipIsFull
    ? zipCity
      ? booking.stepZipServed(zip, zipCity)
      : booking.stepZipOutside(zip)
    : booking.stepZipIdle;

  const steps: {
    n: number;
    label: string;
    sub: string;
    active: boolean;
    subError: boolean;
  }[] = [
    {
      n: 1,
      label: booking.stepZipLabel,
      sub: zipSub,
      active: zipServed,
      subError: zipOutside,
    },
    {
      n: 2,
      label: copy.chipLabel,
      sub: copy.stepSub,
      active: true,
      subError: false,
    },
    {
      n: 3,
      label: booking.stepDetailsLabel,
      sub:
        firstError ??
        (isEmergency
          ? booking.stepDetailsEmergency
          : booking.stepDetailsVisit),
      active: !firstError,
      subError: Boolean(firstError),
    },
  ];

  const banner =
    state && !state.ok && state.code !== "invalid" && state.message
      ? state.message
      : null;

  return (
    <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:gap-10">
      <div className="lg:w-[360px] lg:shrink-0">
        <Eyebrow>BOOKING</Eyebrow>
        <h1 className="mt-1.5 font-display text-[32px] leading-[38px] font-semibold text-ink">
          {errorCount > 0 ? booking.headingFix(errorCount) : booking.heading}
        </h1>
        <ol className="mt-6 flex flex-col gap-4">
          {steps.map((step) => (
            <li key={step.n} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold ${
                  step.active
                    ? "border-cedar bg-cedar text-paper"
                    : "border-line bg-paper text-ink"
                }`}
              >
                {step.n}
              </span>
              <span className="pt-0.5">
                <span className="block text-[15px] leading-5 font-semibold text-ink">
                  {step.label}
                </span>
                <span
                  className={`block text-[13px] leading-[18px] ${
                    step.subError ? "text-heat" : "text-mute"
                  }`}
                >
                  {step.sub}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="min-w-0 flex-1">
        {banner ? (
          <div
            role="alert"
            className="mb-4 rounded-field border border-heat/40 bg-heat/10 px-4 py-3 text-[14px] leading-[20px] text-heat"
          >
            {banner}
            {state?.code === "rate_limited" ? (
              <>
                {" "}
                <a
                  href={site.phoneHref}
                  className="font-medium underline underline-offset-2"
                >
                  Call {site.phoneDisplay}
                </a>
              </>
            ) : null}
          </div>
        ) : null}

        <form
          ref={formRef}
          action={handleSubmit}
          noValidate
          className="flex flex-col gap-5 rounded-panel border border-line bg-paper p-6"
        >
          <fieldset className="m-0 border-0 p-0">
            <legend className={labelClass}>{booking.labels.kind}</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {pickerKinds.map((value) => {
                const selected = kind === value;
                const option = bookKinds[value];
                return (
                  <label key={value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="kind"
                      value={value}
                      checked={selected}
                      onChange={() => {
                        setKindOverride(value);
                        setClientErrors(null);
                      }}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex min-h-11 flex-col justify-center rounded-chip border px-4 py-3 text-left transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-copper ${
                        selected
                          ? "border-cedar bg-cedar"
                          : "border-line bg-sand"
                      }`}
                    >
                      <span
                        className={`text-[15px] leading-5 font-semibold ${
                          selected ? "text-paper" : "text-ink"
                        }`}
                      >
                        {option.chipLabel}
                      </span>
                      <span
                        className={`mt-0.5 text-[13px] leading-[18px] ${
                          selected ? "text-paper/80" : "text-mute"
                        }`}
                      >
                        {option.stepSub}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {!pickerKinds.includes(kind) ? (
              <input type="hidden" name="kind" value={kind} />
            ) : null}
          </fieldset>

          <div>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <p className="mt-1 font-display text-[28px] leading-[34px] font-semibold text-ink">
              {copy.title}
            </p>
          </div>

          <Field
            htmlFor="name"
            label={booking.labels.name}
            error={errors.name}
          >
            <input
              {...a11yProps("name", errors.name)}
              name="name"
              type="text"
              autoComplete="name"
              placeholder={booking.placeholders.name}
              className={inputClass}
            />
          </Field>

          <Field
            htmlFor="phone"
            label={booking.labels.phone}
            error={errors.phone}
          >
            <input
              {...a11yProps("phone", errors.phone)}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={booking.placeholders.phone}
              className={inputClass}
            />
          </Field>

          <Field
            htmlFor="zip"
            label={booking.labels.zip}
            error={errors.zip}
          >
            <input
              {...a11yProps("zip", errors.zip)}
              name="zip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              autoComplete="postal-code"
              placeholder={booking.placeholders.zip}
              value={zip}
              onChange={(event) => setZip(event.target.value)}
              className={inputClass}
            />
            {zipOutside ? (
              <p className="mt-2 rounded-field bg-sand px-3 py-2 text-[13px] leading-[18px] text-ink">
                {booking.zipWarning(zip)}{" "}
                <a
                  href={site.phoneHref}
                  className="font-medium text-cedar underline underline-offset-2"
                >
                  Call {site.phoneDisplay}
                </a>
              </p>
            ) : null}
          </Field>

          {!isEmergency ? (
            <>
              <Field
                htmlFor="email"
                label={booking.labels.email}
                optional={booking.labels.optional}
                error={errors.email}
              >
                <input
                  {...a11yProps("email", errors.email)}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={booking.placeholders.email}
                  className={inputClass}
                />
              </Field>

              <Field
                htmlFor="address"
                label={booking.labels.address}
                optional={
                  kind === "estimate" ? undefined : booking.labels.optional
                }
                error={errors.address}
              >
                <input
                  {...a11yProps("address", errors.address)}
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder={booking.placeholders.address}
                  className={inputClass}
                />
              </Field>

              <Field
                htmlFor="preferred_day"
                label={booking.labels.preferredDay}
                optional={booking.labels.optional}
                error={errors.preferred_day}
              >
                <input
                  {...a11yProps("preferred_day", errors.preferred_day)}
                  name="preferred_day"
                  type="date"
                  className={inputClass}
                />
              </Field>

              <fieldset className="m-0 border-0 p-0">
                <legend className={labelClass}>
                  {booking.labels.preferredWindow}
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {booking.windows.map((option) => (
                    <label
                      key={option.value}
                      className="relative inline-flex cursor-pointer items-center"
                    >
                      <input
                        type="radio"
                        name="preferred_window"
                        value={option.value}
                        className="peer sr-only"
                      />
                      <span className="inline-flex min-h-11 items-center rounded-full border border-line bg-sand px-3 py-2 text-[13px] font-medium text-ink transition-colors peer-checked:border-cedar peer-checked:bg-cedar peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-copper">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.preferred_window ? (
                  <p
                    id="preferred_window-error"
                    role="alert"
                    className={errorClass}
                  >
                    {errors.preferred_window}
                  </p>
                ) : null}
              </fieldset>
            </>
          ) : null}

          <Field
            htmlFor="issue"
            label={
              isEmergency
                ? booking.labels.issue.emergency
                : booking.labels.issue.other
            }
            optional={isEmergency ? undefined : booking.labels.optional}
            error={errors.issue}
          >
            <textarea
              {...a11yProps("issue", errors.issue)}
              name="issue"
              rows={3}
              placeholder={booking.placeholders.issue}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <div className="flex flex-col gap-3 border-t border-line pt-4">
            <label className="flex items-start gap-3 text-[14px] leading-[20px] text-ink">
              <input
                type="checkbox"
                name="consent_email"
                defaultChecked
                className="mt-0.5 h-5 w-5 shrink-0 accent-cedar"
              />
              {booking.labels.consentEmail}
            </label>
            <label className="flex items-start gap-3 text-[14px] leading-[20px] text-mute">
              <input
                type="checkbox"
                name="consent_sms"
                disabled
                className="mt-0.5 h-5 w-5 shrink-0 accent-cedar"
              />
              {booking.labels.consentSms}
            </label>
          </div>

          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px overflow-hidden"
          >
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <input type="hidden" name="utm_source" value={utm.source} readOnly />
          <input type="hidden" name="utm_medium" value={utm.medium} readOnly />
          <input
            type="hidden"
            name="utm_campaign"
            value={utm.campaign}
            readOnly
          />

          {turnstileKey ? (
            <div
              className="cf-turnstile"
              data-sitekey={turnstileKey}
              data-size="flexible"
            />
          ) : null}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className={`${buttonClass("primary", "w-full sm:w-auto disabled:opacity-60")}`}
            >
              {isPending
                ? "Sending..."
                : errorCount > 0
                  ? "Fix and send"
                  : copy.submitLabel}
            </button>
            <p className="mt-3 text-[14px] leading-[20px] text-mute">
              Rather talk now?{" "}
              <a
                href={site.phoneHref}
                className="font-medium text-cedar underline underline-offset-2"
              >
                {site.phoneDisplay}
              </a>{" "}
              — answered around the clock.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
