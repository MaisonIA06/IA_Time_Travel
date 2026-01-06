/**
 * Icônes SVG futuristes - Remplace les emojis
 */

interface IconProps {
  size?: number
  className?: string
  color?: string
}

// Icône Temps/Horloge - Remplace ⏳
export function TimeIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`icon icon-time ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.5" />
      <path
        d="M12 7V12L15 14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Effet de rotation temporelle */}
      <path
        d="M12 2C6.48 2 2 6.48 2 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 3"
        className="time-spiral"
      />
      <path
        d="M22 12C22 17.52 17.52 22 12 22"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 3"
        className="time-spiral"
      />
    </svg>
  )
}

// Icône Quiz/Question - Remplace ❓
export function QuizIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`icon icon-quiz ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="1.5" />
      <path
        d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.3101 14.1354 11.4232 12.9502 11.8291C12.4301 12.0034 12 12.4477 12 13V14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill={color} />
      {/* Lignes décoratives */}
      <line x1="6" y1="1" x2="6" y2="3" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="1" x2="18" y2="3" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

// Icône Cible/Drag&Drop - Remplace 🎯
export function TargetIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`icon icon-target ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <circle cx="12" cy="12" r="2" fill={color} />
      {/* Lignes de visée */}
      <line x1="12" y1="2" x2="12" y2="6" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="1.5" />
      <line x1="2" y1="12" x2="6" y2="12" stroke={color} strokeWidth="1.5" />
      <line x1="18" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

// Icône Succès/Check - Remplace ✓
export function CheckIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`icon icon-check ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <path
        d="M7 12.5L10.5 16L17 8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Icône Erreur/Cross - Remplace ✗
export function CrossIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`icon icon-cross ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <path
        d="M8 8L16 16M16 8L8 16"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Icône Stats/Classement - Remplace 📊
export function StatsIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`icon icon-stats ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="12" width="4" height="9" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="10" y="6" width="4" height="15" rx="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
      <rect x="17" y="9" width="4" height="12" rx="1" stroke={color} strokeWidth="1.5" />
      <circle cx="5" cy="8" r="2" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="3" r="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.3" />
      <circle cx="19" cy="5" r="2" stroke={color} strokeWidth="1.5" />
      <path d="M5 8L12 3L19 5" stroke={color} strokeWidth="1" opacity="0.5" strokeDasharray="2 2" />
    </svg>
  )
}

// Icône Rejouer/Refresh - Remplace 🔄
export function RefreshIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`icon icon-refresh ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 12C4 7.58172 7.58172 4 12 4C15.0736 4 17.7455 5.69682 19.2109 8.19995"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 12C20 16.4183 16.4183 20 12 20C8.92638 20 6.25451 18.3032 4.78906 15.8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 8H20V3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 16H4V21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Icône Valider - Pour bouton de validation
export function ValidateIcon({ size = 24, className = '', color = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`icon icon-validate ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12L10 17L20 7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

