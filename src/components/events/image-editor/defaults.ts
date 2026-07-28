import { DesignSettings } from './types';

export const defaultSettings: DesignSettings = {
  title: {
    fontSize: 100,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    shadowColor: '#000000',
    fontFamily: 'more-sugar',
    fontWeight: 700,
    backgroundTransparent: false,
    showBorder: false,
    showContainer: false,
    rotation: -2,
    textAlign: 'center',
  },
  content: {
    backgroundColor: '#414141',
    textColor: '#FFFFFF',
    horizontalMargin: 2,
    contentStartMargin: 3,
    contentPadding: 1,
    fontFamily: 'montserrat',
    fontWeight: 400,
    containerOpacity: 1,
    backgroundType: 'color',
    backgroundImageOpacity: 1,
    backgroundBlendMode: 'normal',
    eventSpacing: 2,
    dateBlockSpacing: 2,
  },
  date: {
    fontSize: 19,
    fontFamily: 'more-sugar',
    fontWeight: 600,
  },
  event: {
    fontSize: 19,
    fontFamily: 'montserrat',
    fontWeight: 500,
  },
  time: {
    fontSize: 19,
    fontFamily: 'montserrat',
    fontWeight: 400,
  },
  location: {
    fontSize: 19,
    fontFamily: 'montserrat',
    fontWeight: 400,
  },
  logo: {
    size: 10,
    opacity: 0.9,
  },
};
