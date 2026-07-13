/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface GeometricRabbitIconProps {
  className?: string;
}

export default function GeometricRabbitIcon({ className = "w-6 h-6 text-bitcoin" }: GeometricRabbitIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* LEFT EAR */}
      {/* Outer Ear Shape */}
      <path
        d="M 36 44 L 25 6 C 24 4 28 3 30 6 L 48 44 Z"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Inner Ear Detail */}
      <path
        d="M 36 44 L 30 14 L 43 44"
        strokeWidth="2.5"
        opacity="0.7"
      />

      {/* RIGHT EAR */}
      {/* Outer Ear Shape */}
      <path
        d="M 64 44 L 75 6 C 76 4 72 3 70 6 L 52 44 Z"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Inner Ear Detail */}
      <path
        d="M 64 44 L 70 14 L 57 44"
        strokeWidth="2.5"
        opacity="0.7"
      />

      {/* HEAD / FACE SHAPE */}
      {/* Cheek outlines and Chin (Inverted Triangle of the face) */}
      <path
        d="M 26 52 L 50 86 L 74 52"
        strokeWidth="4"
      />
      {/* Forehead Bridge / Connection */}
      <path
        d="M 36 44 L 44 46 L 56 46 L 64 44"
        strokeWidth="3.5"
      />

      {/* FACIAL GEOMETRY & FACET LINES */}
      {/* Left Cheek inner facet */}
      <path d="M 26 52 L 50 68" strokeWidth="2.5" opacity="0.6" />
      {/* Right Cheek inner facet */}
      <path d="M 74 52 L 50 68" strokeWidth="2.5" opacity="0.6" />
      {/* Forehead V facets */}
      <path d="M 36 44 L 50 54 L 64 44" strokeWidth="2.5" opacity="0.6" />
      <path d="M 44 46 L 50 54 L 56 46" strokeWidth="2" opacity="0.5" />
      {/* Nose bridge center vertical line */}
      <path d="M 50 46 L 50 68" strokeWidth="3" opacity="0.8" />

      {/* EYES */}
      {/* Left eye facet */}
      <polygon
        points="37,51 43,52 39,55"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Right eye facet */}
      <polygon
        points="63,51 57,52 61,55"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
      />

      {/* NOSE & MOUTH */}
      {/* Cute little nose */}
      <polygon
        points="46,68 54,68 50,72"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Mouth cleft */}
      <path d="M 50 72 L 50 77" strokeWidth="3" />
      <path d="M 46 79 C 48 77 50 77 50 77 C 50 77 52 77 54 79" strokeWidth="2.5" />

      {/* WHISKERS */}
      {/* Left whiskers */}
      <path d="M 20 60 L 8 61" strokeWidth="2" opacity="0.5" />
      <path d="M 21 66 L 10 69" strokeWidth="2" opacity="0.5" />
      {/* Right whiskers */}
      <path d="M 80 60 L 92 61" strokeWidth="2" opacity="0.5" />
      <path d="M 79 66 L 90 69" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}
