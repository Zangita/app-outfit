/**
 * Avatar ilustrado inspirado en Kenyi: cabello rizado oscuro con flequillo,
 * piel morena clara, collar dorado fino y una base neutra para vestir encima.
 */
export default function Avatar({ className }: { className?: string }) {
  const skin = "#c98d68";
  const skinShade = "#b87a55";
  const hair = "#2b1b16";
  const hairLight = "#4a2e24";
  const lips = "#a85860";
  const base = "#f6e3ea";
  const baseShade = "#eccbd8";

  return (
    <svg
      viewBox="0 0 300 560"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Avatar de Kenyi"
    >
      {/* ---- cabello detrás ---- */}
      <g fill={hair}>
        <circle cx="104" cy="86" r="34" />
        <circle cx="196" cy="86" r="34" />
        <circle cx="92" cy="122" r="30" />
        <circle cx="208" cy="122" r="30" />
        <circle cx="96" cy="158" r="26" />
        <circle cx="204" cy="158" r="26" />
        <circle cx="104" cy="190" r="22" />
        <circle cx="196" cy="190" r="22" />
        <circle cx="150" cy="70" r="44" />
        <rect x="92" y="90" width="116" height="100" rx="40" />
      </g>
      <g fill={hairLight} opacity="0.5">
        <circle cx="112" cy="102" r="10" />
        <circle cx="190" cy="96" r="9" />
        <circle cx="98" cy="140" r="8" />
        <circle cx="205" cy="172" r="8" />
      </g>

      {/* ---- cuello ---- */}
      <path d="M138 158 h24 v34 q-12 8 -24 0 z" fill={skinShade} />

      {/* ---- piernas ---- */}
      <g fill={skin}>
        <path d="M128 300 q-4 90 -3 150 q0 40 4 68 h18 q3 -60 1 -110 l2 -100 z" />
        <path d="M172 300 q4 90 3 150 q0 40 -4 68 h-18 q-3 -60 -1 -110 l-2 -100 z" />
      </g>
      {/* pies */}
      <g fill={skinShade}>
        <path d="M128 512 q-2 14 2 18 q10 4 18 0 q2 -8 1 -18 z" />
        <path d="M172 512 q2 14 -2 18 q-10 4 -18 0 q-2 -8 -1 -18 z" />
      </g>

      {/* ---- brazos ---- */}
      <g fill={skin}>
        <path d="M116 182 q-24 14 -28 60 q-3 40 2 74 q3 12 12 10 q8 -2 8 -14 q-2 -34 0 -62 q2 -30 14 -46 z" />
        <path d="M184 182 q24 14 28 60 q3 40 -2 74 q-3 12 -12 10 q-8 -2 -8 -14 q2 -34 0 -62 q-2 -30 -14 -46 z" />
      </g>
      {/* manos */}
      <circle cx="97" cy="328" r="10" fill={skin} />
      <circle cx="203" cy="328" r="10" fill={skin} />

      {/* ---- torso ---- */}
      <path
        d="M116 180 q34 -16 68 0 q10 40 6 78 q-4 34 -2 46 q-38 14 -76 0 q2 -12 -2 -46 q-4 -38 6 -78 z"
        fill={skin}
      />

      {/* ---- base neutra (top y short) ---- */}
      <path
        d="M118 208 q32 12 64 0 q6 28 4 52 q-36 12 -72 0 q-2 -24 4 -52 z"
        fill={base}
      />
      <path d="M118 208 q32 12 64 0 l-2 8 q-30 11 -60 0 z" fill={baseShade} />
      {/* tirantes */}
      <path d="M126 212 l4 -26 l6 2 l-4 26 z" fill={baseShade} />
      <path d="M174 212 l-4 -26 l-6 2 l4 26 z" fill={baseShade} />
      {/* short */}
      <path
        d="M112 258 q38 14 76 0 q6 22 4 44 l-30 4 l-8 -22 l-8 22 l-30 -4 q-2 -22 -4 -44 z"
        fill={baseShade}
      />

      {/* ---- collar dorado ---- */}
      <path d="M138 168 q12 14 24 0" stroke="#d4a643" strokeWidth="2" fill="none" />
      <circle cx="150" cy="177" r="3" fill="#e8c46a" />

      {/* ---- cabeza ---- */}
      <ellipse cx="150" cy="104" rx="40" ry="44" fill={skin} />
      {/* orejas y aretes */}
      <circle cx="110" cy="108" r="7" fill={skin} />
      <circle cx="190" cy="108" r="7" fill={skin} />
      <circle cx="110" cy="116" r="3" fill="none" stroke="#e8c46a" strokeWidth="1.6" />
      <circle cx="190" cy="116" r="3" fill="none" stroke="#e8c46a" strokeWidth="1.6" />

      {/* cejas */}
      <path d="M124 92 q8 -6 17 -2" stroke={hair} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M159 90 q9 -4 17 2" stroke={hair} strokeWidth="2.4" fill="none" strokeLinecap="round" />

      {/* ojos */}
      <g className="avatar-eyes">
        <ellipse cx="133" cy="103" rx="6.5" ry="4.8" fill="#fff" />
        <ellipse cx="167" cy="103" rx="6.5" ry="4.8" fill="#fff" />
        <circle cx="134" cy="103.5" r="3.4" fill="#3a241c" />
        <circle cx="166" cy="103.5" r="3.4" fill="#3a241c" />
        <circle cx="135" cy="102.3" r="1.1" fill="#fff" />
        <circle cx="167" cy="102.3" r="1.1" fill="#fff" />
        {/* pestañas */}
        <path d="M126 99 q7 -5 14 -2" stroke={hair} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M160 97 q7 -3 14 2" stroke={hair} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>

      {/* nariz */}
      <path d="M149 110 q-3 8 1 11 q2 2 4 0" stroke={skinShade} strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* labios */}
      <path d="M138 130 q6 -4 12 0 q6 -4 12 0 q-6 9 -12 9 q-6 0 -12 -9 z" fill={lips} />
      <path d="M141 131 q9 4 18 0" stroke="#8c454e" strokeWidth="1" fill="none" opacity="0.6" />

      {/* rubor */}
      <ellipse cx="122" cy="118" rx="7" ry="4" fill="#e59a86" opacity="0.45" />
      <ellipse cx="178" cy="118" rx="7" ry="4" fill="#e59a86" opacity="0.45" />

      {/* ---- flequillo rizado ---- */}
      <g fill={hair}>
        <circle cx="118" cy="70" r="16" />
        <circle cx="138" cy="60" r="17" />
        <circle cx="160" cy="58" r="16" />
        <circle cx="181" cy="66" r="15" />
        <circle cx="192" cy="82" r="12" />
        <circle cx="108" cy="84" r="13" />
        <circle cx="127" cy="76" r="11" />
        <circle cx="171" cy="72" r="11" />
        <circle cx="150" cy="68" r="12" />
      </g>
      <g fill={hairLight} opacity="0.5">
        <circle cx="132" cy="64" r="5" />
        <circle cx="166" cy="62" r="4.5" />
        <circle cx="118" cy="76" r="4" />
      </g>
      {/* rizos que caen a los lados */}
      <g fill={hair}>
        <circle cx="102" cy="146" r="14" />
        <circle cx="198" cy="146" r="14" />
        <circle cx="98" cy="172" r="12" />
        <circle cx="202" cy="172" r="12" />
        <circle cx="103" cy="196" r="10" />
        <circle cx="197" cy="196" r="10" />
        <circle cx="110" cy="216" r="8" />
        <circle cx="190" cy="216" r="8" />
      </g>
    </svg>
  );
}
