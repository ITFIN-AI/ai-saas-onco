import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

interface OwnProps {
  pixelId?: string;
}

type Props = OwnProps;

const MetaPixel: React.FunctionComponent<Props> = ({ pixelId }) => {
  if (!pixelId) {
    return null;
  }

  return (
    <Helmet>
      <script id="pixel-script">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          `}
      </script>
      <noscript id="pixel-image">
        {`<img height="1" width="1" style="display:none" 
         src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`}
      </noscript>
    </Helmet>
  );
};

export const usePageView = () => {
  const location = useLocation();
  React.useEffect(() => {
    fbqTrackPageView();
  }, [location]);
};

interface MetaPixelEvent {
  name: string;
  data?: unknown;
}

const fbqTrack = (event: MetaPixelEvent) => {
  const fbq = (window as { fbq?: unknown }).fbq;
  if (fbq && typeof fbq === 'function') {
    fbq('track', event, event.data);
  }
};

const fbqTrackPageView = () => fbqTrack({ name: 'PageView' });

const fbqTrackCompleteRegistration = (status: boolean) =>
  fbqTrack({
    name: 'CompleteRegistration',
    data: { status },
  });

export { fbqTrackCompleteRegistration };
export default MetaPixel;
