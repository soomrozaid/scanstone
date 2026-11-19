"use client";

import { useId } from "react";
import { Input, Label } from "@/components/ui";
import {
  emailPayload,
  phonePayload,
  smsPayload,
  vcardPayload,
  wifiPayload,
} from "@/lib/qr/payloads";

/** Static QR types other than a plain link. All are encoded straight into the code. */
export type StaticKind = "text" | "wifi" | "vcard" | "email" | "sms" | "phone";

export const STATIC_KIND_LABELS: Record<StaticKind, string> = {
  wifi: "WiFi",
  vcard: "Contact",
  text: "Text",
  email: "Email",
  sms: "SMS",
  phone: "Phone",
};

export type StaticValues = {
  text: string;
  wifi: { ssid: string; password: string; security: "WPA" | "WEP" | "nopass" };
  vcard: {
    firstName: string;
    lastName: string;
    organization: string;
    phone: string;
    email: string;
    website: string;
  };
  email: { to: string; subject: string; body: string };
  sms: { number: string; message: string };
  phone: { number: string };
};

export const EMPTY_STATIC_VALUES: StaticValues = {
  text: "",
  wifi: { ssid: "", password: "", security: "WPA" },
  vcard: {
    firstName: "",
    lastName: "",
    organization: "",
    phone: "",
    email: "",
    website: "",
  },
  email: { to: "", subject: "", body: "" },
  sms: { number: "", message: "" },
  phone: { number: "" },
};

/** The text a static code of this kind encodes, or "" while it isn't filled in enough to scan. */
export function staticPayload(kind: StaticKind, v: StaticValues): string {
  try {
    switch (kind) {
      case "text":
        return v.text.trim();
      case "wifi":
        return v.wifi.ssid
          ? wifiPayload({
              ...v.wifi,
              security: v.wifi.password ? v.wifi.security : "nopass",
            })
          : "";
      case "vcard":
        return v.vcard.firstName || v.vcard.lastName ? vcardPayload(v.vcard) : "";
      case "email":
        return /\S+@\S+\.\S+/.test(v.email.to) ? emailPayload(v.email) : "";
      case "sms":
        return v.sms.number.replace(/\D/g, "").length >= 3 ? smsPayload(v.sms) : "";
      case "phone":
        return v.phone.number.replace(/\D/g, "").length >= 3
          ? phonePayload(v.phone.number)
          : "";
    }
  } catch {
    return "";
  }
}

const textareaClass =
  "w-full rounded-md border border-line bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-verdigris";

export function StaticFields({
  kind,
  values,
  onChange,
  maxLength = 1600,
}: {
  kind: StaticKind;
  values: StaticValues;
  onChange: (next: StaticValues) => void;
  maxLength?: number;
}) {
  const id = useId();
  const f = (name: string) => `${id}-${name}`;
  const set = <K extends keyof StaticValues>(key: K, value: StaticValues[K]) =>
    onChange({ ...values, [key]: value });

  if (kind === "text") {
    return (
      <div>
        <Label htmlFor={f("text")}>Text</Label>
        <textarea
          id={f("text")}
          value={values.text}
          onChange={(e) => set("text", e.target.value)}
          rows={3}
          maxLength={maxLength}
          placeholder="A message, a serial number, a note"
          className={textareaClass}
        />
      </div>
    );
  }

  if (kind === "wifi") {
    const w = values.wifi;
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={f("ssid")}>Network name (SSID)</Label>
          <Input
            id={f("ssid")}
            value={w.ssid}
            autoComplete="off"
            onChange={(e) => set("wifi", { ...w, ssid: e.target.value })}
            placeholder="CafeGuest"
          />
        </div>
        <div>
          <Label htmlFor={f("pass")}>Password</Label>
          <Input
            id={f("pass")}
            value={w.password}
            autoComplete="off"
            onChange={(e) => set("wifi", { ...w, password: e.target.value })}
            placeholder="Leave empty if there isn't one"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={f("sec")}>Security</Label>
          <select
            id={f("sec")}
            value={w.security}
            onChange={(e) =>
              set("wifi", {
                ...w,
                security: e.target.value as StaticValues["wifi"]["security"],
              })
            }
            className="min-h-11 w-full rounded-md border border-line bg-white/70 px-3 text-sm text-ink focus:border-verdigris"
          >
            <option value="WPA">WPA or WPA2 (most networks)</option>
            <option value="WEP">WEP (older routers)</option>
            <option value="nopass">None (open network)</option>
          </select>
        </div>
        <p className="text-xs text-ink-faint sm:col-span-2">
          Guests point their camera and join. The password is stored in the
          code itself and never sent to us.
        </p>
      </div>
    );
  }

  if (kind === "vcard") {
    const c = values.vcard;
    const field = (
      key: keyof StaticValues["vcard"],
      label: string,
      type: string = "text",
      autoComplete?: string,
    ) => (
      <div>
        <Label htmlFor={f(key)}>{label}</Label>
        <Input
          id={f(key)}
          type={type}
          autoComplete={autoComplete}
          value={c[key]}
          onChange={(e) => set("vcard", { ...c, [key]: e.target.value })}
        />
      </div>
    );
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {field("firstName", "First name", "text", "given-name")}
        {field("lastName", "Last name", "text", "family-name")}
        {field("phone", "Phone", "tel", "tel")}
        {field("email", "Email", "email", "email")}
        {field("organization", "Company", "text", "organization")}
        {field("website", "Website", "url", "url")}
      </div>
    );
  }

  if (kind === "email") {
    const m = values.email;
    return (
      <div className="grid gap-4">
        <div>
          <Label htmlFor={f("to")}>Send to</Label>
          <Input
            id={f("to")}
            type="email"
            value={m.to}
            onChange={(e) => set("email", { ...m, to: e.target.value })}
            placeholder="hello@yourcafe.ca"
          />
        </div>
        <div>
          <Label htmlFor={f("subject")}>Subject (optional)</Label>
          <Input
            id={f("subject")}
            value={m.subject}
            onChange={(e) => set("email", { ...m, subject: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={f("body")}>Message (optional)</Label>
          <textarea
            id={f("body")}
            value={m.body}
            rows={2}
            maxLength={maxLength}
            onChange={(e) => set("email", { ...m, body: e.target.value })}
            className={textareaClass}
          />
        </div>
      </div>
    );
  }

  if (kind === "sms") {
    const s = values.sms;
    return (
      <div className="grid gap-4">
        <div>
          <Label htmlFor={f("sms-n")}>Phone number</Label>
          <Input
            id={f("sms-n")}
            type="tel"
            inputMode="tel"
            value={s.number}
            onChange={(e) => set("sms", { ...s, number: e.target.value })}
            placeholder="+1 306 555 0123"
          />
        </div>
        <div>
          <Label htmlFor={f("sms-m")}>Message (optional)</Label>
          <textarea
            id={f("sms-m")}
            value={s.message}
            rows={2}
            maxLength={maxLength}
            onChange={(e) => set("sms", { ...s, message: e.target.value })}
            className={textareaClass}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={f("tel")}>Phone number</Label>
      <Input
        id={f("tel")}
        type="tel"
        inputMode="tel"
        value={values.phone.number}
        onChange={(e) => set("phone", { number: e.target.value })}
        placeholder="+1 306 555 0123"
      />
      <p className="mt-2 text-xs text-ink-faint">
        Scanning offers to call this number.
      </p>
    </div>
  );
}
