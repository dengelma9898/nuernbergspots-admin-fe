import { Event } from '@/models/events';

export interface GroupedEvent {
  date: Date;
  events: Event[];
}

export interface DesignSettings {
  title: {
    fontSize: number;
    color: string;
    backgroundColor: string;
    borderColor: string;
    shadowColor: string;
    fontFamily: 'league-spartan' | 'montserrat' | 'more-sugar' | 'system-ui';
    fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    backgroundTransparent: boolean;
    showBorder: boolean;
    showContainer: boolean;
    rotation: number;
    textAlign: 'left' | 'center' | 'right';
  };
  content: {
    backgroundColor: string;
    textColor: string;
    horizontalMargin: number;
    contentStartMargin: number;
    contentPadding: number;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
    containerOpacity: number;
    backgroundType: 'image' | 'color';
    backgroundImageOpacity: number;
    backgroundBlendMode: 'normal' | 'multiply' | 'overlay' | 'screen';
    eventSpacing: number;
    dateBlockSpacing: number;
  };
  date: {
    fontSize: number;
    fontFamily: 'league-spartan' | 'montserrat' | 'more-sugar' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  event: {
    fontSize: number;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  time: {
    fontSize: number;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  location: {
    fontSize: number;
    fontFamily: 'league-spartan' | 'montserrat' | 'system-ui';
    fontWeight: 400 | 500 | 600 | 700;
  };
  logo: {
    size: number;
    opacity: number;
  };
}

export type DesignSettingsSection = keyof DesignSettings;
