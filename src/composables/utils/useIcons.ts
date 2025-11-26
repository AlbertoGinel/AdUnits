// composables/useIcons.ts
//import { computed } from 'vue'

// Define your icons as simple SVG strings
const iconLibrary = {
  imageTool: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16.7998 12.8001L13.3654 9.3657C13.0526 9.0529 12.5462 9.0529 12.2342 9.3657L8.7998 12.8001" stroke="#001E60" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4004 16.7999H4.80039C3.47479 16.7999 2.40039 15.7255 2.40039 14.3999V4.7999C2.40039 3.4743 3.47479 2.3999 4.80039 2.3999H14.4004C15.726 2.3999 16.8004 3.4743 16.8004 4.7999V14.3999C16.8004 15.7255 15.726 16.7999 14.4004 16.7999Z" stroke="#001E60" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12.8 16.8L7.76564 11.7656C7.45284 11.4528 6.94644 11.4528 6.63444 11.7656L2.75684 15.6432" stroke="#001E60" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.41194 6.98786C7.52909 7.10501 7.52909 7.29496 7.41194 7.41212C7.29478 7.52928 7.10483 7.52928 6.98767 7.41212C6.87052 7.29496 6.87052 7.10501 6.98767 6.98786C7.10483 6.8707 7.29478 6.8707 7.41194 6.98786" stroke="#001E60" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  textTool: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.50293 8.12839H12.505" stroke="#001E60" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.0038 8.12839V12.7136" stroke="#001E60" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="2.50098" y="2.50105" width="15.0062" height="15.0062" rx="4.16667" stroke="#001E60" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  `,

  logoTool: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M9.10836 17.3952V17.3952C5.26446 16.6264 2.49756 13.2514 2.49756 9.33133V6.66C2.49756 4.36111 4.36118 2.4975 6.66006 2.4975H13.3201C15.619 2.4975 17.4826 4.36111 17.4826 6.66V9.3313C17.4826 13.2513 14.7158 16.6263 10.8719 17.3952H10.8718C10.2897 17.5116 9.6904 17.5116 9.10836 17.3952Z" stroke="#001E60" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.82329 10.3139L6.92511 9.41745C6.70408 9.19686 6.62508 8.87113 6.72051 8.57379C6.81593 8.27646 7.06973 8.05753 7.37785 8.00677L8.56368 7.81138L9.27521 6.47656C9.41986 6.20518 9.70234 6.03564 10.0099 6.03564C10.3174 6.03564 10.5999 6.20518 10.7445 6.47656L11.4561 7.81138L12.6419 8.00678C12.95 8.05756 13.2038 8.27648 13.2992 8.5738C13.3946 8.87112 13.3156 9.19683 13.0946 9.41742L12.1964 10.3139L12.4122 11.7368C12.4586 12.0426 12.3316 12.349 12.0823 12.5323C11.8331 12.7155 11.5028 12.7455 11.2247 12.6101L10.0099 12.0186L8.79503 12.6101C8.5169 12.7455 8.1866 12.7155 7.93738 12.5322C7.68816 12.349 7.56112 12.0426 7.60749 11.7368L7.82329 10.3139Z" stroke="#001E60" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  plus: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>`,

  trash: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>`,
  // Add your 30 icons here...
} as const

export type IconName = keyof typeof iconLibrary

export function useIcons() {
  // Get SVG string for an icon
  const getIcon = (name: IconName): string => {
    return iconLibrary[name] || ''
  }

  // Check if icon exists
  const hasIcon = (name: string): name is IconName => {
    return name in iconLibrary
  }

  // Get all available icon names
  const getAvailableIcons = (): IconName[] => {
    return Object.keys(iconLibrary) as IconName[]
  }

  return {
    getIcon,
    hasIcon,
    getAvailableIcons,
  }
}
