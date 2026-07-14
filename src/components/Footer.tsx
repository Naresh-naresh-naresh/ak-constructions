import Link from "next/link";
import { clientConfig } from "@/config/client";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-stone-200 bg-white px-4 py-12 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold text-stone-900">
            {clientConfig.name}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            {clientConfig.tagline}. Serving {clientConfig.serviceAreas.join(", ")}.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-stone-900">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <a
                href={`tel:${clientConfig.phone.replace(/\s/g, "")}`}
                className="hover:text-orange-600"
              >
                {clientConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${clientConfig.email}`}
                className="hover:text-orange-600"
              >
                {clientConfig.email}
              </a>
            </li>
            <li>{clientConfig.city}</li>
            <li>
              <Link href="/track" className="font-medium hover:text-orange-600">
                Track My Project →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-stone-900">Service areas</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            {clientConfig.serviceAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-stone-200 pt-6 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} {clientConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
