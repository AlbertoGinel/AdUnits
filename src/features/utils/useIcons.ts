// composables/useIcons.ts
//import { computed } from 'vue'

// Define your icons as simple SVG strings
const iconLibrary = {
  imageTool: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16.7998 12.8001L13.3654 9.3657C13.0526 9.0529 12.5462 9.0529 12.2342 9.3657L8.7998 12.8001" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4004 16.7999H4.80039C3.47479 16.7999 2.40039 15.7255 2.40039 14.3999V4.7999C2.40039 3.4743 3.47479 2.3999 4.80039 2.3999H14.4004C15.726 2.3999 16.8004 3.4743 16.8004 4.7999V14.3999C16.8004 15.7255 15.726 16.7999 14.4004 16.7999Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12.8 16.8L7.76564 11.7656C7.45284 11.4528 6.94644 11.4528 6.63444 11.7656L2.75684 15.6432" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.41194 6.98786C7.52909 7.10501 7.52909 7.29496 7.41194 7.41212C7.29478 7.52928 7.10483 7.52928 6.98767 7.41212C6.87052 7.29496 6.87052 7.10501 6.98767 6.98786C7.10483 6.8707 7.29478 6.8707 7.41194 6.98786" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  textTool: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.50293 8.12839H12.505" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.0038 8.12839V12.7136" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="2.50098" y="2.50105" width="15.0062" height="15.0062" rx="4.16667" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  `,

  logoTool: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M9.10836 17.3952V17.3952C5.26446 16.6264 2.49756 13.2514 2.49756 9.33133V6.66C2.49756 4.36111 4.36118 2.4975 6.66006 2.4975H13.3201C15.619 2.4975 17.4826 4.36111 17.4826 6.66V9.3313C17.4826 13.2513 14.7158 16.6263 10.8719 17.3952H10.8718C10.2897 17.5116 9.6904 17.5116 9.10836 17.3952Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M7.82329 10.3139L6.92511 9.41745C6.70408 9.19686 6.62508 8.87113 6.72051 8.57379C6.81593 8.27646 7.06973 8.05753 7.37785 8.00677L8.56368 7.81138L9.27521 6.47656C9.41986 6.20518 9.70234 6.03564 10.0099 6.03564C10.3174 6.03564 10.5999 6.20518 10.7445 6.47656L11.4561 7.81138L12.6419 8.00678C12.95 8.05756 13.2038 8.27648 13.2992 8.5738C13.3946 8.87112 13.3156 9.19683 13.0946 9.41742L12.1964 10.3139L12.4122 11.7368C12.4586 12.0426 12.3316 12.349 12.0823 12.5323C11.8331 12.7155 11.5028 12.7455 11.2247 12.6101L10.0099 12.0186L8.79503 12.6101C8.5169 12.7455 8.1866 12.7155 7.93738 12.5322C7.68816 12.349 7.56112 12.0426 7.60749 11.7368L7.82329 10.3139Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  plus: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>`,

  aderizeLogo: `<svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15.7564 13.8936H13.1404C13.0382 13.8936 12.945 13.8351 12.9012 13.7425L11.4199 10.6361C11.3984 10.5909 11.3645 10.5528 11.3221 10.526C11.2798 10.4993 11.2308 10.4851 11.1807 10.485H6.78399C6.5891 10.485 6.46068 10.2816 6.54478 10.1054L7.32321 8.47187C7.34465 8.42659 7.37852 8.38834 7.42088 8.36158C7.46323 8.33482 7.51232 8.32065 7.56242 8.32073H13.5194L15.9962 13.5141C16.0803 13.6902 15.9519 13.8936 15.757 13.8936H15.7564Z" fill="#BBD75A"/>
  <path d="M12.781 6.77236H9.57754L8.11386 3.70522C8.07806 3.63022 7.97067 3.63022 7.93487 3.70522L3.1353 13.7692C3.11747 13.8065 3.08943 13.838 3.05443 13.86C3.01944 13.882 2.97891 13.8937 2.93756 13.8936H0.219302C0.0585013 13.8936 -0.0477518 13.726 0.0215684 13.5805L6.43881 0.125004C6.47517 0.0488651 6.55245 0 6.63654 0H9.41276C9.49742 0 9.57413 0.0482969 9.61049 0.124436L12.7816 6.77179L12.781 6.77236Z" fill="#BBD75A"/>
  <path d="M23.9998 6.95635C23.9998 10.212 21.7641 12.9451 18.7436 13.7032C18.2621 13.825 17.7618 13.8962 17.2461 13.9087L16.0036 11.3059H17.0435C19.4448 11.3059 21.393 9.35766 21.393 6.95635C21.393 4.55504 19.4448 2.60678 17.0435 2.60678H11.855L10.6113 1.90735e-06H17.0435C17.6303 1.90735e-06 18.1995 0.072286 18.7436 0.209455C21.7641 0.967584 23.9998 3.70015 23.9998 6.95635Z" fill="#BBD75A"/>
</svg>`,

  notificationBell: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11.5479 17.0161H8.45117" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M14.8385 7.36966V7.33869V7.33869C14.8385 4.66677 12.6717 2.5 9.99976 2.5V2.5C7.32783 2.5 5.16106 4.66677 5.16106 7.33869V7.33869V7.36966V9.76191C5.16106 10.0755 4.98397 10.3609 4.70429 10.5013L4.21752 10.7442C3.60978 11.049 3.22559 11.6703 3.22559 12.3496V12.3496C3.22559 13.3406 4.02881 14.1438 5.01977 14.1438H14.9797C15.9707 14.1438 16.7739 13.3406 16.7739 12.3496V12.3496C16.7739 11.6703 16.3897 11.049 15.782 10.7451L15.2952 10.5022C15.0155 10.3609 14.8385 10.0755 14.8385 9.76191V7.36966Z" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  chatBubble: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.9163 12.0833H7.08301" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.08301 8.75H12.9163" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M3.45917 13.6633C2.85083 12.58 2.5 11.3317 2.5 10C2.5 5.8575 5.8575 2.5 10 2.5C14.1425 2.5 17.5 5.8575 17.5 10C17.5 14.1425 14.1425 17.5 10 17.5C8.66833 17.5 7.42 17.1492 6.33667 16.5408L2.5 17.5L3.45917 13.6633Z" stroke="white" stroke-width="1.3235" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  extras: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.5061 6.06685V8.7513H17.507C17.1181 8.67281 16.7153 8.69899 16.3398 8.82717C15.642 9.06574 15.1126 9.64161 14.9334 10.357C14.7649 11.0162 14.9103 11.7163 15.3273 12.254C15.7444 12.7916 16.3863 13.1066 17.0668 13.1073C17.2146 13.107 17.362 13.0922 17.507 13.0631V15.7476C17.507 16.2143 17.3216 16.662 16.9915 16.992C16.6615 17.3221 16.2138 17.5075 15.7471 17.5075H13.0626C13.1411 17.1185 13.1149 16.7166 12.9867 16.3411C12.7482 15.6433 12.1723 15.1139 11.4569 14.9347C10.7977 14.7662 10.0976 14.9116 9.55992 15.3286C9.02227 15.7457 8.70735 16.3877 8.70663 17.0681C8.70688 17.2159 8.72168 17.3634 8.75082 17.5083L6.0672 17.5075C5.09549 17.5076 4.30758 16.7201 4.3073 15.7484V13.0639C4.16238 13.0931 4.01494 13.1079 3.86712 13.1081C3.18667 13.1074 2.5447 12.7925 2.12765 12.2548C1.7106 11.7172 1.56521 11.0171 1.73373 10.3578C1.91292 9.64244 2.44234 9.06658 3.14015 8.828C3.51562 8.69983 3.91839 8.67365 4.3073 8.75214H4.30647V6.06769C4.30643 5.60092 4.49184 5.15326 4.82189 4.82321C5.15194 4.49316 5.5996 4.30775 6.06637 4.30779H8.75082C8.72168 4.16287 8.70688 4.01543 8.70663 3.8676C8.70735 3.18716 9.02227 2.54519 9.55992 2.12814C10.0976 1.71109 10.7977 1.5657 11.4569 1.73422C12.172 1.91392 12.7477 2.44314 12.9867 3.14063C13.1149 3.51611 13.1411 3.91888 13.0626 4.30779H15.7471C16.2138 4.30775 16.6615 4.49316 16.9915 4.82321C17.3216 5.15326 17.507 5.60092 17.507 6.06769" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  back: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15.0068 12.5051V15.0062C15.0068 16.3875 13.8871 17.5072 12.5058 17.5072H5.00267C3.62138 17.5072 2.50163 16.3875 2.50163 15.0062V5.00202C2.50163 3.62073 3.62138 2.50098 5.00267 2.50098H12.5058C13.8871 2.50098 15.0068 3.62073 15.0068 5.00202V7.50306" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.0039 12.5053L7.50286 10.0042L10.0039 7.50317" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17.5078 10.004H7.50365" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  help: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 9.40909C2.5 11.6449 3.68333 13.6133 5.49917 14.8541C5.49833 15.5666 5.5 16.5266 5.5 17.5341L8.4425 16.0783C8.94583 16.1749 9.46583 16.2274 10 16.2274C14.1267 16.2274 17.5 13.1916 17.5 9.40909C17.5 5.62659 14.1267 2.59076 10 2.59076C5.87333 2.59076 2.5 5.62659 2.5 9.40909Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.9157 10.2733V10.1008C9.9157 9.53578 10.2649 9.22995 10.6149 8.99495C10.9565 8.76495 11.299 8.46495 11.299 7.91161C11.299 7.14745 10.6799 6.52911 9.91654 6.52911C9.1532 6.52911 8.5332 7.14661 8.5332 7.91078" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.91584 12.2224C9.84667 12.2224 9.79084 12.2782 9.79167 12.3474C9.79167 12.4166 9.8475 12.4724 9.91667 12.4724C9.98584 12.4724 10.0417 12.4166 10.0417 12.3474C10.0417 12.2782 9.98667 12.2224 9.91584 12.2224" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  addCircle: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8.00033 5.33334V10.6667" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.6663 7.99999H5.33301" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M8 14V14C4.686 14 2 11.314 2 8V8C2 4.686 4.686 2 8 2V2C11.314 2 14 4.686 14 8V8C14 11.314 11.314 14 8 14Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  backCircle: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M8 2V2C11.314 2 14 4.686 14 8V8C14 11.314 11.314 14 8 14V14C4.686 14 2 11.314 2 8V8C2 4.686 4.686 2 8 2Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5.33301 8.00008H10.6663" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.33301 10L5.33301 8L7.33301 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  check: `<svg width="9" height="6" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.86281 0.179499C7.20576 -0.0869497 7.70155 -0.0555003 8.0079 0.265437C8.33458 0.607874 8.32236 1.15069 7.98 1.47749L3.87509 5.3949C3.58529 5.67153 3.14993 5.70614 2.82375 5.4987L2.69094 5.3949L0.265714 3.08017L0.205447 3.01655C-0.0771441 2.68646 -0.0695979 2.18927 0.236697 1.86812C0.543122 1.5471 1.03995 1.51551 1.3829 1.78218L1.44875 1.84021L3.28246 3.5891L6.79585 0.236419L6.86281 0.179499Z" fill="currentColor"/>
</svg>`,

  cross: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4 9L9 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 9L4 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  addImage: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11.5883 12.5885L11.5885 12.5883C11.6372 12.5394 11.6372 12.4603 11.5883 12.4116C11.5395 12.3628 11.4604 12.3628 11.4116 12.4116C11.3628 12.4604 11.3628 12.5395 11.4116 12.5883C11.4603 12.6372 11.5394 12.6372 11.5883 12.5885" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3 13.85C3.29877 13.804 3.6005 13.7799 3.90278 13.7778V13.7778C7.39291 13.7778 10.2222 16.6071 10.2222 20.0972C10.2194 20.3995 10.1953 20.7012 10.15 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="3" y="8.00002" width="13" height="13" rx="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 4H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 6V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 9V15C20 16.6569 18.6569 18 17 18H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6 8V7C6 5.34315 7.34315 4 9 4H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  vectorialCursor: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M3.50122 11.088H2.33406C2.01181 11.0878 1.7506 10.8266 1.75049 10.5044V9.33722C1.7506 9.01497 2.01181 8.75376 2.33406 8.75365H3.50122C3.82347 8.75376 4.08468 9.01497 4.08479 9.33722V10.5044C4.08468 10.8266 3.82347 11.0878 3.50122 11.088Z" stroke="currentColor" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5041 4.08502H9.33699C9.01474 4.08491 8.75353 3.8237 8.75342 3.50145V2.33429C8.75353 2.01204 9.01474 1.75083 9.33699 1.75072H10.5041C10.8264 1.75083 11.0876 2.01204 11.0877 2.33429V3.50145C11.0876 3.8237 10.8264 4.08491 10.5041 4.08502V4.08502Z" stroke="currentColor" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8.75373 2.91789H7.29479C4.87754 2.91789 2.91797 4.87746 2.91797 7.29472V8.75366" stroke="currentColor" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M11.8536 9.42387L10.391 10.0387C10.2329 10.1051 10.1071 10.2309 10.0406 10.3889L9.42456 11.8535C9.31684 12.1093 9.05989 12.2696 8.78282 12.254C8.50575 12.2384 8.26846 12.0502 8.19017 11.7839L7.03063 7.84487C6.96281 7.61454 7.02626 7.36555 7.19606 7.19578C7.36586 7.02602 7.61485 6.9626 7.84517 7.03047L11.7841 8.1896C12.0503 8.26783 12.2386 8.50513 12.2542 8.78222C12.2698 9.05931 12.1094 9.31624 11.8536 9.42387Z" stroke="currentColor" stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round"/>
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
