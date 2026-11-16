import { useEffect, useState } from 'react';

// True kapag mobile/tablet ang screen (≤768px) — para sa mobile PWA design
// Pwede ring i-force: ?mobile=1 (mobile design) o ?mobile=0 (desktop design)
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    const forced = new URLSearchParams(window.location.search).get('mobile');
    if (forced === '1') return true;
    if (forced === '0') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => {
      const forced = new URLSearchParams(window.location.search).get('mobile');
      if (forced === '1' || forced === '0') return;
      setIsMobile(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
