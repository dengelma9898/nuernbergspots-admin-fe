import React, { RefObject } from 'react';
import { siInstagram, siFacebook, siTiktok } from 'simple-icons';
import LogoImage from '@/assets/Logo_nuernbergspots.png';
import { DesignSettings, GroupedEvent } from '@/components/events/image-editor/types';
import { formatDate, getEventDisplayText, hexToRgba } from '@/utils/eventImageEditorUtils';

interface EventImagePreviewCanvasProps {
  elementRef: RefObject<HTMLDivElement | null>;
  settings: DesignSettings;
  groupedEvents: GroupedEvent[];
  customTitle: string;
  categoryName: string;
  customEventTexts: Record<string, string>;
  backgroundImage: string | null;
}

export const EventImagePreviewCanvas: React.FC<EventImagePreviewCanvasProps> = ({
  elementRef,
  settings,
  groupedEvents,
  customTitle,
  categoryName,
  customEventTexts,
  backgroundImage,
}) => {
  return (
    <div
      ref={elementRef}
      className="rounded-xl shadow-lg relative overflow-hidden"
      style={{
        width: '1080px',
        minHeight: '1920px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor:
          settings.content.backgroundType === 'color' ? settings.content.backgroundColor : 'white',
        marginLeft: `${settings.content.horizontalMargin}rem`,
        marginRight: `${settings.content.horizontalMargin}rem`,
        paddingTop: '2rem',
        paddingBottom: '2rem',
      }}
    >
      {settings.content.backgroundType === 'image' && backgroundImage && (
        <>
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: settings.content.backgroundImageOpacity,
              mixBlendMode: settings.content.backgroundBlendMode,
            }}
          />
        </>
      )}
      <div
        className="relative z-10"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 'calc(1920px - 4rem)',
          paddingLeft: `${settings.content.contentStartMargin}rem`,
          paddingRight: `${settings.content.contentStartMargin}rem`,
        }}
      >
        <div
          className="w-full mb-4"
          style={{
            textAlign: settings.title.textAlign,
          }}
        >
          <h1
            className={`text-2xl sm:text-4xl font-black tracking-tight inline-block whitespace-pre-line ${
              settings.title.fontFamily === 'league-spartan'
                ? 'font-league-spartan'
                : settings.title.fontFamily === 'montserrat'
                  ? 'font-montserrat'
                  : settings.title.fontFamily === 'more-sugar'
                    ? 'font-more-sugar'
                    : 'font-sans'
            }`}
            style={{
              color: settings.title.color,
              fontSize: `${settings.title.fontSize}px`,
              backgroundColor: settings.title.backgroundTransparent
                ? 'transparent'
                : settings.title.showContainer
                  ? settings.title.backgroundColor
                  : 'transparent',
              borderRadius: '4px',
              WebkitTextStroke: '2px white',
              textShadow: '2px 2px 6px rgba(0,0,0,0.3)',
              border: settings.title.showBorder
                ? `2px solid ${settings.title.borderColor}`
                : 'none',
              padding: settings.title.showContainer ? '0.5rem 1rem' : '0',
              fontWeight: settings.title.fontWeight,
              transform: `rotate(${settings.title.rotation}deg)`,
            }}
          >
            {customTitle || categoryName}
          </h1>
        </div>

        <div
          className="rounded-lg overflow-hidden flex-1"
          style={{
            backgroundColor: hexToRgba(
              settings.content.backgroundColor,
              settings.content.containerOpacity
            ),
            padding: `${settings.content.contentPadding}rem`,
            paddingBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: `${settings.content.dateBlockSpacing}rem`,
          }}
        >
          {groupedEvents.map((group, groupIndex) => {
            const { dayDate } = formatDate(group.date.toISOString());
            return (
              <div key={groupIndex}>
                <div
                  className={
                    settings.date.fontFamily === 'more-sugar'
                      ? 'font-more-sugar'
                      : settings.date.fontFamily === 'league-spartan'
                        ? 'font-league-spartan'
                        : settings.date.fontFamily === 'montserrat'
                          ? 'font-montserrat'
                          : 'font-sans'
                  }
                  style={{
                    color: settings.content.textColor,
                    fontSize: `${settings.date.fontSize}px`,
                    fontWeight: settings.date.fontWeight,
                  }}
                >
                  {dayDate}
                </div>
                <div
                  style={{
                    marginTop: 0,
                    gap: `${settings.content.eventSpacing}rem`,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {group.events.map(event => {
                    const defaultText = getEventDisplayText(event);
                    const displayText = customEventTexts[event.id] ?? defaultText;

                    return (
                      <div
                        key={event.id}
                        className={
                          settings.event.fontFamily === 'league-spartan'
                            ? 'font-league-spartan'
                            : settings.event.fontFamily === 'montserrat'
                              ? 'font-montserrat'
                              : 'font-sans'
                        }
                        style={{
                          color: settings.content.textColor,
                          fontSize: `${settings.event.fontSize}px`,
                          fontWeight: settings.event.fontWeight,
                        }}
                      >
                        {displayText}
                        {(event.socialMedia?.instagram ||
                          event.socialMedia?.facebook ||
                          event.socialMedia?.tiktok) && (
                          <div
                            className={`flex items-center gap-2 mt-1 ${
                              settings.event.fontFamily === 'league-spartan'
                                ? 'font-league-spartan'
                                : settings.event.fontFamily === 'montserrat'
                                  ? 'font-montserrat'
                                  : 'font-sans'
                            }`}
                            style={{
                              color: settings.content.textColor,
                              fontSize: `${settings.event.fontSize}px`,
                              fontWeight: settings.event.fontWeight,
                            }}
                          >
                            {event.socialMedia?.instagram && (
                              <div className="flex items-center gap-1">
                                <svg
                                  role="img"
                                  viewBox="0 0 24 24"
                                  width={settings.event.fontSize}
                                  height={settings.event.fontSize}
                                  fill="currentColor"
                                >
                                  <path d={siInstagram.path} />
                                </svg>
                                <span>{event.socialMedia.instagram}</span>
                              </div>
                            )}
                            {event.socialMedia?.facebook && (
                              <div className="flex items-center gap-1">
                                <svg
                                  role="img"
                                  viewBox="0 0 24 24"
                                  width={settings.event.fontSize}
                                  height={settings.event.fontSize}
                                  fill="currentColor"
                                >
                                  <path d={siFacebook.path} />
                                </svg>
                                <span>{event.socialMedia.facebook}</span>
                              </div>
                            )}
                            {event.socialMedia?.tiktok && (
                              <div className="flex items-center gap-1">
                                <svg
                                  role="img"
                                  viewBox="0 0 24 24"
                                  width={settings.event.fontSize}
                                  height={settings.event.fontSize}
                                  fill="currentColor"
                                >
                                  <path d={siTiktok.path} />
                                </svg>
                                <span>{event.socialMedia.tiktok}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="flex justify-center items-center"
          style={{ marginTop: 'auto', paddingTop: '2rem' }}
        >
          <div
            className="rounded-full bg-black flex items-center justify-center overflow-hidden"
            style={{
              width: `${settings.logo.size}rem`,
              height: `${settings.logo.size}rem`,
            }}
          >
            <img src={LogoImage} alt="nuernbergspots.com" />
          </div>
        </div>
      </div>
    </div>
  );
};
