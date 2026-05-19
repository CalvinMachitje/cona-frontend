// frontend/src/pages/contact.tsx
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import type { ComponentType } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface InputFieldProps {
  label: string;
  name: keyof FormData;
  type: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  error?: string;
  required?: boolean;
}

interface InfoCardProps {
  icon: ComponentType<any>;
  title: string;
  lines: string[];
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Message must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    setSubmitError("");

    if (!validateForm()) return;

    const token = recaptchaRef.current?.getValue();

    if (!token) {
      setSubmitError("Please complete the reCAPTCHA verification.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke(
        "send-contact-message",
        {
          body: {
            ...formData,
            recaptchaToken: token,
          },
        }
      );

      if (error) {
        throw new Error(
          error.message || "Unable to send message."
        );
      }

      setSent(true);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      recaptchaRef.current?.reset();
    } catch (err: unknown) {
      console.error("Contact form error:", err);

      setSubmitError(
        err instanceof Error
          ? err.message
          : "Unable to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <CheckCircle2
            size={80}
            className="text-green-500 mx-auto mb-6"
          />

          <h1 className="font-display text-5xl mb-4 text-white">
            Thank You!
          </h1>

          <p className="text-zinc-400 mb-8">
            Your message has been received.
            <br />
            We will get back to you within 24 hours.
          </p>

          <Link
            to="/"
            className="inline-block bg-primary text-white px-10 py-4 rounded-lg font-semibold tracking-wider hover:bg-primary/90 transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.5em] text-primary mb-4">
            GET IN TOUCH
          </p>

          <h1 className="font-display text-6xl md:text-7xl text-white mb-6">
            Say <span className="text-primary">Hello</span>
          </h1>

          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Questions, private events, partnerships — we’d love to hear
            from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <InfoCard
              icon={MapPin}
              title="Visit Us"
              lines={["Coligny, North West"]}
            />

            <InfoCard
              icon={Phone}
              title="Call Us"
              lines={["083 200 2516"]}
            />

            <InfoCard
              icon={Mail}
              title="Email"
              lines={["hello@conalounge.co.za"]}
            />

            <InfoCard
              icon={Clock}
              title="Opening Hours"
              lines={["Monday - Sunday: 10:00 AM – 2:00 AM"]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl">
              {submitError && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-2xl mb-6">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />

                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />

                <InputField
                  label="Subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  error={errors.subject}
                  required
                />

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Message
                  </label>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    placeholder="Tell us more about your inquiry..."
                    className={`w-full bg-zinc-950 border ${
                      errors.message
                        ? "border-red-500"
                        : "border-zinc-700 focus:border-primary"
                    } rounded-2xl py-4 px-5 text-white focus:outline-none transition resize-y`}
                  />

                  {errors.message && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-center py-4">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    theme="dark"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-all text-white py-5 rounded-2xl font-semibold text-lg mt-4"
                >
                  {loading ? "Sending Message..." : "Send Message"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  type,
  value,
  onChange,
  error,
  required = false,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-zinc-950 border ${
          error
            ? "border-red-500"
            : "border-zinc-700 focus:border-primary"
        } rounded-2xl py-4 px-5 text-white focus:outline-none transition`}
      />

      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  lines,
}: InfoCardProps) {
  return (
    <div className="flex gap-5 bg-zinc-900 border border-zinc-800 hover:border-primary/50 transition-colors rounded-3xl p-8 group">
      <div className="w-14 h-14 shrink-0 rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon size={26} className="text-primary" />
      </div>

      <div>
        <h3 className="font-display text-2xl text-white mb-3">
          {title}
        </h3>

        {lines.map((line, i) => (
          <p key={i} className="text-zinc-400 leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}